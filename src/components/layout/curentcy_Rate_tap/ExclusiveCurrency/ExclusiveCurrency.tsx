import React, { useState, useEffect, useRef } from "react";
import "./ExclusiveCurrency.css";
import {
  ExclusiveRateService,
  type BoothExchangeRate,
  type ExclusiveRateData,
} from "../../../../services/currency.service";
import { BoothService } from "../../../../services/booth.service";
import type { BoothData } from "../../../../types/entities";
import { useSSE } from "../../../../services/sse.service";

export default function ExclusiveCurrency() {
  const [booths, setBooths] = useState<BoothData[]>([]);
  const [selectedBoothId, setSelectedBoothId] = useState<string>("");
  const [rates, setRates] = useState<ExclusiveRateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const formulaRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadBooths();
  }, []);
  useSSE(() => {
    if (selectedBoothId) {
      loadRates(selectedBoothId);
    }else {
      loadBooths();
    }
  });

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
      setRates(data.filter((rate) => rate.name !== "THB")); // กรองเอาเฉพาะสกุลเงินที่ไม่ใช่ THB
      formulaRefs.current = {};
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

  const handleSave = async () => {};

  const handleSyncClamp = async () => {
    setSaving(true);
    try {
      await ExclusiveRateService.syncAndClamp();
      await loadRates(selectedBoothId);
      alert("Sync & Clamp สำเร็จ");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
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
        </div>
        <div className="exc-toolbar-right">
          <button
            className="exc-btn-sync"
            onClick={handleSyncClamp}
            disabled={saving}
          >
            Sync &amp; Clamp
          </button>
          <button
            className="exc-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "กำลังบันทึก..." : "Save Exclusive"}
          </button>
        </div>
      </div>

      {/* ===== Table ===== */}
      {rates.length > 0 ? (
        <div className="table-container">
          <table className="table exc-table">
            <thead>
              <tr>
                <th className="exc-th text-center " rowSpan={2}>Currency</th>
                <th className="exc-th text-center exc-boder-left" colSpan={2}>Base</th>
                <th className="exc-th text-center exc-boder-left" colSpan={2}>BUY</th>
                <th className="exc-th text-center exc-boder-left" colSpan={2}>BUY Max</th>
              </tr>
              <tr className="exc-sub-row">
                <th className="exc-th text-center exc-boder-left exc-text-buy">BUY</th>
                <th className="exc-th text-center exc-text-sell">SELL</th>
                <th className="exc-th text-center exc-text-formula">Formula</th>
                <th className="exc-th text-center exc-text-result">Result</th>
                <th className="exc-th text-center exc-text-formula">Formula</th>
                <th className="exc-th text-center exc-text-result">Result</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate, ids) => (
                <React.Fragment key={rate.id}>
                  <tr
                    key={`${rate.exchange_rate_id}-${rate.id}`}
                    className={`border-t border-gray-100 hover\:bg-gray-50 ${ids % 2 !== 0 ? "main-row-alt" : ""} `}
                  >
                    <td className="exc-td exc-td--code text-center ">
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
                        defaultValue={rate.formula_buy}
                        ref={(el) => {
                          formulaRefs.current[rate.exchange_rate_id] = el;
                        }}
                        className="exc-formula-input"
                      />
                    </td>
                    <td className="exc-td text-center exc-result-val">
                      {Number(rate.buy_rate).toFixed(4)}
                    </td>
                    <td className="exc-td">
                      <input
                        type="text"
                        defaultValue={rate.formula_buy_max}
                        ref={(el) => {
                          formulaRefs.current[rate.exchange_rate_id] = el;
                        }}
                        className="exc-formula-input"
                      />
                    </td>
                    <td className="exc-td text-center exc-result-val">
                      {Number(rate.buy_rate_max).toFixed(4)}
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="cr-empty">ไม่พบข้อมูล Exclusive Rate สำหรับบูธ์นี้</div>
      )}
    </div>
  );
}
