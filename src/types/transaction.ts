// src/types/transaction.ts

export type TransactionType = 'BUY' | 'SELL'; // อ้างอิงจาก exchange_transactions.type
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'VOIDED'; // อ้างอิงจาก Database default

export interface Transaction {
  transaction_no: string; // เปลี่ยนจาก id เป็น transaction_no ตาม Primary Key
  shift_id: number;       // เพิ่มเพื่อให้ตรงกับความสัมพันธ์ใน DB
  customer_id?: number;   // ความสัมพันธ์กับ Table customers
  currency_name: string;  // ดึงจาก exchange_rates
  type: TransactionType;
  exchange_rate: number;  // เรท ณ ตอนทำรายการ
  foreign_amount: number; // ยอดเงินต่างประเทศ
  thai_baht_amount: number; // ยอดเงินบาทสุทธิ
  status: TransactionStatus;
  created_at: string;
}

// สำหรับข้อมูลที่ใช้แสดงในหน้าตาราง "Request Void Transaction"
export interface TransactionVoid {
    id: string;
    booth: string;
    user: string;
    time: string;
    rate: number;
    currency_name: string;
    type: 'SALE' | 'REFUND' | 'VOID';
    amount: number;
    status: 'PENDING' | 'COMPLETED' | 'VOIDED';
}

// สำหรับการรับค่าจากหน้าจอ (Entry Form)
export interface TransactionEntry {
  shift_id: number;
  currency_name: string;
  type: TransactionType;
  foreign_amount: number;
  calculation_method: 'BOARD' | 'SPECIAL'; // ตาม Database note
}

// สำหรับส่งข้อมูลไป Void รายการ
export interface VoidRequest {
  transaction_no: string;
  void_reason: string;
  voided_by: number;      // User ID ของคนที่กด Void
}


export interface ExchangeTransaction {
  id: number;
  shift_id: number;
  customer_id?: number;
  currency_name: string;
  type: TransactionType;
  exchange_rate: number;
  foreign_amount: number;
  thai_baht_amount: number;
  status: TransactionStatus;
  created_at: string;
}

export interface TransferTransaction {
    transaction_no: string;
  booth_id: number[];
  currency_name: string;
  amount: number;
  type: 'TRANSFER' | 'RECEIVE';
  ref_booth_id?: number;
  ref_bank_account_id?: number;
  description?: string;
  user_id: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELED';
  created_at: string;
}

