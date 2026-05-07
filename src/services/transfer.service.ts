import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export interface TransferTransaction {
  id: string;
  transactionNo: string;
  boothId: string;
  boothName?: string;
  refBoothId?: string;
  refBoothName?: string;
  amount: number;
  type: 'TRANSFER_IN' | 'TRANSFER_OUT' | 'CASH_IN' | 'CASH_OUT';
  exchangeRateId: string;
  exchangeRateName?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoothToBoothDto {
  boothId: string;
  refBoothId: string;
  amount: number;
  exchangeRateId: string;
}

export interface CenterToBoothDto {
  boothId: string;
  amount: number;
  type: 'CASH_IN' | 'CASH_OUT';
  exchangeRateId: string;
}

export const TransferService = {
  getAll: async (): Promise<TransferTransaction[]> => {
    const res = await api.get<TransferTransaction[]>(API_ENDPOINTS.TRANSFER_TRANSACTION.GET_ALL);
    return Array.isArray(res.data) ? res.data : [];
  },

  getByBooth: async (boothId: string): Promise<TransferTransaction[]> => {
    const res = await api.get<TransferTransaction[]>(API_ENDPOINTS.TRANSFER_TRANSACTION.GET_BY_BOOTH(boothId));
    return Array.isArray(res.data) ? res.data : [];
  },

  boothToBooth: async (dto: BoothToBoothDto): Promise<TransferTransaction> => {
    const res = await api.post<TransferTransaction>(
      API_ENDPOINTS.TRANSFER_TRANSACTION.BOOTH_TO_BOOTH,
      dto,
    );
    return res.data;
  },

  centerToBooth: async (dto: CenterToBoothDto): Promise<TransferTransaction> => {
    const res = await api.post<TransferTransaction>(
      API_ENDPOINTS.TRANSFER_TRANSACTION.CENTER_TO_BOOTH,
      dto,
    );
    return res.data;
  },

  cancel: async (transactionId: string): Promise<void> => {
    await api.post(API_ENDPOINTS.TRANSFER_TRANSACTION.CANCEL(transactionId));
  },
};
