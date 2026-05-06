// src/hooks/useSingleExchangeRateFormula.ts
// Hook สำหรับ ViewAllRates — แก้ไข Exchange Rate ทีละ 1 row (BASE formula, buy+sell)
import { useState, useEffect, useRef } from "react";
import {
  evaluateExchangeRateFormula,
  checkExchangeRateSyntax,
} from "./formulaEngine";

export interface SelectedExchangeRateCell {
  id: string;       // exchange_rate_id (= RateDetail.id)
  name: string;
  baseBuy: number;
  baseSell: number;
  formulaBuy: string;
  formulaSell: string;
  rangeStart: number;
  rangeStop: number;
  currentBuyRate: number;
  currentSellRate: number;
}

export function useSingleExchangeRateFormula(
  cell: SelectedExchangeRateCell | null,
) {
  const formulaBuyRef = useRef<HTMLInputElement>(null);
  const formulaSellRef = useRef<HTMLInputElement>(null);
  const rangeStartRef = useRef<HTMLInputElement>(null);
  const rangeStopRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<{
    buy: number | null;
    sell: number | null;
  }>({ buy: null, sell: null });
  const [conflictError, setConflictError] = useState<string | null>(null);

  // รีเซ็ตเมื่อเปลี่ยน cell
  useEffect(() => {
    setPreview({ buy: null, sell: null });
    setConflictError(null);
  }, [cell?.id]);

  const computePreview = () => {
    if (!cell) return;
    const fBuy = formulaBuyRef.current?.value || "BASE";
    const fSell = formulaSellRef.current?.value || "BASE";

    const buyResult = evaluateExchangeRateFormula(fBuy, cell.baseBuy);
    const sellResult = evaluateExchangeRateFormula(fSell, cell.baseSell);
    setPreview({ buy: buyResult, sell: sellResult });

    const buyErr = checkExchangeRateSyntax(fBuy);
    const sellErr = checkExchangeRateSyntax(fSell);

    let error: string | null = null;
    if (buyErr) {
      error = `BUY Formula: ${buyErr}`;
    } else if (sellErr) {
      error = `SELL Formula: ${sellErr}`;
    } else if (buyResult === null || sellResult === null) {
      error = "Formula result is invalid (e.g. division by zero or exceeds limits)";
    } else if (buyResult > sellResult) {
      error = `Buy (${buyResult}) cannot exceed Sell (${sellResult})`;
    } else {
      const start = parseFloat(rangeStartRef.current?.value || "");
      const stop = parseFloat(rangeStopRef.current?.value || "");
      if (!isNaN(start) && !isNaN(stop) && start >= stop) {
        error = "Range start must be less than range stop";
      }
    }
    setConflictError(error);
  };

  return {
    formulaBuyRef,
    formulaSellRef,
    rangeStartRef,
    rangeStopRef,
    preview,
    conflictError,
    computePreview,
  };
}
