// src/hooks/useExchangeRateFormula.ts
// Hook สำหรับ ExchangeRates (multi-row, BASE formula, buy/sell preview + conflict)
import { useState } from "react";
import {
  evaluateExchangeRateFormula,
  checkExchangeRateSyntax,
} from "./formulaEngine";

export type ExchangePreviewMap = Record<
  string,
  { buy: number | null; sell: number | null }
>;
export type ConflictEntry = { id: string; text: string };

type FormulaRefsMap = React.MutableRefObject<
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
>;
type OriginalValuesMap = React.MutableRefObject<
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
>;

export function useExchangeRateFormula(
  formulaRefs: FormulaRefsMap,
  originalValues: OriginalValuesMap,
  setIsChanged: (changed: boolean) => void,
) {
  const [previews, setPreviews] = useState<ExchangePreviewMap>({});
  const [conflictIds, setConflictIds] = useState<ConflictEntry[]>([]);

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

  /** คำนวณ preview buy/sell แบบ real-time */
  const computePreview = (
    rateId: string,
    buyBase: number,
    sellBase: number,
  ) => {
    const refs = formulaRefs.current[rateId];
    if (!refs) return;
    const buyFormula = refs.formula_buy?.value || "BASE";
    const sellFormula = refs.formula_sell?.value || "BASE";

    const buyResult = evaluateExchangeRateFormula(buyFormula, buyBase);
    const sellResult = evaluateExchangeRateFormula(sellFormula, sellBase);
    setPreviews((prev) => ({
      ...prev,
      [rateId]: { buy: buyResult, sell: sellResult },
    }));
    checkIsChanged();

    if (buyResult !== null && sellResult !== null && buyResult > sellResult) {
      setConflictIds((prev) => {
        const msg = `Buy rate (${buyResult}) cannot be greater than Sell rate (${sellResult})`;
        if (!prev.find((c) => c.id === rateId))
          return [...prev, { id: rateId, text: msg }];
        return prev.map((c) => (c.id === rateId ? { ...c, text: msg } : c));
      });
    } else {
      setConflictIds((prev) => {
        const existing = prev.find((c) => c.id === rateId);
        if (existing?.text.startsWith("Buy rate"))
          return prev.filter((c) => c.id !== rateId);
        return prev;
      });
    }
  };

  /** ตรวจ syntax + range conflicts */
  const checkForConflicts = (rateId: string) => {
    const refs = formulaRefs.current[rateId];
    if (!refs) return;

    const buyForm = refs.formula_buy?.value || "";
    const sellForm = refs.formula_sell?.value || "";
    const startVal = refs.range_start?.value;
    const stopVal = refs.range_stop?.value;

    let error: string | null = null;

    const buyErr = checkExchangeRateSyntax(buyForm);
    if (buyErr) error = `BUY Formula: ${buyErr}`;

    const sellErr = checkExchangeRateSyntax(sellForm);
    if (!error && sellErr) error = `SELL Formula: ${sellErr}`;

    if (!error) {
      const start = parseFloat(startVal || "");
      const stop = parseFloat(stopVal || "");
      if (!isNaN(start) && !isNaN(stop) && start >= stop)
        error = "Range start must be less than range stop";
    }

    setConflictIds((prev) => {
      if (error) {
        if (!prev.find((c) => c.id === rateId))
          return [...prev, { id: rateId, text: error as string }];
        return prev.map((c) =>
          c.id === rateId ? { ...c, text: error as string } : c,
        );
      }
      return prev.filter((c) => c.id !== rateId);
    });
    checkIsChanged();
  };

  const resetPreviews = () => {
    setPreviews({});
    setConflictIds([]);
  };

  return {
    previews,
    conflictIds,
    setConflictIds,
    computePreview,
    checkForConflicts,
    resetPreviews,
  };
}
