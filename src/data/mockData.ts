import type { AuthResponse } from "../types/auth.ts";
import type { Booth } from "../types/entities.ts";
import type { User } from "../types/entities.ts";
import type { TransactionVoid } from "../types/transaction.ts";


// ข้อมูลบูธจำลอง 15 รายการ
// id: number;
//     name: string;
//     location: string;
//     current_user_id: number | null;
//     is_active: boolean;
//     is_open: boolean; // เพิ่มเพื่อใช้ในหน้า UI
//     crated_at: string;
// }
export const mockBooths:Booth[] = [
  { id: 1, name: '7-11', location: 'Floor 1, Zone A', current_user_id: 1, is_active: true, is_open: true, crated_at: new Date().toISOString() },
  { id: 2, name: 'Lotus', location: 'Floor 1, Zone B', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 3, name: 'Siam', location: 'Floor 2, Zone A', current_user_id: 2, is_active: true, is_open: true, crated_at: new Date().toISOString() },
  { id: 4, name: 'Station', location: 'Floor 2, Zone B', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 5, name: 'MK', location: 'Floor 3, Zone A', current_user_id: 3, is_active: true, is_open: true, crated_at: new Date().toISOString() },
  { id: 6, name: 'Airport', location: 'Floor 3, Zone B', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 7, name: 'Silom', location: 'Floor 4, Zone A', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 8, name: 'Central', location: 'Floor 4, Zone B', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 9, name: 'MBK', location: 'Floor 5, Zone A', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 10, name: 'Emporium', location: 'Floor 5, Zone B', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 11, name: 'Paragon', location: 'Floor 6, Zone A', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 12, name: 'Gaysorn', location: 'Floor 6, Zone B', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 13, name: 'IconSiam', location: 'Floor 7, Zone A', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 14, name: 'Terminal 21', location: 'Floor 7, Zone B', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
  { id: 15, name: 'Union Mall', location: 'Floor 8, Zone A', current_user_id: null, is_active: true, is_open: false, crated_at: new Date().toISOString() },
];

// ข้อมูลธุรกรรมจำลอง 12 รายการ
export const mockTransactionsVoid: TransactionVoid[] = [
  { id: 'TXN001', booth: '7-11', user: 'gool_staff', time: '2026-02-22T10:00:00Z', rate: 30.5, currency_name: 'USD', type: 'SALE', amount: 1000, status: 'PENDING' },
  { id: 'TXN002', booth: 'Lotus', user: 'user_01', time: '2026-02-22T11:00:00Z', rate: 30.0, currency_name: 'EUR', type: 'BUY', amount: 500, status: 'COMPLETED' },
  { id: 'TXN003', booth: 'Siam', user: 'user_02', time: '2026-02-22T12:00:00Z', rate: 29.8, currency_name: 'JPY', type: 'SALE', amount: 2000, status: 'VOIDED' },
  { id: 'TXN004', booth: 'Station', user: 'gool_staff', time: '2026-02-22T13:00:00Z', rate: 30.2, currency_name: 'USD', type: 'SALE', amount: 1500, status: 'PENDING' },
  { id: 'TXN005', booth: 'MK', user: 'user_01', time: '2026-02-22T14:00:00Z', rate: 30.1, currency_name: 'EUR', type: 'BUY', amount: 700, status: 'COMPLETED' },
  { id: 'TXN006', booth: 'Airport', user: 'user_02', time: '2026-02-22T15:00:00Z', rate: 29.9, currency_name: 'JPY', type: 'SALE', amount: 3000, status: 'VOIDED' },
  { id: 'TXN007', booth: 'Silom', user: 'gool_staff', time: '2026-02-22T16:00:00Z', rate: 30.3, currency_name: 'USD', type: 'SALE', amount: 1200, status: 'PENDING' },
  { id: 'TXN008', booth: 'Central', user: 'user_01', time: '2026-02-22T17:00:00Z', rate: 30.0, currency_name: 'EUR', type: 'BUY', amount: 600, status: 'COMPLETED' },
  { id: 'TXN009', booth: 'MBK', user: 'user_02', time: '2026-02-22T18:00:00Z', rate: 29.7, currency_name: 'JPY', type: 'SALE', amount: 2500, status: 'VOIDED' },
  { id: 'TXN010', booth: 'Emporium', user: 'gool_staff', time: '2026-02-22T19:00:00Z', rate: 30.4, currency_name: 'USD', type: 'SALE', amount: 1800, status: 'PENDING' },
  { id: 'TXN011', booth: 'Paragon', user: 'user_01', time: '2026-02-22T20:00:00Z', rate: 30.2, currency_name: 'EUR', type: 'BUY', amount: 800, status: 'COMPLETED' },
  { id: 'TXN012', booth: 'Gaysorn', user: 'user_02', time: '2026-02-22T21:00:00Z', rate: 29.8, currency_name: 'JPY', type: 'SALE', amount: 3500, status: 'VOIDED' },
];


export const mockUsers: User[] = [
  { id: 1, username: 'admin_test', email: 'admin@test.com', role: 'MANAGER', created_at: new Date().toISOString(), is_active: true, name: 'Admin Test', phone_number: '081-234-5678' },
  { id: 2, username: 'user_01', email: 'user01@test.com', role: 'STAFF', created_at: new Date().toISOString(), is_active: true, name: 'User 01', phone_number: '081-234-5679' },
  { id: 3, username: 'user_02', email: 'user02@test.com', role: 'STAFF', created_at: new Date().toISOString(), is_active: true, name: 'User 02', phone_number: '081-234-5680' },
];

export const mockStaffAuth: AuthResponse = {
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: 101,
    username: "gool_staff",
    name: "คุณสมชาย สายขยัน",
    email: "gool_staff@test.com",
    phone_number: "081-234-5678",
    role: 'STAFF',
    is_active: true,
    created_at: "2026-01-15T08:00:00Z"
  },
  currentShift: {
    id: 201,
    user_id: 101,
    booth_id: 1,
    date_shift: "2026-02-22",
    shift_start: "2026-02-22T08:00:00Z",
    total_receive: 50000,
    total_exchange: 30000,
    balance: 20000,
    balance_check: 20000,
    cash_advance: 5000,
    created_at: "2026-02-22T08:00:00Z",
    updated_at: "2026-02-22T12:00:00Z"
  }
};

// 🚩 กรณีที่ 2: Admin ที่เข้าสู่ระบบจัดการหลังบ้าน (ไม่มี currentShift)
export const mockAdminAuth: AuthResponse = {
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin...",
  user: {
    id: 1,
    username: "admin_master",
    name: "System Administrator",
    email: "admin_master@test.com",
    phone_number: "02-123-4567",
    role: 'MANAGER',
    is_active: true,
    created_at: "2025-12-01T00:00:00Z"
  }
};