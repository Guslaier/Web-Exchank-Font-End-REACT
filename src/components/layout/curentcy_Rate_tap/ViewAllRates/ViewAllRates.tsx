import { useState, useEffect } from "react";
import "./ViewAllRates.css";
import {
  ExclusiveRateService,
  ExchangeRateService,
  type RateAllData,
  type exclusive_rate_detail,
  type UpdateExclusiveRateData,
  type RateDetail,
} from "../../../../services/currency.service";
import Button from "../../../common/Buttom/Buttom";
import { useSingleCellFormula } from "../../../../hooks/useSingleCellFormula";
import { useSingleExchangeRateFormula } from "../../../../hooks/useSingleExchangeRateFormula";
import type { SelectedExchangeRateCell } from "../../../../hooks/useSingleExchangeRateFormula";
import { useSSE } from "../../../../services/sse.service";

// Update Interface to store exchangeRateId instead
interface SelectedCell {
  boothId: string;
  boothName: string;
  currencyName: string;
  exchangeRateId: string;
  rateId: string;
  currentBuyRate: string;
  formulaBuy: string;
  formulaBuyMax: string;
  baseBuy: number;
  baseSell: number;
  buy_max: string;
}

export default function ViewAllRates() {
  const [Rates, setRates] = useState<RateAllData[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Exclusive Rate ---
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [saving, setSaving] = useState(false);
  const { formulaBuyRef, formulaBuyMaxRef, preview, conflictError, computePreview } =
    useSingleCellFormula(selectedCell);

  // --- Exchange Rate ---
  const [selectedExchangeRate, setSelectedExchangeRate] = useState<SelectedExchangeRateCell | null>(null);
  const [exchangeRateMap, setExchangeRateMap] = useState<Record<string, RateDetail>>({});
  const [savingExchange, setSavingExchange] = useState(false);
  const {
    formulaBuyRef: exFormulaBuyRef,
    formulaSellRef: exFormulaSellRef,
    rangeStartRef: exRangeStartRef,
    rangeStopRef: exRangeStopRef,
    preview: exPreview,
    conflictError: exConflictError,
    computePreview: exComputePreview,
  } = useSingleExchangeRateFormula(selectedExchangeRate);

  useEffect(() => {
    loadData();
  }, []);
  const handleRefresh = () => {
    // Reset preview and error when clicking a new cell
    loadData();
    setSelectedCell(null);
  }
  useSSE(handleRefresh)

  const loadData = async () => {
    try {
      const [rates, erRaw] = await Promise.all([
        ExclusiveRateService.getAll(),
        ExchangeRateService.getAll(),
      ]);
      setRates(rates);
      // Build map: exchange_rate_id -> RateDetail for exchange mode
      const erCurrencies = Object.values(erRaw as any) as { rates: RateDetail[] }[];
      const map: Record<string, RateDetail> = {};
      for (const c of erCurrencies) {
        if (Array.isArray(c.rates)) {
          for (const r of c.rates) {
            map[r.id] = r;
          }
        }
      }
      setExchangeRateMap(map);
    } catch (err) {
      console.error("ViewAllRates: loadData", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyRowClick = (currencyItem: exclusive_rate_detail) => {
    const detail = exchangeRateMap[currencyItem.exchange_rate_id];
    if (!detail) return;
    setSelectedCell(null);
    setSelectedExchangeRate({
      id: currencyItem.exchange_rate_id,
      name: currencyItem.name,
      baseBuy: currencyItem.base_buy,
      baseSell: currencyItem.base_sell,
      formulaBuy: detail.formula_buy ?? "BASE",
      formulaSell: detail.formula_sell ?? "BASE",
      rangeStart: detail.range_start,
      rangeStop: detail.range_stop,
      currentBuyRate: detail.buy_rate,
      currentSellRate: detail.sell_rate,
    });
  };

  const handleSaveExchangeRate = async () => {
    if (!selectedExchangeRate || exConflictError) return;
    const fBuy = exFormulaBuyRef.current?.value ?? "BASE";
    const fSell = exFormulaSellRef.current?.value ?? "BASE";
    const rStart = parseFloat(exRangeStartRef.current?.value ?? String(selectedExchangeRate.rangeStart));
    const rStop = parseFloat(exRangeStopRef.current?.value ?? String(selectedExchangeRate.rangeStop));
    setSavingExchange(true);
    try {
      await ExchangeRateService.bulkUpdate([{
        id: selectedExchangeRate.id,
        name: selectedExchangeRate.name,
        range_start: isNaN(rStart) ? selectedExchangeRate.rangeStart : rStart,
        range_stop: isNaN(rStop) ? selectedExchangeRate.rangeStop : rStop,
        formula_buy: fBuy,
        formula_sell: fSell,
      }]);
      await loadData();
      setSelectedExchangeRate(null);
    } catch (err) {
      console.error("ViewAllRates: handleSaveExchangeRate", err);
    } finally {
      setSavingExchange(false);
    }
  };

  const handleSaveCell = async () => {
    if (!selectedCell?.rateId || conflictError) return;
    const fBuy = formulaBuyRef.current?.value ?? "BUY";
    const fMax = formulaBuyMaxRef.current?.value ?? "";
    setSaving(true);
    try {
      await ExclusiveRateService.bulkUpdate([
        { id: selectedCell.rateId, formula_buy: fBuy, formula_buy_max: fMax } as UpdateExclusiveRateData,
      ]);
      await loadData();
      setSelectedCell(null);
    } catch (err) {
      console.error("ViewAllRates: handleSaveCell", err);
    } finally {
      setSaving(false);
    }
  };

  // 1. Group by exchange_rate_id instead of name to prevent duplicates
  const getSortedCurrencies = (): exclusive_rate_detail[] => {
    const uniqueMap = new Map<string, exclusive_rate_detail>();

    Rates.forEach((b) => {
      b.exchange_rates.forEach((r) => {
        // Use ID as primary key, ignore name
        if (r.name.toUpperCase().startsWith("THB")) {
          return;
        }

        if (!uniqueMap.has(r.exchange_rate_id)) {
          uniqueMap.set(r.exchange_rate_id, r);
        }
      });
    });

    const uniqueRates = Array.from(uniqueMap.values());

    const getBaseCurrency = (name: string) => {
      const match = name.match(/^([a-zA-Z]+)/);
      return match ? match[1].toUpperCase() : name.toUpperCase();
    };

    return uniqueRates.sort((a, b) => {
      const aBase = getBaseCurrency(a.name);
      const bBase = getBaseCurrency(b.name);

      if (aBase === "USD" && bBase !== "USD") return -1;
      if (bBase === "USD" && aBase !== "USD") return 1;
      if (aBase !== bBase) return aBase.localeCompare(bBase);
      if (a.rate_start !== b.rate_start) return b.rate_start - a.rate_start;
      if (a.rate_stop !== b.rate_stop) return b.rate_stop - a.rate_stop;

      return a.name.localeCompare(b.name);
    });
  };

  // Store as Array of Objects, not just an Array of names
  const sortedCurrencies = getSortedCurrencies();

  // 2. Find rate by exchange_rate_id
  const findRateById = (boothId: string, exchangeRateId: string) => {
    const boothData = Rates.find((b) => b.booth_id === boothId);
    if (!boothData) return null;
    return (
      boothData.exchange_rates.find(
        (r) => r.exchange_rate_id === exchangeRateId,
      ) || null
    );
  };

  // 3. On click, send ID along
  const handleCellClick = (booth: RateAllData, exchangeRateId: string) => {
    const rate = findRateById(booth.booth_id, exchangeRateId);
    let currentBuy = "-";
    let detailId = "";

    if (rate && rate.exclusive_details?.length > 0) {
      currentBuy = Number(rate.exclusive_details[0].buy_rate).toFixed(4);
      detailId = rate.exclusive_details[0].id;
    }

    setSelectedCell({
      boothId: booth.booth_id,
      boothName: booth.booth_name,
      currencyName:
        booth.exchange_rates.find((r) => r.exchange_rate_id === exchangeRateId)
          ?.name || "Unknown",
      exchangeRateId: exchangeRateId,
      formulaBuy: rate?.exclusive_details[0]?.formula_buy || "",
      formulaBuyMax: rate?.exclusive_details[0]?.formula_buy_max || "",
      baseBuy: rate?.base_buy || 0,
      baseSell: rate?.base_sell || 0,
      buy_max: rate?.exclusive_details[0]?.buy_rate_max || "0",
      rateId: detailId,
      currentBuyRate: currentBuy,
    });
    setSelectedExchangeRate(null);
  };

  if (loading) return <div className="cr-loading">Loading...</div>;

  const activePanel = selectedExchangeRate
    ? "exchange"
    : selectedCell
      ? "exclusive"
      : null;

  return (
    <div className="var-wrap">
      {/* -- Header -- */}
      <div className="var-header">
        <div>
          <h2 className="var-title">View All Booths Rates</h2>
          <p className="var-subtitle">Comparing rates across all locations</p>
        </div>
        <div className="var-header-actions">
          <button className="var-btn-export" onClick={() => window.print()}>
            Export
          </button>
        </div>
      </div>

      {/* -- Mode hint -- */}
      <div className={`var-hint ${activePanel === "exchange" ? "var-hint--exchange" : activePanel === "exclusive" ? "var-hint--exclusive" : "var-hint--default"}`}>
        {activePanel === "exchange"
          ? "Editing Exchange Rate · Click on a booth cell to edit Exclusive Rate"
          : activePanel === "exclusive"
          ? "Editing Exclusive Rate · Click on a currency row to edit Exchange Rate"
          : "Click on a currency row = Edit Exchange Rate · Click on a booth cell = Edit Exclusive Rate"}
      </div>

      {/* -- Content: table + sidebar -- */}
      <div className={`var-content ${activePanel ? "var-content--with-panel" : ""}`}>

        {/* -- Table -- */}
        <div className="var-table-wrap">
          <table className="var-table">
            <thead>
              <tr>
                <th className="var-th var-th--currency">Currency</th>
                <th className="var-th var-th--central">Buy (Base)</th>
                <th className="var-th var-th--sell">Sell (Base)</th>
                {Rates.map((b) => (
                  <th key={b.booth_id} className="var-th var-th--booth">
                    {b.booth_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCurrencies.map((currencyItem, idx) => {
                const { exchange_rate_id, name, base_buy, base_sell } = currencyItem;
                const isExSelected = selectedExchangeRate?.id === exchange_rate_id;

                return (
                  <tr
                    key={exchange_rate_id}
                    className={`var-row ${idx % 2 !== 0 ? "var-row--alt" : ""} ${isExSelected ? "var-row--ex-selected" : ""}`}
                  >
                    {/* Currency name */}
                    <td
                      className={`var-td var-td--currency var-td--clickable ${isExSelected ? "var-td--ex-currency-selected" : ""}`}
                      onClick={() => handleCurrencyRowClick(currencyItem)}
                    >
                      <span className="var-code">{name}</span>
                      <span className="var-td--edit-icon">✎</span>
                    </td>

                    {/* Buy base */}
                    <td
                      className={`var-td var-td--num var-td--buy var-td--clickable ${isExSelected ? "var-td--ex-currency-selected" : ""}`}
                      onClick={() => handleCurrencyRowClick(currencyItem)}
                    >
                      {base_buy ? base_buy.toFixed(4) : "-"}
                    </td>

                    {/* Sell base */}
                    <td
                      className={`var-td var-td--num var-td--sell var-td--clickable ${isExSelected ? "var-td--ex-currency-selected" : ""}`}
                      onClick={() => handleCurrencyRowClick(currencyItem)}
                    >
                      {base_sell ? base_sell.toFixed(4) : "-"}
                    </td>

                    {/* Each booth */}
                    {Rates.map((b) => {
                      const isBoothSelected =
                        selectedCell?.boothId === b.booth_id &&
                        selectedCell?.exchangeRateId === exchange_rate_id;
                      const rateVal = findRateById(b.booth_id, exchange_rate_id)
                        ?.exclusive_details[0]?.buy_rate;
                      return (
                        <td
                          key={b.booth_id}
                          className={`var-td var-td--num var-td--clickable ${isBoothSelected ? "var-td--ex-cell-selected" : ""}`}
                          onClick={() => handleCellClick(b, exchange_rate_id)}
                        >
                          {rateVal ? Number(rateVal).toFixed(4) : "-"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* -- Edit Sidebar -- */}
        {activePanel === "exchange" && selectedExchangeRate && (
          <aside className="var-panel var-panel--exchange">
            <div className="var-panel-header">
              <span className="var-panel-badge var-panel-badge--exchange">Exchange Rate</span>
              <button className="var-panel-close" onClick={() => setSelectedExchangeRate(null)}>x</button>
            </div>

            <div className="var-panel-meta">
              <span className="var-panel-currency">{selectedExchangeRate.name}</span>
              <span className="var-panel-range">
                range {selectedExchangeRate.rangeStart} - {selectedExchangeRate.rangeStop}
              </span>
            </div>

            <div className="var-panel-rates">
              <div className="var-panel-rate-col">
                <div className="var-panel-rate-label">Base</div>
                <div className="var-panel-rate-row">
                  <span>Buy</span>
                  <span>{selectedExchangeRate.baseBuy.toFixed(4)}</span>
                </div>
                <div className="var-panel-rate-row">
                  <span>Sell</span>
                  <span>{selectedExchangeRate.baseSell.toFixed(4)}</span>
                </div>
              </div>
              <div className="var-panel-rate-col">
                <div className="var-panel-rate-label var-panel-rate-label--result">Preview</div>
                <div className={`var-panel-rate-row ${exConflictError ? "var-panel-rate-row--error" : ""}`}>
                  <span>Buy</span>
                  <span>
                    {exPreview.buy !== null
                      ? exPreview.buy.toFixed(4)
                      : selectedExchangeRate.currentBuyRate.toFixed(4)}
                  </span>
                </div>
                <div className={`var-panel-rate-row ${exConflictError ? "var-panel-rate-row--error" : ""}`}>
                  <span>Sell</span>
                  <span>
                    {exPreview.sell !== null
                      ? exPreview.sell.toFixed(4)
                      : selectedExchangeRate.currentSellRate.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            <div className="var-panel-fields">
              <label className="var-panel-label">Formula Buy</label>
              <input className="var-panel-input" type="text" defaultValue={selectedExchangeRate.formulaBuy} ref={exFormulaBuyRef} onChange={exComputePreview} />

              <label className="var-panel-label">Formula Sell</label>
              <input className="var-panel-input" type="text" defaultValue={selectedExchangeRate.formulaSell} ref={exFormulaSellRef} onChange={exComputePreview} />

              <div className="var-panel-row2">
                <div>
                  <label className="var-panel-label">Range Start</label>
                  <input className="var-panel-input" type="number" defaultValue={selectedExchangeRate.rangeStart} ref={exRangeStartRef} onChange={exComputePreview} />
                </div>
                <div>
                  <label className="var-panel-label">Range Stop</label>
                  <input className="var-panel-input" type="number" defaultValue={selectedExchangeRate.rangeStop} ref={exRangeStopRef} onChange={exComputePreview} />
                </div>
              </div>

              {exConflictError && <div className="var-panel-error">⚠ {exConflictError}</div>}
            </div>

            <div className="var-panel-actions">
              <button className="var-panel-btn-cancel" onClick={() => setSelectedExchangeRate(null)}>Cancel</button>
              <Button
                label={savingExchange ? "Saving..." : "Save"}
                variant="add"
                className="main-add"
                onClick={handleSaveExchangeRate}
              />
            </div>
          </aside>
        )}

        {activePanel === "exclusive" && selectedCell && (
          <aside className="var-panel var-panel--exclusive">
            <div className="var-panel-header">
              <span className="var-panel-badge var-panel-badge--exclusive">Exclusive Rate</span>
              <button className="var-panel-close" onClick={() => setSelectedCell(null)}>x</button>
            </div>

            <div className="var-panel-meta">
              <span className="var-panel-currency">{selectedCell.currencyName}</span>
              <span className="var-panel-booth">{selectedCell.boothName}</span>
            </div>

            <div className="var-panel-rates">
              <div className="var-panel-rate-col">
                <div className="var-panel-rate-label">Base</div>
                <div className="var-panel-rate-row">
                  <span>Buy</span>
                  <span>{Number(selectedCell.baseBuy).toFixed(4)}</span>
                </div>
                <div className="var-panel-rate-row">
                  <span>Sell</span>
                  <span>{Number(selectedCell.baseSell).toFixed(4)}</span>
                </div>
              </div>
              <div className="var-panel-rate-col">
                <div className="var-panel-rate-label var-panel-rate-label--result">Preview</div>
                <div className={`var-panel-rate-row ${conflictError ? "var-panel-rate-row--error" : ""}`}>
                  <span>Buy</span>
                  <span>{preview.buy !== null ? preview.buy.toFixed(4) : selectedCell.currentBuyRate}</span>
                </div>
                <div className={`var-panel-rate-row ${conflictError ? "var-panel-rate-row--error" : ""}`}>
                  <span>Max</span>
                  <span>{preview.buyMax !== null ? preview.buyMax.toFixed(4) : selectedCell.buy_max}</span>
                </div>
              </div>
            </div>

            <div className="var-panel-fields">
              <label className="var-panel-label">Formula Buy</label>
              <input className="var-panel-input" type="text" defaultValue={selectedCell.formulaBuy} ref={formulaBuyRef} onChange={computePreview} />

              <label className="var-panel-label">Formula Buy Max</label>
              <input className="var-panel-input" type="text" defaultValue={selectedCell.formulaBuyMax} ref={formulaBuyMaxRef} onChange={computePreview} />

              {conflictError && <div className="var-panel-error">⚠ {conflictError}</div>}
            </div>

            <div className="var-panel-actions">
              <button className="var-panel-btn-cancel" onClick={() => setSelectedCell(null)}>Cancel</button>
              <Button
                label={saving ? "Saving..." : "Save"}
                variant="add"
                className="main-add"
                onClick={handleSaveCell}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
