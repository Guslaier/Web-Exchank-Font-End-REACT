// src/hooks/useSingleCellFormula.ts
// Hook สำหรับ ViewAllRates (single-cell preview + conflict)
import { useState, useRef, useEffect } from "react";
import {
  evaluateExclusiveFormula,
  checkExclusiveSyntax,
} from "./formulaEngine";

interface CellContext {
  rateId: string;
  baseBuy: number;
  baseSell: number;
}

export function useSingleCellFormula(cell: CellContext | null | undefined) {
  const [preview, setPreview] = useState<{
    buy: number | null;
    buyMax: number | null;
  }>({ buy: null, buyMax: null });
  const [conflictError, setConflictError] = useState<string | null>(null);
  const formulaBuyRef = useRef<HTMLInputElement>(null);
  const formulaBuyMaxRef = useRef<HTMLInputElement>(null);

  // รีเซ็ตเมื่อเปลี่ยน cell
  useEffect(() => {
    setPreview({ buy: null, buyMax: null });
    setConflictError(null);
  }, [cell?.rateId]);

  const computePreview = () => {
    if (!cell) return;
    const fBuy = formulaBuyRef.current?.value ?? "BUY";
    const fMax = formulaBuyMaxRef.current?.value ?? "";
    const { baseBuy, baseSell } = cell;

    const buyMaxResult = evaluateExclusiveFormula(fMax, { BUY: baseBuy, SELL: baseSell });
    const buyResult = evaluateExclusiveFormula(fBuy, {
      BUY: baseBuy,
      SELL: baseSell,
      MAX: buyMaxResult ?? undefined,
    });
    setPreview({ buy: buyResult, buyMax: buyMaxResult });

    const syntaxBuy = checkExclusiveSyntax(fBuy);
    const syntaxMax = checkExclusiveSyntax(fMax);
    let error: string | null = null;
    if (syntaxBuy) {
      error = `BUY Formula: ${syntaxBuy}`;
    } else if (syntaxMax) {
      error = `MAX Formula: ${syntaxMax}`;
    } else if (buyResult === null || buyMaxResult === null) {
      error = "Formula result is invalid (e.g. division by zero or exceeds limits)";
    } else if (buyResult > buyMaxResult) {
      error = `Buy (${buyResult}) cannot be greater than Max (${buyMaxResult})`;
    } else if (buyMaxResult >= baseSell) {
      error = `Max (${buyMaxResult}) must be lower than sell rate (${baseSell})`;
    }
    setConflictError(error);
  };

  return { formulaBuyRef, formulaBuyMaxRef, preview, conflictError, computePreview };
}
