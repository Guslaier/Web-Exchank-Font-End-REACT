import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export interface SystemLog {
  id: string;
  userId: string | null;
  action: string;
  details: string;
  createdAt: string;
  updatedAt?: string;
}

export const SystemLogService = {
  /** GET /system-logs?date=:date */
  getAll: async (date?: string): Promise<SystemLog[]> => {
    const params = date ? `?date=${date}` : '';
    const res = await api.get<SystemLog[]>(`${API_ENDPOINTS.SYSTEM_LOG.GET_ALL}${params}`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
