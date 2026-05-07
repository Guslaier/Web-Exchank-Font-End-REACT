import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export interface ShiftRecord {
  id: string;
  userId: string;
  boothId: string;
  startTime: string;
  endTime: string | null;
  status: string;
  balance_check: number | null;
  cash_advance: number | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; username: string };
  booth?: { id: string; name: string; location: string };
}

export const ShiftAdminService = {
  /** GET /shifts/actives */
  getActives: async (): Promise<ShiftRecord[]> => {
    const res = await api.get<ShiftRecord[]>(API_ENDPOINTS.SHIFT.GET_ACTIVES);
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /shifts?date=:date */
  getAll: async (date?: string): Promise<ShiftRecord[]> => {
    const params = date ? `?date=${date}` : '';
    const res = await api.get<ShiftRecord[]>(`${API_ENDPOINTS.SHIFT.GET_ALL}${params}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /** PUT /shifts/audit/:id */
  audit: async (id: string, body: { balance_check?: number; cash_advance?: number; note?: string }): Promise<void> => {
    await api.put(API_ENDPOINTS.SHIFT.AUDIT(id), body);
  },

  /** POST /shifts — open shift */
  open: async (boothId: string): Promise<ShiftRecord> => {
    const res = await api.post<ShiftRecord>(API_ENDPOINTS.SHIFT.OPEN, { boothId });
    return res.data;
  },

  /** PUT /shifts — close shift */
  close: async (shiftId: string): Promise<void> => {
    await api.put(API_ENDPOINTS.SHIFT.CLOSE, { shiftId });
  },
};
