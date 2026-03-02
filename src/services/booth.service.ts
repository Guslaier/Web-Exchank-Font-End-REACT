import type { Booth } from '../types/entities.ts';
import { mockBooths } from '../data/mockData';
import api from './api.ts';
import { API_ENDPOINTS } from '../config/api.config.ts';

export const boothService = {
    getBooths: async (): Promise<Booth[]> => {
        try {
            const response = await api.get<{ data: Booth[] }>(API_ENDPOINTS.BOOTH.LIST);
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch booths:', error);
            throw error;
        }
    },
    updateBoothStatus: async (id: string, isOpen: boolean): Promise<Booth> => {
        try {
            const response = await api.put<{ data: Booth }>(API_ENDPOINTS.BOOTH.UPDATE_STATUS(id), { isOpen });
            return response.data.data;
        } catch (error) {
            console.error('Failed to update booth status:', error);
            throw error;
        }
    },
    createBooth: async (boothData: Omit<Booth, 'id'>): Promise<Booth> => {
        try {   
            const response = await api.post<{ data: Booth }>(API_ENDPOINTS.BOOTH.CREATE, boothData);
            return response.data.data;
        } catch (error) {
            console.error('Failed to create booth:', error);
            throw error;
        }
    },
    deleteBooth: async (id: string): Promise<void> => {
        try {
            await api.delete(API_ENDPOINTS.BOOTH.DELETE(id));
        } catch (error) {
            console.error('Failed to delete booth:', error);
            throw error;
        }
    },
    getBoothById: async (id: string): Promise<Booth> => {
        try {
            const response = await api.get<{ data: Booth }>(API_ENDPOINTS.BOOTH.DETAIL(id));    
            return response.data.data;
        }
        catch (error) {
            console.error('Failed to fetch booth:', error);
            throw error;
        }
    },
    updateBooth: async (id: string, boothData: Partial<Booth>): Promise<Booth> => {
        try {
            const response = await api.put<{ data: Booth }>(API_ENDPOINTS.BOOTH.DETAIL(id), boothData);
            return response.data.data;
        } catch (error) {
            console.error('Failed to update booth:', error);
            throw error;
        }
    },
    getBoothSMockup:() => {
    return mockBooths.map((booth) => ({
        id: booth.id,
        name: booth.name,
        location: booth.location,
        current_user_id: booth.current_user_id,
        is_active: booth.is_active,
        is_open: booth.is_open,
        crated_at: booth.crated_at,
    } as Booth));
}

};



