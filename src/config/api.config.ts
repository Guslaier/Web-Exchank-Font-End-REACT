// src/config/api.config.ts

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
} as const;

export const API_ENDPOINTS = {
  // ========== AUTH ==========
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
  },

  // ========== USER ==========
  USER: {
    FIND_ALL: '/users/find-all',
    FIND_ONE: (id: string) => `/users/find-one/${id}`,
    REGISTER: '/users/register',
    UPDATE: (id: string) => `/users/update/${id}`,
    DELETE: (id: string) => `/users/remove/${id}`,
    CHANGE_PASSWORD: (id: string) => `/users/change-password/${id}`,
    REQUEST_RESET_PASSWORD: '/users/request-reset-password',
    RESET_PASSWORD: '/users/reset-password',
    SET_DEACTIVATE: (id: string) => `/users/set-deactivate/${id}`,
    SET_REACTIVATE: (id: string) => `/users/set-reactivate/${id}`,
  },

  // ========== BOOTH ==========
  BOOTH: {
    CREATE: '/booths/create',
    FIND_ALL: '/booths/find-all',
    FIND_ONE: (id: string) => `/booths/${id}`,
    SET_CURRENT_SHIFT: (id: string) => `/booths/${id}/set-current-shift`,
    SET_DEACTIVE: (id: string) => `/booths/set-deactive/${id}`,
    ASSIGN_USER: (boothId: string) => `/booths/set-currentshift/${boothId}`,
    SET_REACTIVE: (id: string) => `/booths/set-reactive/${id}`,
    DELETE: (id: string) => `/booths/remove/${id}`,
    FIND_BY_SHIFT: (shiftId: string) => `/booths/find-by-shift/${shiftId}`,
    UPDATE: (id: string) => `/booths/update/${id}`,
  },

  // ========== CURRENCIES ==========
  CURRENCY: {
    UPDATE: '/currencies/update',
    GET_ALL: '/currencies',
    GET_BY_ID: (id: string) => `/currencies/${id}`,
    GET_BY_CODE: (code: string) => `/currencies/code/${code}`,
    MANUAL_UPDATE: '/currencies/manual-update',
    SET_MODE_BULK: '/currencies/mode',
  },

  // ========== EXCHANGE RATES ==========
  EXCHANGE_RATE: {
    GET_ALL: '/exchange-rates',
    UPDATE: (id: string) => `/exchange-rates/${id}`,
    DELETE: (id: string) => `/exchange-rates/${id}`,
    BULK_UPDATE: '/exchange-rates/bulk-update',
    ADD_RATE: '/exchange-rates/',
    SYNC_FORCE_ALL: '/exchange-rates/sync/force-all',
  },

  // ========== EXCLUSIVE EXCHANGE RATES ==========
  EXCLUSIVE_EXCHANGE_RATE: {
    UPDATE: (id: string) => `/exclusive-exchange-rates/${id}`,
    SYNC_AND_CLAMP: '/exclusive-exchange-rates/sync-and-clamp',
    PENDING_REVIEWS: '/exclusive-exchange-rates/pending-reviews',
    GET_ALL: '/exclusive-exchange-rates',
    GET_BY_ID: (id: string) => `/exclusive-exchange-rates/${id}`,
    GET_BY_EXCHANGE_HOUSE: (exhId: string) => `/exclusive-exchange-rates/booth/${exhId}`,
    GET_BY_CURRENCY: (currencyId: string) => `/exclusive-exchange-rates/currency/${currencyId}`,
    UPDATE_BULK: '/exclusive-exchange-rates/bulk-update',
  },

  // ========== EXCHANGE TRANSACTIONS ==========
  EXCHANGE_TRANSACTION: {
    CREATE: '/exchange-transactions',
    GET_BY_SHIFT: (shiftId: string) => `/exchange-transactions/shift/${shiftId}`,
    GET_DETAIL: (id: string) => `/exchange-transactions/${id}`,
    GET_MANY: '/exchange-transactions',
    SET_PENDING: (id: string) => `/exchange-transactions/${id}/set-pending`,
    SET_APPROVE: (id: string) => `/exchange-transactions/${id}/set-approve`,
  },

  // ========== SHIFTS ==========
  SHIFT: {
    OPEN: '/shifts/open',
    CLOSE: (id: string) => `/shifts/${id}/close`,
    SET_TOTAL_EXCHANGE: (id: string) => `/shifts/${id}/set-total-exchange`,
    SET_TOTAL_RECEIVE: (id: string) => `/shifts/${id}/set-total-receive`,
    GET_ACTIVE_SHIFTS: '/shifts/active',
    SUMMARIZE: (id: string) => `/shifts/${id}/summarize`,
    GET_SUMMARY: (id: string) => `/shifts/${id}/summary`,
    GET_ALL: '/shifts',
    GET_BY_ID: (id: string) => `/shifts/${id}`,
    GET_BY_BOOTH: (boothId: string) => `/shifts/booth/?id=${boothId}`,
  },

  // ========== CUSTOMERS ==========
  CUSTOMER: {
    GET_IMAGE: (id: string) => `/customers/${id}/image`,
  },

  // ========== SSE ==========
  SSE: {
    REFRESH: '/sse/refresh-signal',
  },

  // ========== TRANSFER TRANSACTIONS ==========
  TRANSFER_TRANSACTION: {
    BOOTH_TO_BOOTH_C2: '/transfer-transactions/booth-to-booth-c2',
    BOOTH_TO_BOOTH_C1: '/transfer-transactions/booth-to-booth-c1',
    CUSTOM_TO_BOOTH_IN: '/transfer-transactions/custom-to-booth-in',
    CUSTOM_TO_BOOTH_OUT: '/transfer-transactions/custom-to-booth-out',
    GET_ALL: '/transfer-transactions',
    GET_BY_ID: (id: string) => `/transfer-transactions/${id}`,
    GET_BY_BOOTH: (boothId: string) => `/transfer-transactions/booth/${boothId}`,
    GET_BY_SHIFT: (shiftId: string) => `/transfer-transactions/shift/${shiftId}`,
    GET_BY_DATE_RANGE: '/transfer-transactions/date-range',
    CANCEL: (id: string) => `/transfer-transactions/${id}/cancel`,
    FIRST_SHIFT_CASH_COUNT: '/transfer-transactions/first-shift-cash-count',
  },

  // ========== TRANSACTION RECORDS ==========
  TRANSACTION_RECORD: {
    EXCHANGE: '/transaction-records/exchange',
    TRANSFER: '/transaction-records/transfer',
    VOID: '/transaction-records/void',
  },

  // ========== TRANSACTION VOID ==========
  TRANSACTION_VOID: {
    REQUEST: '/transaction-void/request',
    GET_ALL: '/transaction-void',
    GET_BY_ID: (id: string) => `/transaction-void/${id}`,
    APPROVE: (id: string) => `/transaction-void/${id}/approve`,
    DENY: (id: string) => `/transaction-void/${id}/deny`,
  },

  // ========== LOGS ==========
  LOG: {
    GET_ALL: '/logs',
    GET_BY_DATE_RANGE: '/logs/date-range',
  },
} as const;

export const STORAGE_KEYS = {
  // Auth
  TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  
  // Session
  SHIFT_ID: 'currentShiftId',
  BOOTH_ID: 'activeBoothId',
  EXCHANGE_HOUSE_ID: 'exchangeHouseId',
  
  // UI
  THEME: 'app-theme',
  LANGUAGE: 'app-language',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const API_ERRORS = {
  SHIFT_ALREADY_OPEN: 'USER_HAS_ACTIVE_SHIFT',
  BOOTH_OCCUPIED: 'BOOTH_ALREADY_IN_USE',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_TRANSACTION: 'INVALID_TRANSACTION',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  INVALID_REQUEST: 'INVALID_REQUEST',
} as const;

