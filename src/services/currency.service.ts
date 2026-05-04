// src/services/currency.service.ts
import api from "./api";
import { API_ENDPOINTS } from "../config/api.config";
import type { ExchangeRate } from "../types/entities";
import { add } from "mathjs";

// ===== Types =====

export type UpdateMode = "AUTO" | "MANUAL";

/** รายการสกุลเงินหลักจาก GET /currencies */
export interface CurrencyData {
  id: string;
  code: string;
  name: string;
  symbol: string | null;
  buyRate: string;
  sellRate: string;
  isActive: boolean;
  updateMode: UpdateMode;
  hasInitialBotData: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** รายละเอียด Exclusive ที่อยู่ใน exclusive_details ของ BoothExchangeRate */
export interface ExclusiveDetail {
  exchange_rate_id: string;
  formula_buy: string;
  formula_buy_max: string;
  buy_rate: string;
  buy_rate_max: string;
  sync_status: string;
  is_reviewed: boolean;
}

/** Exchange Rate รายการเดียวของบูธ */
export interface BoothExchangeRate {
  exchange_rate_id: string;
  name: string; // currency code เช่น EUR, USD
  rate_start: number;
  rate_stop: number;
  base_buy: number;
  base_sell: number;
  formula_buy?: string;
  formula_sell?: string;
  exclusive_details: ExclusiveDetail[];
}

/** ข้อมูล Exchange Rate ของบูธทั้งหมด */
export interface BoothRates {
  booth_id: string;
  booth_name: string;
  exchange_rates: BoothExchangeRate[];
}
export interface RateDetail {
  id: string;
  name: string;
  range_start: number;
  range_stop: number;
  formula_buy: string;
  formula_sell: string;
  buy_rate: number;
  sell_rate: number;
}

export interface CurrencyData {
  currencyInfo: {
    id: string;
    code: string;
    name: string;
    buyRate: string;
    sellRate: string;
  };
  rates: RateDetail[]; // 🚩 สังเกตการใช้ [] วางไว้หลังสุด
}
export interface UpdateCurrencyData {
  id: string;
  buyRate: number;
  sellRate: number;
  isActive: boolean;
}

export interface ExclusiveRateData {
  base_buy_rate: number;
  base_sell_rate: number;
  booth_id: string;
  booth_name: string;
  buy_rate: string;
  buy_rate_max: string;
  exchange_rate_id: string;
  formula_buy: string;
  formula_buy_max: string;
  id: string;
  is_reviewed: boolean;
  name: string;
  range_start: number;
  range_stop: number;
  sync_status: string;
}

export interface UpdateExchangeRateData {
  id: string;
  name: string;
  range_start: number;
  range_stop: number;
  formula_buy: string;
  formula_sell: string;
}
// ===== Currency Service (Central Rate Base) =====

export const CurrencyService = {
  /** GET /currencies */
  getAll: async (): Promise<CurrencyData[]> => {
    const res = await api.get<CurrencyData[]>(API_ENDPOINTS.CURRENCY.GET_ALL);
    return res.data as CurrencyData[];
  },

  /** PATCH /currencies/manual-update — บันทึกเรทที่แก้ด้วยมือ */
  manualUpdate: async (updates: UpdateCurrencyData[]): Promise<void> => {
    await api.patch(API_ENDPOINTS.CURRENCY.MANUAL_UPDATE, { data: updates });
  },

  /** PATCH /currencies/set-mode-auto — เปลี่ยน mode เป็น AUTO สำหรับรายการที่เลือก */
  setModeAuto: async (ids: string[]): Promise<void> => {
    await api.patch(API_ENDPOINTS.CURRENCY.SET_MODE_BULK, {
      data: ids.map((i) => ({ id: i, mode: "AUTO" })),
    });
  },

  /** PATCH /currencies/set-mode-manual — เปลี่ยน mode เป็น MANUAL สำหรับรายการที่เลือก */
  setModeManual: async (ids: string[]): Promise<void> => {
    await api.patch(API_ENDPOINTS.CURRENCY.SET_MODE_BULK, {
      data: ids.map((i) => ({ id: i, mode: "MANUAL" })),
    });
  },
};

// ===== Exchange Rate Service (Formula Rate) =====

export const ExchangeRateService = {
  /** GET /exchange-rates — คืนค่า ExchangeRate[] */
  getAll: async (): Promise<CurrencyData> => {
    try {
      const res = await api.get<CurrencyData>(
        API_ENDPOINTS.EXCHANGE_RATE.GET_ALL,
      );
      console.log("ExchangeRateService.getAll: Received data", res.data);
      return res.data;
    } catch (err) {
      console.error("ExchangeRateService.getAll", err);
      return null as any; // หรือ throw err; ขึ้นอยู่กับการจัดการ error ที่ต้องการ
    }
  },

  /** POST /exchange-rates/bulk-update */
  bulkUpdate: async (
    rates: UpdateExchangeRateData[],
  ): Promise<void> => {
    await api.post(API_ENDPOINTS.EXCHANGE_RATE.BULK_UPDATE, { "updates": rates });
  },

  /** POST /exchange-rates/sync/force-all */
  syncForceAll: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.EXCHANGE_RATE.SYNC_FORCE_ALL);
  },

  addRate: async (currencyId: string): Promise<void> => {
    await api.post(API_ENDPOINTS.EXCHANGE_RATE.ADD_RATE, { currencyId });
  },

  delete: async (currencyId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.EXCHANGE_RATE.DELETE(currencyId));
  },
};

// ===== Exclusive Exchange Rate Service =====

export const ExclusiveRateService = {
  /** GET /exclusive-exchange-rates */
  getAll: async (): Promise<ExclusiveRateData[]> => {
    const res = await api.get<ExclusiveRateData[]>(
      API_ENDPOINTS.EXCLUSIVE_EXCHANGE_RATE.GET_ALL,
    );
    return res.data;
  },

  /** GET /exclusive-exchange-rates/exchange-house/{boothId} */
  getByBooth: async (boothId: string): Promise<ExclusiveRateData[]> => {
    const res = await api.get<ExclusiveRateData[]>(
      API_ENDPOINTS.EXCLUSIVE_EXCHANGE_RATE.GET_BY_EXCHANGE_HOUSE(boothId),
    );
    return res.data;
  },

  /** PATCH /exclusive-exchange-rates/{id} */
  update: async (
    id: string,
    data: { formula_buy_max: string },
  ): Promise<void> => {
    await api.patch(API_ENDPOINTS.EXCLUSIVE_EXCHANGE_RATE.UPDATE(id), data);
  },

  /** PATCH /exclusive-exchange-rates/bulk-update */
  bulkUpdate: async (
    rates: UpdateExchangeRateData[],
  ): Promise<void> => {
    try {
    await api.post(API_ENDPOINTS.EXCLUSIVE_EXCHANGE_RATE.UPDATE_BULK, { "updates": rates });
    } catch (err) {
      console.error("ExclusiveRateService.bulkUpdate", err);
      throw err; // ให้ error ถูกส่งต่อไปยัง caller เพื่อจัดการต่อไป
    }
  },

  /** POST /exclusive-exchange-rates/sync-and-clamp */
  syncAndClamp: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.EXCLUSIVE_EXCHANGE_RATE.SYNC_AND_CLAMP);
  },
};
