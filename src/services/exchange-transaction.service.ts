import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export type TranStatus = 'COMPLETED' | 'PENDING' | 'VOIDED' | 'CANCELED';
export type TranType = 'BUY' | 'SELL';

export interface ExchangeTransaction {
  id: string;
  type: TranType;
  status: TranStatus;
  exchangeRateId: string;
  exchangeRateName: string;
  foreignCurrencyAmount: number;
  totalthaiBahtAmount: number;
  exchangeRate: number;
  voidReason?: string;
  voidedBy?: string;
  approvedBy?: string;
  note?: string;
  customerId?: string;
  updatedAt: string;
  createdAt?: string;
  transaction?: {
    id: string;
    shiftId: string;
    createdAt: string;
  };
}

export const ExchangeTransactionService = {
  /** GET /exchange-transactions/many — ADMIN/MANAGER */
  getMany: async (limit = 200, offset = 0): Promise<ExchangeTransaction[]> => {
    const res = await api.get<ExchangeTransaction[]>(
      `${API_ENDPOINTS.EXCHANGE_TRANSACTION.GET_MANY}?limit=${limit}&offset=${offset}`,
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /exchange-transactions/shift?id=:shiftId */
  getByShift: async (shiftId: string): Promise<ExchangeTransaction[]> => {
    const res = await api.get<ExchangeTransaction[]>(
      API_ENDPOINTS.EXCHANGE_TRANSACTION.GET_BY_SHIFT(shiftId),
    );
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /exchange-transactions?id=:id */
  getDetail: async (id: string): Promise<ExchangeTransaction> => {
    const res = await api.get<ExchangeTransaction>(
      API_ENDPOINTS.EXCHANGE_TRANSACTION.GET_DETAIL(id),
    );
    return res.data;
  },

  /** PUT /exchange-transactions/approve/pending/:id — ADMIN/MANAGER */
  approvePending: async (
    id: string,
    status: 'VOIDED' | 'CANCELED',
  ): Promise<void> => {
    await api.put(API_ENDPOINTS.EXCHANGE_TRANSACTION.SET_APPROVE(id), { status });
  },
};
