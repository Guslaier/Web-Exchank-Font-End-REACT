import api  from './api';
import type { BoothData} from '../types/entities';
import { API_ENDPOINTS } from '../config/api.config';

export const BoothService = {
    // Get all booths
    getAllBooths: async (): Promise<BoothData[]> => {
        try {
            const response = await api.get<BoothData[]>(API_ENDPOINTS.BOOTH.FIND_ALL);
            console.log("Fetched booths:", response);
            if (response.data && Array.isArray(response.data)) {
                return response.data as BoothData[];
            } else {
                alert('Invalid response format: expected an array of booths');
                throw new Error('Invalid response format: expected an array of booths');
            }
        } catch (error) {
            console.error('Failed to fetch booths:', error);
            throw error;
        }
    },
    findone: async (id: string): Promise<BoothData> => {
        try {
            const response = await api.get<BoothData>(`${API_ENDPOINTS.BOOTH.FIND_ONE}/${id}`);
            console.log(`Fetched booth ${id}:`, response);
            if (response.data) {
                return response.data as BoothData; 
            } else {
                throw new Error(`Invalid response format: expected booth data for id ${id}`);
            }
        } catch (error) {
            console.error(`Failed to fetch booth ${id}:`, error);
            throw error;
        }
    },
    findbyshift: async (shiftId: string): Promise<BoothData[]> => {
        try {
            const response = await api.get<BoothData[]>(`${API_ENDPOINTS.BOOTH.FIND_BY_SHIFT}/${shiftId}`);
            console.log(`Fetched booths for shift ${shiftId}:`, response);
            if (response.data && Array.isArray(response.data)) {
                return response.data as BoothData[];
            } else {
                
                throw new Error(`Invalid response format: expected an array of booths for shift ${shiftId}`);
            }
        } catch (error) {
            console.error(`Failed to fetch booths for shift ${shiftId}:`, error);
            throw error;
        }
    },

    // Toggle booth status
    toggleBoothActive: async (id: string): Promise<void> => {
        try {
            await api.put(API_ENDPOINTS.BOOTH.SET_REACTIVE(id));
        } catch (error) {
            console.error(`Failed to toggle booth status for booth ${id}:`, error);
            throw error;
        }
    },
    toggleBoothDeActive: async (id: string): Promise<void> => {
        try {
            await api.put(API_ENDPOINTS.BOOTH.SET_DEACTIVE(id));
        } catch (error) {
            console.error(`Failed to toggle booth status for booth ${id}:`, error);
            throw error;
        }
    },
    createBooth: async (boothData: Partial<BoothData>): Promise<BoothData> => {
        try {
            const response = await api.post<BoothData>(API_ENDPOINTS.BOOTH.CREATE, boothData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    updateBooth: async (id: string, boothData: Partial<BoothData>): Promise<BoothData> => {
        try {
            const response = await api.put<BoothData>(API_ENDPOINTS.BOOTH.UPDATE(id), boothData);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    deleteBooth: async (id: string): Promise<void> => {
        try {
            await api.delete(API_ENDPOINTS.BOOTH.DELETE(id));
        } catch (error) {
            console.log(error);
            throw error;
        }
    },
    assignUserToBooth: async (userId: string | null, boothId: string): Promise<{message: string}> => {
        try {
             const response = await api.put<{message: string}>(API_ENDPOINTS.BOOTH.ASSIGN_USER(boothId), { shiftId: userId });
             return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }



}