import api  from './api';
import type { UserData as UDTO, UserRole } from '../types/entities';
import { API_ENDPOINTS } from '../config/api.config';

export class UserDatas implements Omit<UDTO, 'passwordHash'> {
    id: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: Omit<UDTO, 'passwordHash'>) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.phoneNumber = data.phoneNumber;
        this.role = data.role;
        this.isActive = data.isActive;
        this.createdAt = new Date(data.createdAt);
        this.updatedAt = new Date(data.updatedAt);
    }
    
};

export type UserDatasCreated ={
    generatedPassword: string,
    user: UserDatas
}

export const userService = {
    // Get all users
    getAllUsers: async (): Promise<UserDatas[]> => {
        try {
            const response = await api.get<UserDatas[]>(API_ENDPOINTS.USER.FIND_ALL);
            console.log("Fetched users:", response); // ตรวจสอบข้อมูลที่ได้รับจาก API
            if (response.data && Array.isArray(response.data)) {
                return response.data as UserDatas[];
            } else {
                alert('Invalid response format: expected an array of users');
                throw new Error('Invalid response format: expected an array of users');
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            throw error;
        }
    },

    resetPassword: async (id: string): Promise<string> => {
        try {
            const response = await api.post<{message: string, token: string }>(API_ENDPOINTS.USER.REQUEST_RESET_PASSWORD, { id });
            console.log("Reset password response:", response);
            if (response.data && response.data.token) {
                return response.data.token;
            }
            else {
                throw new Error('Failed to reset password: No token in response');
            }
        } catch (error) {
            console.error('Failed to reset password:', error);
            throw error;
        }
    },
    // Get user by ID
    getUserById: async (id: string): Promise<UserDatas   > => {
        try {
            const response = await api.get<UserDatas>(API_ENDPOINTS.USER.FIND_ONE(id));
        
            if (response.data) {
                return new UserDatas(response.data) as UserDatas;
            } else {
                throw new Error('User not found');
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            throw error;
        }
    },

    // Create user
    createUser: async (userData: Omit<UserDatas, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserDatasCreated> => {
        try {
            const response = await api.post<UserDatasCreated>(API_ENDPOINTS.USER.REGISTER, userData);
            console.log("Created user:", response); // ตรวจสอบข้อมูลที่ได้รับจาก API
            if (response.data) {
                return response.data;
            } else {
                throw new Error('Failed to create user');
            }   
        } catch (error) {
            console.error('Failed to create user:', error);
            throw error;
        }
    },

    // Update user
    updateUser: async (id: string, userData: Partial<UDTO>): Promise<UserDatas> => {
        try {
            const response = await api.put<UserDatas>(API_ENDPOINTS.USER.UPDATE(id), userData);
            if (response.data) {
                return new UserDatas(response.data) as UserDatas;
            } else {
                throw new Error('Failed to update user');
            }
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    },

    // Delete user
    deleteUser: async (id: string): Promise<UserDatas> => {

        try {
            const response = await api.delete<UserDatas>(API_ENDPOINTS.USER.DELETE(id));
            if (response.data) {
                return new UserDatas(response.data) as UserDatas;
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            throw error;
        }
    },

    // Activate user
    activateUser: async (id: string): Promise<UserDatas> => {
        try {            const response = await api.put<UserDatas>(API_ENDPOINTS.USER.SET_REACTIVATE(id));
            if (response.data) {
                return new UserDatas(response.data) as UserDatas;
            }
                else {
                console.error('Failed to activate user: No data in response', response);
                throw new Error('Failed to activate user');
            }
        } catch (error) {
            console.error('Failed to activate user:', error);
            throw error;
        }
    },

    // Deactivate user
    deactivateUser: async (id: string): Promise<UserDatas> => {
        try {
            const response = await api.put<UserDatas>(API_ENDPOINTS.USER.SET_DEACTIVATE(id));
            if (response.data) {
                return new UserDatas(response.data) as UserDatas;
            } else {
                throw new Error('Failed to deactivate user');
            }
        } catch (error) {
            console.error('Failed to deactivate user:', error);
            throw error;
        }
    },
};