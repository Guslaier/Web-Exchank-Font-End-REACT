// src/types/entities.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone_number: string;
  role: UserRole; // อิงจาก user_role ใน DB
  is_active: boolean;
  created_at: string;
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
}

export interface Currency {
  code: string; // USD, EUR
  name: string;
  symbol: string;
  buyRate: number;
  sellRate: number;
  is_active: boolean;
}