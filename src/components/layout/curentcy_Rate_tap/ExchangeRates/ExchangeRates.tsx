import { useState, useEffect, useRef, useCallback } from "react";
import "./ExchangeRates.css";
import {
  ExchangeRateService,
  ExclusiveRateService,
  type CurrencyData,
  type UpdateExchangeRateData,
} from "../../../../services/currency.service";
import React from "react";
import { e, evaluate } from "mathjs";
import Swal from "sweetalert2";
import { useSSE } from "../../../../services/sse.service";
import { Minus, Plus } from "lucide-react";

export default function ExchangeRates() {
  const [ExchangeRates, setExchangeRates] = useState<CurrencyData[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [conflictIds, setConflictIds] = useState<
    { id: string; text: string }[]
  >([]);
  const [previews, setPreviews] = useState<
    Record<string, { buy: number | null; sell: number | null }>
  >({});

  const formulaRefs = useRef<
    Record<
      string,
      {
        name: HTMLInputElement | null;
        formula_buy: HTMLInputElement | null;
        formula_sell: HTMLInputElement | null;
        range_start: HTMLInputElement | null;
        range_stop: HTMLInputElement | null;
      }
    >
  >({});

  const originalValues = useRef<
    Record<
      string,
      {
        name: string;
        formula_buy: string;
        formula_sell: string;
        range_start: string;
        range_stop: string;
      }
    >
  >({});

  const loadExchangRate = async () => {
    const data = await ExchangeRateService.getAll();
    const newData = Object.values(data).filter(
      (item) => item.currencyInfo.code !== "THB",
    ) as CurrencyData[];
    setExchangeRates(newData);
    // บันทึกค่าเดิมไว้เปรียบเทียบตอน save
    const origMap: typeof originalValues.current = {};
    for (const group of newData) {
      for (const rate of group.rates) {
        origMap[rate.id] = {
          name: rate.name ?? "",
          formula_buy: rate.formula_buy ?? "BASE",
          formula_sell: rate.formula_sell ?? "BASE",
          range_start: String(rate.range_start ?? ""),
          range_stop: String(rate.range_stop ?? ""),
        };
      }
    }
    originalValues.current = origMap;
    setIsChanged(false);
    setLoading(false);
  };

  useEffect(() => {
    loadExchangRate();
  }, []);

  useSSE(() => {
    loadExchangRate();
  });
  // รับสัญญาณ SSE จาก Backend เพื่อ reload ข้อมูลอัตโนมัติ
  const handleSSERefresh = useCallback(() => {
    loadExchangRate();
  }, []);
  useSSE(handleSSERefresh);

  const mathjsFormula = (formula: string, baseValue: number): number | null => {
    if (!formula || formula.toUpperCase() === "BASE") return baseValue;
    if (formula.length > 100) return null;
    try {
      const scope = { BASE: baseValue, base: baseValue };
      const result = evaluate(formula, scope);
      const finalValue = Number(result);
      if (isNaN(finalValue) || !isFinite(finalValue)) return null;
      const MAX_DB_VALUE = 99999999999.9999;
      if (Math.abs(finalValue) > MAX_DB_VALUE) return null;
      return parseFloat(finalValue.toFixed(6));
    } catch {
      return null;
    }
  };

  const checkIsChanged = () => {
    const changed = Object.entries(formulaRefs.current).some(([id, refs]) => {
      const orig = originalValues.current[id];
      if (!orig) return true;
      return (
        (refs.name?.value ?? "") !== orig.name ||
        (refs.formula_buy?.value || "BASE") !== orig.formula_buy ||
        (refs.formula_sell?.value || "BASE") !== orig.formula_sell ||
        (refs.range_start?.value ?? "") !== orig.range_start ||
        (refs.range_stop?.value ?? "") !== orig.range_stop
      );
    });
    setIsChanged(changed);
  };

  const computePreview = (
    rateId: string,
    buyBase: number,
    sellBase: number,
  ) => {
    const refs = formulaRefs.current[rateId];
    if (!refs) return;
    const buyFormula = refs.formula_buy?.value || "BASE";
    const sellFormula = refs.formula_sell?.value || "BASE";
    const buyResult = mathjsFormula(buyFormula, buyBase);
    const sellResult = mathjsFormula(sellFormula, sellBase);
    setPreviews((prev) => ({
      ...prev,
      [rateId]: { buy: buyResult, sell: sellResult },
    }));
    checkIsChanged();

    // เช็คว่า buy result มากกว่า sell result หรือไม่
    if (buyResult !== null && sellResult !== null && buyResult > sellResult) {
      setConflictIds((prev) => {
        const msg = `Buy rate (${buyResult}) cannot be greater than Sell rate (${sellResult})`;
        if (!prev.find((c) => c.id === rateId)) {
          return [...prev, { id: rateId, text: msg }];
        }
        return prev.map((c) => (c.id === rateId ? { ...c, text: msg } : c));
      });
    } else {
      // ถ้าไม่มีปัญหาเรื่อง buy > sell ให้ลบ error นี้ออก (แต่ยังคง error อื่นๆ ไว้)
      setConflictIds((prev) => {
        const existing = prev.find((c) => c.id === rateId);
        if (existing?.text.startsWith("Buy rate")) {
          return prev.filter((c) => c.id !== rateId);
        }
        return prev;
      });
    }
  };

  const checkForConflicts = (rateId: string) => {
    const refs = formulaRefs.current[rateId];
    if (!refs) return;

    const buyForm = refs.formula_buy?.value || "";
    const sellForm = refs.formula_sell?.value || "";
    const startVal = refs.range_start?.value;
    const stopVal = refs.range_stop?.value;

    let error: string | null = null;

    // Validate Realtime
    const checkFormula = (formula: string): string | null => {
      if (!formula) return null;
      const forbiddenChars = formula.replace(/[0-9.+\-*/^()\s]|BASE/gi, "");
      if (forbiddenChars.length > 0)
        return `Forbidden characters: ${forbiddenChars}`;
      if (/[+\-*/]{2,}/.test(formula.replace(/\s/g, ""))) {
        if (!/[+\-*/]-/.test(formula)) return "Invalid operator sequence";
      }
      return null;
    };

    const buyErr = checkFormula(buyForm);
    if (buyErr) error = `BUY Formula: ${buyErr}`;

    const sellErr = checkFormula(sellForm);
    if (!error && sellErr) error = `SELL Formula: ${sellErr}`;

    if (!error) {
      const start = parseFloat(startVal || "");
      const stop = parseFloat(stopVal || "");
      if (!isNaN(start) && !isNaN(stop) && start >= stop) {
        error = "Range start must be less than range stop";
      }
    }

    setConflictIds((prev) => {
      if (error) {
        if (!prev.find((c) => c.id === rateId)) {
          return [...prev, { id: rateId, text: error }];
        }
        return prev.map((c) =>
          c.id === rateId ? { ...c, text: error as string } : c,
        );
      }
      return prev.filter((c) => c.id !== rateId);
    });
    checkIsChanged();
  };

  const handleSave = async () => {
    if (!ExchangeRates) return;

    if (conflictIds.length > 0) {
      await Swal.fire({
        icon: "error",
        title: "Cannot Save",
        html: `<div>The following issues must be resolved before saving:<ul
        style="display:flex; 
        flex-direction:column; align-items:flex-start; padding-left:1.5rem; list-style-type:disc; margin-top:0.5rem;"
        >${conflictIds.map((c) => `<li>${c.text}</li>`).join("")}</ul></div>`,
      });
      return;
    }
    try {
      console.log("Preparing to save changed entries only");

      const changedEntries = Object.entries(formulaRefs.current).filter(
        ([ids, refs]) => {
          const orig = originalValues.current[ids];
          if (!orig) return true; // ถ้าไม่มี original ให้ส่งเสมอ
          return (
            (refs.name?.value ?? "") !== orig.name ||
            (refs.formula_buy?.value || "BASE") !== orig.formula_buy ||
            (refs.formula_sell?.value || "BASE") !== orig.formula_sell ||
            (refs.range_start?.value ?? "") !== orig.range_start ||
            (refs.range_stop?.value ?? "") !== orig.range_stop
          );
        },
      );

      if (changedEntries.length === 0) {
        await Swal.fire({
          icon: "info",
          title: "No Changes",
          text: "No changes detected.",
        });
        return;
      }

      const updates: UpdateExchangeRateData[] = changedEntries.map(
        ([ids, refs]) => ({
          id: ids,
          name: refs.name?.value || "",
          formula_buy: refs.formula_buy?.value || "BASE",
          formula_sell: refs.formula_sell?.value || "BASE",
          range_start: parseFloat(refs.range_start?.value || "") || 0,
          range_stop: parseFloat(refs.range_stop?.value || "") || 0,
        }),
      );
      await ExchangeRateService.bulkUpdate(updates);
    } catch (err: any) {
      console.error("Error during bulk update:", err.response.massage || err);
      await Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "An error occurred while saving. Please try again.",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "Save Successful",
      html: `<div>All formulas have been saved successfully.</div>`,
    });
    loadExchangRate(); // รีโหลดข้อมูลใหม่จาก server หลังบันทึก เพื่อให้แน่ใจว่าแสดงข้อมูลที่อัพเดตแล้ว
    // ทำการ Save ต่อไป
  };
  const AddExchangeRate = async (currencyId: string) => {
    try {
      await ExchangeRateService.addRate(currencyId);
      await Swal.fire({
        icon: "success",
        title: "Add Successful",
        html: `<div>A new exchange rate entry has been added for this currency.</div>`,
      });
      loadExchangRate(); // รีโหลดข้อมูลใหม่จาก server หลังเพิ่มเรท เพื่อให้แน่ใจว่าแสดงข้อมูลที่อัพเดตแล้ว
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Add Failed",
        text: "An error occurred while adding a new exchange rate. Please try again.",
      });
    }
  };

  const DeleteExchangeRate = async (currencyId: string) =>
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the exchange rate entry permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "var(--btn-delete)",
      cancelButtonColor: 'var(--btn-add)',
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await ExchangeRateService.delete(currencyId);
          await Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The exchange rate entry has been deleted.",
          });
          loadExchangRate(); // รีโหลดข้อมูลใหม่จาก server หลังลบเรท เพื่อให้แน่ใจว่าแสดงข้อมูลที่อัพเดตแล้ว
        }
          catch (err : any) {
            await Swal.fire({
              icon: "error",
              title: "Delete Failed",
              text: err.response?.data?.message || "An error occurred while deleting the exchange rate. Please try again.",
            });
          }
        }
      });

  if (loading) return <div className="cr-loading">Loading data...</div>;

  return (
    <div className="er-wrap">
      {/* ===== Toolbar ===== */}
      <div className="er-toolbar">
        <div className="er-toolbar-left">
          <label className="crb-label">Extan Currencies</label>
          <p className="er-status-chang">
            {isChanged && "⚠ มีการแก้ไขที่ยังไม่ได้บันทึก"}
          </p>
        </div>
        <button className="er-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Formulas"}
        </button>
      </div>

      {/* ===== Table ===== */}
      {ExchangeRates ? (
        <div className="table-container">
          <table className="table er-table">
            <thead>
              {/* Row 1: group headers */}
              <tr>
                <th className="er-th" rowSpan={2}>
                  Code
                </th>
                <th className="er-th" rowSpan={2}>
                  name
                </th>
                <th className="er-th" rowSpan={2}>
                  Denomination
                </th>
                <th className="er-th er-th--buy" colSpan={3}>
                  BUY Formula
                </th>
                <th className="er-th er-th--sell" colSpan={3}>
                  SELL Formula
                </th>
              </tr>
              {/* Row 2: sub headers */}
              <tr className="er-sub-row">
                <th className="er-th-sub">Formula</th>
                <th className="er-th-sub">Base</th>
                <th className="er-th-sub er-th-sub--result">Result</th>
                <th className="er-th-sub">Formula</th>
                <th className="er-th-sub">Base</th>
                <th className="er-th-sub er-th-sub--result-sell">Result</th>
              </tr>
            </thead>
            <tbody>
              {ExchangeRates.map((currencyGroup, idms) => {
                return (
                  // ใช้ React.Fragment เพื่อจัดกลุ่มแถวของแต่ละสกุลเงิน โดยไม่สร้างแท็กแปลกปลอมใน HTML
                  <React.Fragment key={currencyGroup.currencyInfo.id}>
                    {/* วนลูปสร้างแถว (Row) ตามจำนวนเรทที่มีในสกุลเงินนั้นๆ */}
                    {currencyGroup.rates.map((rate, idx) => {
                      // 🚩 ป้องกัน Error: ตรวจสอบและสร้าง object ใน ref ไว้รอรับค่าจาก input
                      if (!formulaRefs.current[rate.id]) {
                        formulaRefs.current[rate.id] = {
                          name: null,
                          formula_buy: null,
                          formula_sell: null,
                          range_start: null,
                          range_stop: null,
                        };
                      }

                      return (
                        <React.Fragment key={rate.id}>
                          {/* ระวัง: Tailwind ใช้ hover:bg-gray-50 ไม่ต้องมี Backslash (\) */}
                          {idx === 0 && (
                            <tr
                              className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${idms % 2 !== 0 ? "main-row-alt" : ""}`}
                            >
                              <td
                                className="er-td er-td--code font-bold align-middle border-r border-gray-100"
                                rowSpan={
                                  currencyGroup.rates.length +
                                  1 +
                                  currencyGroup.rates.filter((r) =>
                                    conflictIds.some((c) => c.id === r.id),
                                  ).length
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    translate="no"
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600"
                                  >
                                    {currencyGroup.currencyInfo.code}
                                    <button
                                      className="exchange-add-btn"
                                      onClick={() => {
                                        AddExchangeRate(
                                          currencyGroup.currencyInfo.id,
                                        );
                                      }}
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr
                            className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${idms % 2 !== 0 ? "main-row-alt" : ""}`}
                          >
                            {/* --- 1. ชื่อสกุลเงิน (แสดงแค่แถวแรกสุดของกลุ่ม แล้วใช้ rowSpan รวมแถว) --- */}

                            <td className="er-td text-center">
                              <div className="er-td--name">
                                <input
                                  type="text"
                                  defaultValue={rate.name}
                                  className="er-formula-input name er-formula-input--buy"
                                  translate="no"
                                  ref={(el) => {
                                    formulaRefs.current[rate.id].name = el;
                                  }}
                                  onChange={() => checkIsChanged()}
                                />
                                <button
                                  className="exchange-delete-btn"
                                  onClick={() => {
                                    DeleteExchangeRate(
                                      rate.id,
                                    );
                                  }}
                                >
                                  <Minus size={12} />
                                </button>
                              </div>
                            </td>
                            {/* --- 2. ช่วงเรท (Range) --- */}
                            <td className="er-td text-center er-td--range border-r border-gray-100 contains-range">
                              <input
                                type="number"
                                defaultValue={rate.range_start}
                                ref={(el) => {
                                  formulaRefs.current[rate.id].range_start = el;
                                }}
                                onChange={() => {
                                  checkForConflicts(rate.id);
                                }}
                                className="er-formula-input range er-formula-input--buy"
                              />
                              <span
                                style={{
                                  margin: "0 0.5rem",
                                }}
                              >
                                {" to "}
                              </span>
                              <input
                                type="number"
                                defaultValue={rate.range_stop}
                                ref={(el) => {
                                  formulaRefs.current[rate.id].range_stop = el;
                                }}
                                onChange={() => checkForConflicts(rate.id)}
                                className="er-formula-input range er-formula-input--buy"
                              />
                            </td>

                            {/* --- 3. ฝั่ง BUY --- */}
                            <td className="er-td text-center">
                              <input
                                type="text"
                                defaultValue={rate.formula_buy ?? "BASE"}
                                ref={(el) => {
                                  formulaRefs.current[rate.id].formula_buy = el;
                                }}
                                onChange={() => {
                                  checkForConflicts(rate.id);
                                  computePreview(
                                    rate.id,
                                    Number(currencyGroup.currencyInfo.buyRate),
                                    Number(currencyGroup.currencyInfo.sellRate),
                                  );
                                }}
                                className="er-formula-input er-formula-input--buy"
                              />
                            </td>
                            <td className="er-td text-center er-base-val text-gray-500">
                              {currencyGroup.currencyInfo.buyRate}
                            </td>
                            <td className="er-td text-center er-result-buy font-bold text-[#006d35] bg-[#c6e7d1]/30 border-r border-gray-100">
                              {previews[rate.id]?.buy !== undefined &&
                              previews[rate.id]?.buy !== null
                                ? previews[rate.id].buy
                                : rate.buy_rate}
                            </td>

                            {/* --- 4. ฝั่ง SELL --- */}
                            <td className="er-td text-center">
                              <input
                                type="text"
                                defaultValue={rate.formula_sell ?? "BASE"}
                                ref={(el) => {
                                  formulaRefs.current[rate.id].formula_sell =
                                    el;
                                }}
                                onChange={() => {
                                  checkForConflicts(rate.id);
                                  computePreview(
                                    rate.id,
                                    Number(currencyGroup.currencyInfo.buyRate),
                                    Number(currencyGroup.currencyInfo.sellRate),
                                  );
                                }}
                                className="er-formula-input er-formula-input--sell"
                              />
                            </td>
                            <td className="er-td text-center er-base-val text-gray-500">
                              {currencyGroup.currencyInfo.sellRate}
                            </td>
                            <td className="er-td text-center er-result-sell font-bold text-[#c00000] bg-[#f2d5d5]/30">
                              {previews[rate.id]?.sell !== undefined &&
                              previews[rate.id]?.sell !== null
                                ? previews[rate.id].sell
                                : rate.sell_rate}
                            </td>
                          </tr>
                          {/* Show conflict error row if exists */}
                          {conflictIds.find((c) => c.id === rate.id) && (
                            <tr key={`${rate.id}-conflict`}>
                              <td
                                className="crb-conflict-cell crb-td text-center"
                                colSpan={9}
                              >
                                <div className="crb-conflict text-red-500 text-sm font-semibold p-1">
                                  {
                                    conflictIds.find((c) => c.id === rate.id)
                                      ?.text
                                  }
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cr-empty">ไม่พบข้อมูลสำหรับบูธ์นี้</div>
      )}
    </div>
  );
}
