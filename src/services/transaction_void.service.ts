import api from "./api.ts";
import type { TransactionVoid, VoidRequest } from "../types/transaction.ts";
import { API_ENDPOINTS } from "../config/api.config.ts";
import { mockTransactionsVoid } from "../data/mockData.ts";

export const transactionVoidService = {
  // ฟังก์ชันจำลองสำหรับการดึงข้อมูล Transaction (ใช้ mock data)
  getTranseMock(): TransactionVoid[] {
    return mockTransactionsVoid.map(
      (tran) =>
        ({
            id: tran.id,
            booth: tran.booth,
            user: tran.user,
            time: tran.time,
            rate: tran.rate,
            currency_name: tran.currency_name, // เพิ่มค่า currency_name ใน mock data
            type: tran.type,
            amount: tran.amount,
            status: tran.status,
        } as TransactionVoid)
    );
  },

  // ฟังก์ชันสำหรับการส่งคำขอ Void Transaction ไปยัง API
  async requestVoidTransaction(voidData: VoidRequest): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.TRANSACTION.VOID_REQUEST, voidData);
    } catch (error) {
      console.error("Failed to request void transaction:", error);
      throw error;
    }
  },


  // ฟังก์ชันสำหรับดึงรายการ Void Transaction ทั้งหมดจาก API
  async getVoidTransactions(): Promise<TransactionVoid[]> {
    try {
      const response = await api.get<{ data: TransactionVoid[] }>(
        API_ENDPOINTS.TRANSACTION.VOID_LIST,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch void transactions:", error);
      throw error;
    }
  },


  // ฟังก์ชันสำหรับอนุมัติการ Void Transaction
  async approveVoidTransaction(id: string): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.TRANSACTION.VOID_APPROVE(id));
    } catch (error) {
      console.error("Failed to approve void transaction:", error);
      throw error;
    }
  },


  // ฟังก์ชันสำหรับปฏิเสธการ Void Transaction
  async denyVoidTransaction(id: string): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.TRANSACTION.VOID_DENY(id));
    } catch (error) {
      console.error("Failed to deny void transaction:", error);
      throw error;
    }
  },
};
