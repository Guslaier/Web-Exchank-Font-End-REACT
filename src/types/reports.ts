// src/types/reports.ts

export interface CashflowReport {
  shift_id: number;
  denomination: string; // แบงค์ 1000, 500, 100
  quantity: number;
}

export interface StockReport {
  shift_id: number;
  currency_name: string;
  total_buy: number;
  total_sell: number;
  total_pending: number;
  total_transfer_in: number;
  total_transfer_out: number;
}

export interface Customer {
  id: number;
  passport_image_url: string;
  passport_no: string;
  full_name: string;
  nationality: string;
  phone_number: string;
}