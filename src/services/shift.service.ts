import api  from './api';
import type { ShiftData, UserData as UDTO, UserRole } from '../types/entities';
import { API_ENDPOINTS } from '../config/api.config';

export const ShiftService = {
    getByBooth: async (boothId: string) => {
        try {
            const response = await api.get<ShiftData>(API_ENDPOINTS.SHIFT.GET_BY_BOOTH(boothId));
            if (response.data !== null && response.data !== undefined ) {
                return (response.data);
            }
            return null;
        } catch (error) {
            throw error;
        }
    },
}