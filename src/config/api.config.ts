// src/config/api.config.ts

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    LIST: '/users',
    PROFILE: '/user/profile',
    CREATE: '/users',
    DETAIL: (id: number) => `/users/${id}`,
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
  },
  // 🚩 เพิ่มส่วนการจัดการบูธ (Table: booths)
  BOOTH: {
    LIST: '/booths',
    DETAIL: (id: string) => `/booths/${id}`,
    STATUS: '/booths/status', // สำหรับหน้า Grid 15 บูธ
    ASSIGN: '/booths/assign', // สำหรับมอบหมายบูธให้พนักงาน
    CREATE: '/booths',
    DELETE: (id: string) => `/booths/${id}`,
    UPDATE_STATUS: (id: string) => `/booths/${id}/status`, // สำหรับหน้า Manage Booth  

  },

  // 🚩 เพิ่มส่วนการจัดการกะทำงาน (Table: shifts)
  SHIFT: {
    OPEN: '/shifts/open',
    CLOSE: '/shifts/close',
    CURRENT: '/shifts/current',
    REPORT: (id: number) => `/shifts/${id}/report`, // สำหรับรายงานส่งเวร
  },

  // 🚩 เพิ่มส่วนธุรกรรม (Table: transactions & exchange_transactions)
  TRANSACTION: {
    // สำหรับหน้า Manage Transaction
    EXCHANGE: '/transactions/exchange',
    TRANSFER: '/transactions/transfer',
    HISTORY: '/transactions/history',
    AUDIT: '/transactions/audit', // สำหรับรายงานตรวจสอบ


    // สำหรับหน้า Void Transaction
    VOID_REQUEST: '/transactions/void-request', // สำหรับส่งคำขอ void transaction
    VOID_LIST: '/transactions/void', // สำหรับดึงรายการ void transaction ทั้งหมด
    VOID_DETAIL: (id: string) => `/transactions/void/${id}`, // สำหรับดึงข้อมูล void transaction รายตัว
    VOID_APPROVE: (id: string) => `/transactions/void/${id}/approve`, // สำหรับอนุมัติ void transaction
    VOID_DENY: (id: string) => `/transactions/void/${id}/deny`, // สำหรับปฏิเสธ void transaction


    // สำหรับหน้า Record Trading
    RECORD: '/transactions/record',
    PENDING: '/transactions/pending',
    UPDATE_STATUS: '/transactions/update-status', // สำหรับอัพเดตสถานะ transaction


    // สำหรับหน้า Transaction transfer
    TRANSFER_CREATE: {
        BOOTH_TO_BOOTH: '/transactions/transfer/booth-to-booth',
        BOOTH_TO_BANK: '/transactions/transfer/booth-to-bank',
        BANK_TO_BOOTH: '/transactions/transfer/bank-to-booth',
    },
    TRANSFER_HISTORY: '/transactions/transfer/history',
    TRANSFER_CANCEL: (id: string) => `/transactions/transfer/cancel/${id}`, // สำหรับยกเลิกการโอนเงิน
    TRANSFER_LIST: '/transactions/transfer/list', // สำหรับดึงรายการโอนเงินทั้งหมด
    TRANSFER_DETAIL: (id: string) => `/transactions/transfer/${id}`, // สำหรับดึงข้อมูลการโอนเงินรายตัว
    TRANSFER_DETAILS_BOOTH: (id: string) => `/transactions/transfer/booth/${id}`, // สำหรับดึงข้อมูลการโอนเงินที่เกี่ยวข้องกับบูธรายตัว

    

  },

  // 🚩 เพิ่มส่วนข้อมูลลูกค้าและเรทเงิน (Table: customers & exchange_rates)
  CURRENCY: {
    RATES: '/currencies/rates',
    EXCLUSIVE: '/currencies/exclusive-rates',
  }
  // เพิ่ม endpoints อื่นๆ ตามที่ต้องการ
} as const;

export const STORAGE_KEYS = {
  // ... (TOKEN, USER เดิม)
  SHIFT_ID: 'currentShiftId', // สำหรับเก็บ ID กะที่กำลังทำงาน
  BOOTH_ID: 'activeBoothId',  // บูธที่เลือกไว้ในหน้า Manage Booth
  THEME: 'app-theme',         // สำหรับเก็บสถานะ Dark Mode
  TOKEN: 'authToken', // สำหรับเก็บ JWT Token
  REFRESH_TOKEN: 'refreshToken', // สำหรับเก็บ refresh token (ถ้ามี)
} as const;

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

// เพิ่มเติมส่วนจัดการ Error Message (Optional)
export const API_ERRORS = {
  SHIFT_ALREADY_OPEN: 'USER_HAS_ACTIVE_SHIFT',
  BOOTH_OCCUPIED: 'BOOTH_ALREADY_IN_USE',
} as const;

