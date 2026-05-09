import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export interface EmployeeReportShiftData {
  id: string;
  startTime: string;
  endTime: string | null;
  balance_check: number | null;
  cash_advance: number | null;
  booth?: {
    id: string;
    name: string;
  } | null;
}

export interface EmployeeReportUserData {
  id: string;
  username: string;
  email: string;
  shifts?: EmployeeReportShiftData[];
}

export interface EmployeePerformanceData {
  id: string;
  totalBalanceCheck: number;
  totalCashAdvance: number;
  reportMonth: string;
  user: EmployeeReportUserData;
}

export const reportService = {
  getAll: async (startDate?: Date, endDate?: Date): Promise<EmployeePerformanceData[]> => {
    const params =
      startDate && endDate
        ? {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            withShifts: 'true',
          }
        : undefined;

    const response = await api.get<EmployeePerformanceData[]>(API_ENDPOINTS.REPORT.GET_ALL, {
      params,
    });

    return Array.isArray(response.data) ? response.data : [];
  },

  getByUser: async (userId: string, date: Date, withShifts = false): Promise<EmployeePerformanceData | null> => {
    const response = await api.get<EmployeePerformanceData | null>(API_ENDPOINTS.REPORT.GET_BY_USER(userId), {
      params: {
        date: date.toISOString(),
        withShifts: String(withShifts),
      },
    });

    return response.data ?? null;
  },

  getDetail: async (id: string): Promise<EmployeePerformanceData> => {
    const response = await api.get<EmployeePerformanceData>(API_ENDPOINTS.REPORT.GET_DETAIL(id));
    return response.data;
  },

  syncUser: async (userId: string, date?: Date): Promise<EmployeePerformanceData> => {
    const response = await api.put<EmployeePerformanceData>(
      API_ENDPOINTS.REPORT.SYNC(userId),
      date ? { date: date.toISOString() } : undefined,
    );
    return response.data;
  },
};