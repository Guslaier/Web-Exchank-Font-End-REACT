import React, { useState, useEffect, useRef } from "react";
import "./CentralRateBase.css";
import {
  CurrencyService,
  type CurrencyData,
} from "../../../../services/currency.service";
import Swal from "sweetalert2";

export default function CentralRateBase() {
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [conflictIds, setConflictIds] = useState<
    { id: string; text: string }[]
  >([]); // สำหรับเก็บ ID ที่มีปัญหาในการบันทึก
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // refs สำหรับเก็บค่า input โดยไม่ re-render
  const rateRefs = useRef<
    Record<
      string,
      { buy: HTMLInputElement | null; sell: HTMLInputElement | null }
    >
  >({});

  const checkForConflicts = async (id: string) => {
    try {
      console.log(conflictIds);
      let buyRate = rateRefs.current[id]?.buy?.value;
      let sellRate = rateRefs.current[id]?.sell?.value;
      console.log(`Checking rates for ${id}: BUY=${buyRate}, SELL=${sellRate}`);
      if (buyRate === undefined || sellRate === undefined) {
        setConflictIds((prev) => {
          if (!prev.find((c) => c.id === id)) {
            return [...prev, { id, text: "Input elements not found" }];
          }
          return prev.map((c) => (c.id === id ? { ...c, text: "Input elements not found" } : c));
        });
        return;
      }
      if (buyRate === "" || sellRate === "") {
        setConflictIds((prev) => {
          if (!prev.find((c) => c.id === id)) {
            return [...prev, { id, text: "Empty rate value" }];
          }
          return prev.map((c) => (c.id === id ? { ...c, text: "Empty rate value" } : c));
        });
        return;
      }
      if (isNaN(Number(buyRate)) || isNaN(Number(sellRate))) {
        setConflictIds((prev) => {
          if (!prev.find((c) => c.id === id)) {
            return [...prev, { id, text: "Non-numeric rate values" }];
          }
          return prev.map((c) => (c.id === id ? { ...c, text: "Non-numeric rate values" } : c));
        });
        return;
      }
      if (Number(buyRate) <= 0 || Number(sellRate) <= 0) {
        setConflictIds((prev) => {
          if (!prev.find((c) => c.id === id)) {
            return [...prev, { id, text: "Rate values must be positive numbers" }];
          }
          return prev.map((c) => (c.id === id ? { ...c, text: "Rate values must be positive numbers" } : c));
        });
        return;
      }
      if (Number(buyRate) >= Number(sellRate)) {
        setConflictIds((prev) => {
          if (!prev.find((c) => c.id === id)) {
            return [...prev, { id, text: "BUY rate must be less than SELL rate" }];
          }
          return prev.map((c) => (c.id === id ? { ...c, text: "BUY rate must be less than SELL rate" } : c));
        });
        return;
      }
      setConflictIds((prev) => prev.filter((c) => c.id !== id)); // ถ้าไม่มีปัญหา ให้ลบ ID นี้ออกจาก conflictIds
    } catch (err) {
      console.error("CentralRateBase: checkForConflicts", err);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    setLoading(true);
    try {
      const data: CurrencyData[] = await CurrencyService.getAll();
      setCurrencies(await data.filter((c) => c?.code !== "THB")); // กรองเอาเฉพาะสกุลเงินที่ไม่ใช่ THB
    } catch (err) {
      console.error("CentralRateBase: loadCurrencies", err);
    } finally {
      setLoading(false);
    }
  };

  /* --- Selection helpers --- */
  const handleSelectAll = () => setSelectedIds(currencies.map((c) => c.id));
  const handleUnselectAll = () => setSelectedIds([]);
  const toggleRow = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  /* --- Bulk mode change --- */
  const handleBulkChangeMode = async (mode: "AUTO" | "MANUAL") => {
    if (!selectedIds.length) {
      await Swal.fire({
        icon: "info",
        title: "No Selection",
        text: "Please select at least one currency.",
      });
      return;
    }
    setSaving(true);
    try {
      if (mode === "AUTO") await CurrencyService.setModeAuto(selectedIds);
      else await CurrencyService.setModeManual(selectedIds);
      setCurrencies((prev) =>
        prev.map((c) =>
          selectedIds.includes(c.id) ? { ...c, updateMode: mode } : c,
        ),
      );
      setSelectedIds([]);
      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `Selected currencies have been set to ${mode}.`,
      });
    } catch (err: any) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message || "An error occurred. Please try again.",
      });
    } finally {
      loadCurrencies();
      setSaving(false);
    }
  };

  /* --- Save manual rates --- */
  const handleSave = async () => {
    if (conflictIds.length) {
      await Swal.fire({
        icon: "error",
        title: "Cannot Save",
        html: `<div>The following issues must be resolved before saving:<ul
        style="display:flex; 
        flex-direction:column; align-items:flex-start; padding-left:1.5rem; list-style-type:disc; margin-top:0.5rem;"
        >${conflictIds
          .map((c) => `<li>${currencies.find((cur) => cur.id === c.id)?.code || c.id}: ${c.text}</li>`)
          .join("")}</ul></div>`,
      });
      return;
    }
    const updates = currencies
      .filter((c) => c.updateMode === "MANUAL")
      .map((c) => ({
        id: c.id,
        buyRate: Number(rateRefs.current[c.id]?.buy?.value ?? c.buyRate),
        sellRate: Number(rateRefs.current[c.id]?.sell?.value ?? c.sellRate),
        isActive: c.isActive,
      }));
    if (!updates.length) {
      await Swal.fire({
        icon: "info",
        title: "No Changes",
        text: "There are no manual rates to save.",
      });
      return;
    }
    setSaving(true);
    try {
      await CurrencyService.manualUpdate(updates);
      await loadCurrencies();
      await Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Exchange rates have been successfully saved.",
      });
    } catch (err: any) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err.response?.data?.message ||
          "An error occurred while saving. Please try again.",
      });
    } finally {
      loadCurrencies();
      setSaving(false);
    }
  };

  if (loading) return <div className="cr-loading">Loading data...</div>;

  const allChecked =
    selectedIds.length === currencies.length && currencies.length > 0;

  return (
    <div className="crb-wrap">
      {/* ===== Toolbar ===== */}
      <div className="crb-toolbar">
        <div className="crb-toolbar-left">
          <span className="crb-label">Selection:</span>
          <button className="crb-btn-ghost" onClick={handleSelectAll}>
            Select All
          </button>
          <button className="crb-btn-ghost" onClick={handleUnselectAll}>
            Unselect All
          </button>

          <span className="crb-label">Set Mode:</span>
          <button
            className="crb-btn-auto"
            onClick={() => handleBulkChangeMode("AUTO")}
            disabled={saving}
          >
            Set Auto (BOT)
          </button>
          <button
            className="crb-btn-manual"
            onClick={() => handleBulkChangeMode("MANUAL")}
            disabled={saving}
          >
            Set Manual
          </button>
        </div>

        <button className="crb-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "กำลังบันทึก..." : "Save Changes"}
        </button>
      </div>

      {/* ===== Table ===== */}
      <div className="table-container">
        <table className="table crb-table">
          <thead>
            <tr>
              <th className="crb-th text-center">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) =>
                    e.target.checked ? handleSelectAll() : handleUnselectAll()
                  }
                />
              </th>
              <th className="crb-th">Currency</th>
              <th className="crb-th text-center">Update Mode</th>
              <th className="crb-th text-center">BUY Rate</th>
              <th className="crb-th text-center">SELL Rate</th>
            </tr>
          </thead>
          <tbody>
            {currencies.map((rate, idx) => {
              // สร้าง ref slot ถ้ายังไม่มี
              if (!rateRefs.current[rate.id]) {
                rateRefs.current[rate.id] = { buy: null, sell: null };
              }
              const isManual = rate.updateMode === "MANUAL";
              return (
                <React.Fragment key={rate.id}>
                  <tr
                    key-r={rate.id}
                    className={`border-t border-gray-100 hover:bg-gray-50 ${idx % 2 !== 0 ? "main-row-alt" : ""}`}
                  >
                    <td className="crb-td text-center" rowSpan={2}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(rate.id)}
                        onChange={() => toggleRow(rate.id)}
                      />
                    </td>

                    <td className="crb-td" rowSpan={2}>
                      <div className="crb-currency-cell">
                        <div className="crb-code-badge z" translate="no">
                          {rate.code.slice(0, 3)}
                        </div>
                        <div>
                          <div className="crb-code" translate="no">
                            {rate.code}
                          </div>
                          <div className="crb-name" translate="no">
                            {rate.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="crb-td text-center" rowSpan={2}>
                      <span
                        className={`crb-mode-badge ${isManual ? "crb-mode-badge--manual" : "crb-mode-badge--auto"}`}
                      >
                        {rate.updateMode}
                      </span>
                    </td>
                    
                    <td className="crb-td text-center">
                      <input
                        type="text"
                        defaultValue={rate.buyRate}
                        disabled={!isManual}
                        ref={(el) => {
                          rateRefs.current[rate.id].buy = el;
                        }}
                        onChange={() => {
                          checkForConflicts(rate.id);
                        }}
                        className={`crb-rate-input ${isManual ? "crb-rate-input--editable" : "crb-rate-input--readonly"}`}
                      />
                    </td>

                    <td className="crb-td text-center">
                      <input
                        type="text"
                        defaultValue={rate.sellRate}
                        disabled={!isManual}
                        ref={(el) => {
                          rateRefs.current[rate.id].sell = el;
                        }}
                        onChange={() => {
                          checkForConflicts(rate.id);
                        }}
                        className={`crb-rate-input ${isManual ? "crb-rate-input--editable" : "crb-rate-input--readonly"}`}
                      />
                    </td>
                  </tr>
                  <tr key-r={`${rate.id}-conflict`}>
                    {conflictIds.find((c) => c.id === rate.id) && (
                      <td className="crb-conflict-cell crb-td text-center " colSpan={2} >
                        <div className="crb-conflict">
                          <div className="crb-conflict-text">
                            {conflictIds.find((c) => c.id === rate.id)?.text}
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                  
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
