// src/types/entities.ts

// 🚩 เพิ่มส่วนนี้เข้าไปเพื่อให้ไฟล์อื่น (เช่น transaction.ts) ดึงไปใช้ได้
export type UserRole = "ADMIN" | "MANAGER" | "STAFF";
export type TranStatus = "COMPLETED" | "PENDING" | "VOIDED" | "CANCELED"; // อิงตาม Database
export type TranType = "BUY" | "SELL";
export type MovementType = "IN" | "OUT"; // สำหรับการโอนเงินระหว่างสาขา

export interface User {
  id: number;
  username: string;
  name: string; // ชื่อ-นามสกุลจริง
  email: string;
  phone_number: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Booth {
  id: number;
  name: string;
  location: string;
  current_user_id: number | null;
  is_active: boolean;
  is_open: boolean; // เพิ่มเพื่อใช้ในหน้า UI
  crated_at: string;
}

export interface Shift {
  id: number;
  user_id: number;
  booth_id: number;
  date_shift: string;
  shift_start: string;
  shift_end?: string;
  total_receive: number;
  total_exchange: number;
  balance: number;
  balance_check: number;
  cash_advance: number;
  created_at: string;
  updated_at: string;
}


export interface Currency {
  code: string;
  name: string;
  symbol: string;
  buyRate: number;
  sellRate: number;
  is_active: boolean;
}

export interface ExchangeRate {
  id: number;
  currency_code: string;
  name: string;
  range_start: number;
  range_stop: number;
  formula_buy?: any; // แก้เป็น String ทีหลัง
  formula_sell?: any;  // แก้เป็น String ทีหลัง
  buy_rate: number;
  sell_rate: number;
  is_active : boolean; 
  updated_at: string;
}

