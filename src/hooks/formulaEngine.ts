// src/hooks/formulaEngine.ts
// Pure utility functions (no React) สำหรับคำนวณสูตร
import { evaluate } from "mathjs";

const MAX_DB_VALUE = 99999999999.9999;

// ─────────────────────────────────────────────────────────────────────────────
// Exclusive Formula Engine  (รองรับ BUY, SELL, MAX, BASE)
// ─────────────────────────────────────────────────────────────────────────────

export function evaluateExclusiveFormula(
  formula: string,
  variables: { BUY: number; SELL: number; MAX?: number },
): number | null {
  if (!formula) return variables.BUY;
  const upper = formula.toUpperCase().trim();
  if (upper === "BUY") return variables.BUY;
  if (upper === "SELL") return variables.SELL;
  if (upper === "MAX" && variables.MAX !== undefined) return variables.MAX;
  if (upper === "BASE") return variables.BUY;
  if (formula.length > 100) return null;
  try {
    const scope = {
      BUY: variables.BUY,
      buy: variables.BUY,
      SELL: variables.SELL,
      sell: variables.SELL,
      MAX: variables.MAX ?? variables.BUY,
      BASE: variables.BUY,
      base: variables.BUY,
    };
    const result = evaluate(formula, scope);
    const finalValue = Number(result);
    if (isNaN(finalValue) || !isFinite(finalValue)) return null;
    if (Math.abs(finalValue) > MAX_DB_VALUE) return null;
    return parseFloat(finalValue.toFixed(6));
  } catch {
    return null;
  }
}

export function checkExclusiveSyntax(formula: string): string | null {
  if (!formula) return null;
  const forbidden = formula.replace(/[0-9.+\-*/^()\s]|BASE|BUY|SELL|MAX/gi, "");
  if (forbidden.length > 0) return `Forbidden characters: ${forbidden}`;
  if (/[+\-*/]{2,}/.test(formula.replace(/\s/g, "")) && !/[+\-*/]-/.test(formula))
    return "Invalid operator sequence";
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exchange Rate Formula Engine  (รองรับ BASE เท่านั้น)
// ─────────────────────────────────────────────────────────────────────────────

export function evaluateExchangeRateFormula(
  formula: string,
  baseValue: number,
): number | null {
  if (!formula || formula.toUpperCase() === "BASE") return baseValue;
  if (formula.length > 100) return null;
  try {
    const scope = { BASE: baseValue, base: baseValue };
    const result = evaluate(formula, scope);
    const finalValue = Number(result);
    if (isNaN(finalValue) || !isFinite(finalValue)) return null;
    if (Math.abs(finalValue) > MAX_DB_VALUE) return null;
    return parseFloat(finalValue.toFixed(6));
  } catch {
    return null;
  }
}

export function checkExchangeRateSyntax(formula: string): string | null {
  if (!formula) return null;
  const forbidden = formula.replace(/[0-9.+\-*/^()\s]|BASE/gi, "");
  if (forbidden.length > 0) return `Forbidden characters: ${forbidden}`;
  if (/[+\-*/]{2,}/.test(formula.replace(/\s/g, "")) && !/[+\-*/]-/.test(formula))
    return "Invalid operator sequence";
  return null;
}
