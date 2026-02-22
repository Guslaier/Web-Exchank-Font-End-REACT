import api from "./api.ts";
import type {
  TransactionVoid,
  ExchangeTransaction,
} from "../types/transaction.ts";
import { API_ENDPOINTS } from "../config/api.config.ts";
export const transactionTransferService = {
  // ฟังก์ชันจำลองสำหรับการดึงข้อมูลการโอนเงิน teanfer
  async getTranse(): Promise<TransactionVoid[]> {
    try {
      const response = await api.get<{ data: TransactionVoid[] }>(
        API_ENDPOINTS.TRANSACTION.TRANSFER_LIST,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      throw error;
    }
  },

  createTransferBoothToBooth: async (
    transferData: Omit<ExchangeTransaction, "id" | "createdAt">,
  ): Promise<ExchangeTransaction> => {
    try {
      const response = await api.post<{ data: ExchangeTransaction }>(
        API_ENDPOINTS.TRANSACTION.TRANSFER_CREATE.BOOTH_TO_BOOTH,
        transferData,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create transfer:", error);
      throw error;
    }
  },

  createTransferBoothToBank: async (
    transferData: Omit<ExchangeTransaction, "id" | "createdAt">,
  ): Promise<ExchangeTransaction> => {
    try {
      const response = await api.post<{ data: ExchangeTransaction }>(
        API_ENDPOINTS.TRANSACTION.TRANSFER_CREATE.BOOTH_TO_BANK,
        transferData,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create transfer:", error);
      throw error;
    }
  },

  createTransferBankToBooth: async (
    transferData: Omit<ExchangeTransaction, "id" | "createdAt">,
  ): Promise<ExchangeTransaction> => {
    try {
      const response = await api.post<{ data: ExchangeTransaction }>(
        API_ENDPOINTS.TRANSACTION.TRANSFER_CREATE.BANK_TO_BOOTH,
        transferData,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create transfer:", error);
      throw error;
    }
  },

  cancelTransfer: async (id: string): Promise<void> => {
    try {
      await api.post(API_ENDPOINTS.TRANSACTION.TRANSFER_CANCEL(id));
    } catch (error) {
      console.error("Failed to cancel transfer:", error);
      throw error;
    }
  },

  getTransferHistory: async (): Promise<ExchangeTransaction[]> => {
    try {
      const response = await api.get<{ data: ExchangeTransaction[] }>(
        API_ENDPOINTS.TRANSACTION.TRANSFER_HISTORY,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch transfer history:", error);
      throw error;
    }
  },

  getTransferDetail: async (id: string): Promise<ExchangeTransaction> => {
    try {
      const response = await api.get<{ data: ExchangeTransaction }>(
        API_ENDPOINTS.TRANSACTION.TRANSFER_DETAIL(id),
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch transfer detail:", error);
      throw error;
    }
  },

  getTransferDetailsBooth: async (
    id: string,
  ): Promise<ExchangeTransaction[]> => {
    try {
      const response = await api.get<{ data: ExchangeTransaction[] }>(
        API_ENDPOINTS.TRANSACTION.TRANSFER_DETAILS_BOOTH(id),
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch transfer details for booth:", error);
      throw error;
    }
  },
};
