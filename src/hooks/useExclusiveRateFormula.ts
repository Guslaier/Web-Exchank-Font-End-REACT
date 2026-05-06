// src/hooks/useExclusiveRateFormula.ts
// Hook สำหรับ ExclusiveCurrency (multi-row preview + conflict management)
import { useState } from "react";
import {
  evaluateExclusiveFormula,
  checkExclusiveSyntax,
} from "./formulaEngine";

export type ExclusivePreviewMap = Record<
  string,
  { buy: number | null; buyMax: number | null }
>;
export type ConflictEntry = { id: string; text: string };

type FormulaRefsMap = React.MutableRefObject<
  Record<
    string,
    { formula_buy: HTMLInputElement | null; formula_buy_max: HTMLInputElement | null }
  >
>;
type OriginalValuesMap = React.MutableRefObject<
  Record<string, { formula_buy: string; formula_buy_max: string }>
>;

export function useExclusiveRateFormula(
  formulaRefs: FormulaRefsMap,
  originalValues: OriginalValuesMap,
  setIsChanged: (changed: boolean) => void,
) {
  const [previews, setPreviews] = useState<ExclusivePreviewMap>({});
  const [conflictIds, setConflictIds] = useState<ConflictEntry[]>([]);

  const checkIsChanged = () => {
    const changed = Object.entries(formulaRefs.current).some(([id, refs]) => {
      const orig = originalValues.current[id];
      if (!orig) return true;
      return (
        (refs.formula_buy?.value || "BUY") !== orig.formula_buy ||
        (refs.formula_buy_max?.value || "") !== orig.formula_buy_max
      );
    });
    setIsChanged(changed);
  };

  const computePreview = (
    rateId: string,
    baseBuy: number,
    baseSell: number,
  ) => {
    const refs = formulaRefs.current[rateId];
    if (!refs) return;

    const fMax = refs.formula_buy_max?.value || "";
    const fBuy = refs.formula_buy?.value || "BUY";

    const buyMaxResult = evaluateExclusiveFormula(fMax, { BUY: baseBuy, SELL: baseSell });
    const buyResult = evaluateExclusiveFormula(fBuy, {
      BUY: baseBuy,
      SELL: baseSell,
      MAX: buyMaxResult ?? undefined,
    });

    setPreviews((prev) => ({
      ...prev,
      [rateId]: { buy: buyResult, buyMax: buyMaxResult },
    }));

    const syntaxBuy = checkExclusiveSyntax(fBuy);
    const syntaxMax = checkExclusiveSyntax(fMax);

    let finalError: string | null = null;
    if (syntaxBuy) {
      finalError = `BUY Formula: ${syntaxBuy}`;
    } else if (syntaxMax) {
      finalError = `MAX Formula: ${syntaxMax}`;
    } else if (buyResult === null || buyMaxResult === null) {
      finalError = "Formula result is invalid (e.g. division by zero or exceeds limits)";
    } else if (buyResult > buyMaxResult) {
      finalError = `Buy rate (${buyResult}) cannot be greater than Max rate (${buyMaxResult})`;
    } else if (buyMaxResult >= baseSell) {
      finalError = `Max rate (${buyMaxResult}) must be lower than master sell rate (${baseSell})`;
    }

    setConflictIds((prev) => {
      const existing = prev.find((c) => c.id === rateId);
      if (finalError) {
        if (existing) {
          if (existing.text === finalError) return prev;
          return prev.map((c) => (c.id === rateId ? { ...c, text: finalError! } : c));
        }
        return [...prev, { id: rateId, text: finalError }];
      } else {
        if (!existing) return prev;
        return prev.filter((c) => c.id !== rateId);
      }
    });

    checkIsChanged();
  };

  const resetPreviews = () => {
    setPreviews({});
    setConflictIds([]);
  };

  return { previews, conflictIds, setConflictIds, computePreview, resetPreviews };
}
