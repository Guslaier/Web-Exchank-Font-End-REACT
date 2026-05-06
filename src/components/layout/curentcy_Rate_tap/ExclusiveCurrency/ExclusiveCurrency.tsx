import React, { useState, useEffect, useRef, useCallback } from "react";
import "./ExclusiveCurrency.css";
import {
  ExclusiveRateService,
  type ExclusiveRateData,
  type UpdateExclusiveRateData,
} from "../../../../services/currency.service";
import { BoothService } from "../../../../services/booth.service";
import type { BoothData } from "../../../../types/entities";
import { useSSE } from "../../../../services/sse.service";
import { useExclusiveRateFormula } from "../../../../hooks/useExclusiveRateFormula";
import Swal from "sweetalert2";

export default function ExclusiveCurrency() {
  const [booths, setBooths] = useState<BoothData[]>([]);
  const [selectedBoothId, setSelectedBoothId] = useState<string>("");
  const [rates, setRates] = useState<ExclusiveRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  const formulaRefs = useRef<
    Record<
      string,
      {
        formula_buy: HTMLInputElement | null;
        formula_buy_max: HTMLInputElement | null;
      }
    >
  >({});

  const originalValues = useRef<
    Record<string, { formula_buy: string; formula_buy_max: string }>
  >({});

  const { previews, conflictIds, computePreview, resetPreviews } =
    useExclusiveRateFormula(formulaRefs, originalValues, setIsChanged);

  // ใช้ ref เก็บ selectedBoothId ที่เป็นปัจจุบัน เพื่อให้ SSE callback stable
  const selectedBoothIdRef = useRef<string>("");
  useEffect(() => {
    selectedBoothIdRef.current = selectedBoothId;
  }, [selectedBoothId]);

  useEffect(() => {
    loadBooths();
  }, []);

  const handleSSERefresh = useCallback(() => {
    if (selectedBoothIdRef.current) {
      loadRates(selectedBoothIdRef.current);
    } else {
      loadBooths();
    }
  }, []);
  useSSE(handleSSERefresh);

  const loadBooths = async () => {
    try {
      const data = await BoothService.getAllBooths();
      setBooths(data);
      if (data.length > 0) {
        setSelectedBoothId(data[0].id);
        await loadRates(data[0].id);
      }
    } catch (err) {
      console.error("ExclusiveCurrency: loadBooths", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRates = async (boothId: string) => {
    setLoading(true);
    try {
      const data = await ExclusiveRateService.getByBooth(boothId);
      console.log("ExclusiveCurrency: loadRates", data);

      // 1. กรอง THB ออก
      const filteredRates = data.filter((rate) => rate.name !== "THB");

      // 2. ฟังก์ชันช่วยดึงแค่ "สกุลเงินหลัก" (ตัดติ่งด้านหลังออกเพื่อใช้จัดกลุ่ม)
      const getBaseCurrency = (name: string) => {
        const match = name.match(/^([a-zA-Z]+)/);
        return match ? match[1].toUpperCase() : name.toUpperCase();
      };

      // 3. จัดเรียงข้อมูล
      const sortedRates = filteredRates.sort((a, b) => {
        const aBase = getBaseCurrency(a.name);
        const bBase = getBaseCurrency(b.name);
        if (aBase === "USD" && bBase !== "USD") return -1;
        if (bBase === "USD" && aBase !== "USD") return 1;
        if (aBase !== bBase) return aBase.localeCompare(bBase);
        if (a.range_start !== b.range_start)
          return b.range_start - a.range_start;
        if (a.range_stop !== b.range_stop) return b.range_stop - a.range_stop;
        return a.name.localeCompare(b.name);
      });

      setRates(sortedRates);
      formulaRefs.current = {};
      resetPreviews();

      // บันทึกค่าเดิมไว้เปรียบเทียบตอน save
      const origMap: typeof originalValues.current = {};
      for (const rate of sortedRates) {
        origMap[rate.id] = {
          formula_buy: rate.formula_buy ?? "BUY",
          formula_buy_max: rate.formula_buy_max ?? "",
        };
      }
      originalValues.current = origMap;
      setIsChanged(false);
    } catch (err) {
      console.error("ExclusiveCurrency: loadRates", err);
      setRates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBoothChange = async (boothId: string) => {
    setSelectedBoothId(boothId);
    await loadRates(boothId);
  };

  const handleSave = async () => {
    if (conflictIds.length > 0) {
      await Swal.fire({
        icon: "error",
        title: "Cannot Save",
        html: `<div>The following issues must be resolved before saving:<ul style="display:flex;flex-direction:column;align-items:flex-start;padding-left:1.5rem;list-style-type:disc;margin-top:0.5rem;">${conflictIds.map((c) => `<li>${c.text}</li>`).join("")}</ul></div>`,
      });
      return;
    }

    const changedEntries = Object.entries(formulaRefs.current).filter(
      ([id, refs]) => {
        const orig = originalValues.current[id];
        if (!orig) return true;
        return (
          (refs.formula_buy?.value || "BUY") !== orig.formula_buy ||
          (refs.formula_buy_max?.value || "") !== orig.formula_buy_max
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

    setSaving(true);
    try {
      const updates: UpdateExclusiveRateData[] = changedEntries.map(
        ([id, refs]) => ({
          id,
          formula_buy: refs.formula_buy?.value || "BUY",
          formula_buy_max: refs.formula_buy_max?.value || "",
        }),
      );
      console.log("Changed entries to update:", updates);
      const respo =await ExclusiveRateService.bulkUpdate(updates);
      const rateListHtml = respo.map((r) => {
  const rateName = rates.find((rate) => rate.id === r.id)?.name || "Unknown";
  
  // เช็คสถานะ (สมมติว่าถ้าสำเร็จ r.status จะมีค่าเป็น "success" หรือ "ok")
  const isSuccess = r.status?.toLowerCase() === "success";

  // ตกแต่ง Badge สถานะ (เขียว = ผ่าน, แดง = ไม่ผ่าน)
  const statusBadge = isSuccess
    ? `<span style="color: #10b981; font-weight: 600; font-size: 0.9em;">✓ Success</span>`
    : `<span style="color: #ef4444; font-weight: 600; font-size: 0.9em;">✕ Failed</span>`;

  // ซ่อน Message ถ้า Success / โชว์ Message ถ้า Error
  const messageHtml = (!isSuccess && r.message)
    ? `<div style="font-size: 0.85em; color: #6b7280; margin-top: 4px; text-align: left;">
         <strong style="color: #ef4444;">Error:</strong> ${r.message}
       </div>`
    : "";

  return `
    <li style="padding: 12px 0; border-bottom: 1px dashed #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span style="font-weight: 600; color: #374151;">${rateName}</span>
        ${statusBadge}
      </div>
      ${messageHtml}
    </li>
  `;
}).join("");

// 2. เรียกใช้งาน Swal
await Swal.fire({
  icon: "success",
  title: "Save Successful",
  html: `
    <div style="text-align: left; font-size: 1rem;">
      <p style="color: #4b5563; margin-bottom: 12px;">The following rates were updated:</p>
      <ul style="list-style: none; padding: 0; margin: 0; max-height: 60vh; overflow-y: auto;">
        ${rateListHtml}
      </ul>
    </div>
  `,
  confirmButtonText: "OK",
  confirmButtonColor: "#3b82f6", // เปลี่ยนสีปุ่มให้เข้ากับระบบ
  width: '500px', // ขยายกล่องให้กว้างขึ้นเล็กน้อยเพื่อให้อ่านง่าย
});
      await loadRates(selectedBoothId);
    } catch (err: any) {
      await Swal.fire({
        icon: "error",
        title: "Save Failed",
        text:
          err.response?.data?.message ||
          "An error occurred while saving. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="cr-loading">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="exc-wrap">
      {/* ===== Toolbar ===== */}
      <div className="exc-toolbar">
        <div className="exc-toolbar-left">
          <label className="crb-label">Exclusive For Booth:</label>
          <select
            className="er-select"
            value={selectedBoothId}
            onChange={(e) => handleBoothChange(e.target.value)}
          >
            {booths.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <p className="er-status-change">
            {isChanged && "⚠ You have unsaved changes!"}
          </p>
        </div>
        <div className="exc-toolbar-right">
          <button
            className="exc-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Exclusive"}
          </button>
        </div>
      </div>

      {/* ===== Table ===== */}
      {rates.length > 0 ? (
        <div className="table-container">
          <table className="table exc-table">
            <thead>
              <tr>
                <th className="exc-th text-center " rowSpan={2}>
                  Currency
                </th>
                <th className="exc-th text-center exc-boder-left" colSpan={2}>
                  Base
                </th>
                <th className="exc-th text-center exc-boder-left" colSpan={2}>
                  BUY
                </th>
                <th className="exc-th text-center exc-boder-left" colSpan={2}>
                  BUY Max
                </th>
              </tr>
              <tr className="exc-sub-row">
                <th className="exc-th text-center exc-boder-left exc-text-buy">
                  BUY
                </th>
                <th className="exc-th text-center exc-text-sell">SELL</th>
                <th className="exc-th text-center exc-text-formula">Formula</th>
                <th className="exc-th text-center exc-text-result">Result</th>
                <th className="exc-th text-center exc-text-formula">Formula</th>
                <th className="exc-th text-center exc-text-result">Result</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate, ids) => {
                if (!formulaRefs.current[rate.id]) {
                  formulaRefs.current[rate.id] = {
                    formula_buy: null,
                    formula_buy_max: null,
                  };
                }
                return (
                  <React.Fragment key={rate.id}>
                    <tr
                      className={`border-t border-gray-100 hover:bg-gray-50 ${ids % 2 !== 0 ? "main-row-alt" : ""}`}
                    >
                      <td
                        className="exc-td exc-td--code text-center "
                        rowSpan={
                          conflictIds.find((c) => c.id === rate.id) ? 2 : 1
                        }
                      >
                        {rate.name}
                      </td>
                      <td className="exc-td text-center exc-base-val">
                        {rate.base_buy_rate.toFixed(4)}
                      </td>
                      <td className="exc-td text-center exc-base-val">
                        {rate.base_sell_rate.toFixed(4)}
                      </td>
                      <td className="exc-td">
                        <input
                          type="text"
                          defaultValue={rate?.formula_buy}
                          ref={(el) => {
                            if (formulaRefs.current[rate.id]) {
                              formulaRefs.current[rate.id].formula_buy = el;
                            }
                          }}
                          className="exc-formula-input"
                          onChange={() => {
                            computePreview(
                              rate.id,
                              rate.base_buy_rate,
                              rate.base_sell_rate,
                            );
                          }}
                        />
                      </td>
                      <td className="exc-td text-center exc-result-val">
                        {previews[rate.id]?.buy !== undefined &&
                        previews[rate.id]?.buy !== null
                          ? previews[rate.id].buy
                          : Number(rate.buy_rate).toFixed(4)}
                      </td>
                      <td className="exc-td">
                        <input
                          type="text"
                          defaultValue={rate?.formula_buy_max || ""}
                          ref={(el) => {
                            if (formulaRefs.current[rate.id]) {
                              formulaRefs.current[rate.id].formula_buy_max = el;
                            }
                          }}
                          className="exc-formula-input"
                          onChange={() => {
                            computePreview(
                              rate.id,
                              rate.base_buy_rate,
                              rate.base_sell_rate,
                            );
                          }}
                        />
                      </td>
                      <td className="exc-td text-center exc-result-val">
                        {previews[rate.id]?.buyMax !== undefined &&
                        previews[rate.id]?.buyMax !== null
                          ? previews[rate.id].buyMax
                          : Number(rate.buy_rate_max).toFixed(4)}
                      </td>
                    </tr>
                    {conflictIds.find((c) => c.id === rate.id) && (
                      <tr key={`${rate.id}-conflict`}>
                        <td
                          className="exc-conflict-cell exc-td text-center"
                          colSpan={7}
                        >
                          <div className="exc-conflict text-sm font-semibold p-1">
                            {conflictIds.find((c) => c.id === rate.id)?.text}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cr-empty">
          No Exclusive Rate data found for this booth
        </div>
      )}
    </div>
  );
}
