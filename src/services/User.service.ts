import api  from './api';
import type { User } from '../types/entities';
import { API_ENDPOINTS } from '../config/api.config';
import { mockUsers } from '../data/mockData';

const USE_MOCK = true; // เปลี่ยนเป็น false เมื่อต้องการใช้ API จริง



export const userService = {
    // Get all users
    getAllUsers: async (): Promise<User[]> => {
        if (USE_MOCK) return Promise.resolve(mockUsers);
        try {
            const response = await api.get<{ data: User[] }>(API_ENDPOINTS.USER.LIST);
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    },

    // Get user by ID
    getUserById: async (id: number): Promise<User> => {
        if (USE_MOCK) {
            const user = mockUsers.find(u => u.id == id);
            return user ? Promise.resolve(user) : Promise.reject('User not found');
        }
        try {
            const response = await api.get<{ data: User }>(API_ENDPOINTS.USER.DETAIL(id));
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            throw error;
        }
    },

    // Create user
    createUser: async (userData: Omit<User, 'id' | 'created_at'>): Promise<User> => {
        if (USE_MOCK) {
            const newUser: User = { ...userData, id: Math.floor(Math.random() * 1000), created_at: new Date().toISOString() };
            return Promise.resolve(newUser);
        }
        try {
            const response = await api.post<{ data: User }>(API_ENDPOINTS.USER.CREATE, userData);
            return response.data.data;
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    },

    // Update user
    updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
        if (USE_MOCK) {
            const user = mockUsers.find(u => u.id == id);
            return user ? Promise.resolve({ ...user, ...userData }) : Promise.reject('User not found');
        }
        try {
            const response = await api.put<{ data: User }>(API_ENDPOINTS.USER.DETAIL(id), userData);
            return response.data.data;
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    },

    // Delete user
    deleteUser: async (id: number): Promise<User> => {
        if (USE_MOCK) {
            const user = mockUsers.find(u => u.id === id);
            return user ? Promise.resolve(user) : Promise.reject('User not found');
        }
        try {
            const response = await api.delete<{ data: User }>(API_ENDPOINTS.USER.DETAIL(id));
            return response.data.data;
        } catch (error) {
            console.error('Failed to delete user:', error);
            throw error;
        }
    },
};