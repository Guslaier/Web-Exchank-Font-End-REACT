// src/types/transaction.ts
import type { TranStatus, TranType, MovementType } from './entities'; // ดึงประเภทต่างๆ จาก entities.ts เพื่อความสอดคล้องกัน

export interface TransactionBase {
  transaction_no: string; // Primary Key
  shift_id: number;
  type: string;
}

export interface ExchangeTransaction extends TransactionBase {
  customer_id?: number;
  currency_name: string;
  type: TranType;
  exchange_rate: number;
  foreign_amount: number;
  calculation_method: 'BOARD' | 'SPECIAL';
  thai_baht_amount: number;
  status: TranStatus;
  void_reason?: string;
  voided_by?: number;
  approved_by?: number;
  created_at: string;
}

export interface TransferTransaction extends TransactionBase {
  booth_id: number; // สาขาต้นทาง
  currency_name: string;
  amount: number;
  type: MovementType; // IN หรือ OUT
  ref_booth_id?: number; // สาขาปลายทาง (กรณีโอนระหว่างสาขา)
  description?: string;
  user_id: number;
  status: TranStatus;
  created_at: string;
}

// สำหรับ UI ตาราง Request Void
export interface TransactionVoid {
    id: string; // ตรงกับ transaction_no
    booth: string;
    user: string;
    time: string;
    rate: number;
    currency_name: string;
    type: 'SALE' | 'REFUND' | 'VOID' | string;
    amount: number;
    status: TranStatus;
}