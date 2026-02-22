// src/services/auth.service.ts
import type { LoginCredentials, AuthResponse } from '../types/auth';
import { mockAdminAuth, mockStaffAuth } from '../data/mockData';
import { storage } from '../utils/storage';


// ฟังก์ชันจำลองสำหรับการ Login (ใช้ mock data)    

export const login: (credentials: LoginCredentials) => Promise<AuthResponse> = async (credentials) => {
    // ในการใช้งานจริง คุณจะส่งคำขอไปยัง API ที่นี่
    // แต่ตอนนี้เราจะใช้ mock data แทน
    let response: AuthResponse; 
    if (credentials.username === 'admin' && credentials.password === 'password') {
        response = mockAdminAuth;
    }
    else if (credentials.username === 'staff' && credentials.password === 'password') {
        response = mockStaffAuth;
    }
    else {
        throw new Error('Invalid credentials');
    }
    // เก็บข้อมูลที่จำเป็นลงใน Storage
    storage.set('authToken', response.accessToken); 
    storage.set('userRole', response.user.role); 
    storage.set('currentShiftId', response.currentShift?.id || null); 
    storage.set('userInfo', JSON.stringify(response.user)); 
    return response;
};

export const loginAsAdmin = async (): Promise<AuthResponse> => {
    const response: AuthResponse = mockAdminAuth;
    storage.set('authToken', response.accessToken); 
    storage.set('userRole', response.user.role); 
    storage.set('currentShiftId', response.currentShift?.id || null); 
    storage.set('userInfo', JSON.stringify(response.user)); 
    return response;
};

export const loginAsStaff = async (): Promise<AuthResponse> => {
    const response: AuthResponse = mockStaffAuth;
    storage.set('authToken', response.accessToken); 
    storage.set('userRole', response.user.role); 
    storage.set('currentShiftId', response.currentShift?.id || null); 
    storage.set('userInfo', JSON.stringify(response.user)); 
    return response;
};

