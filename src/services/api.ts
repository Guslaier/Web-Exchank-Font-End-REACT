// src/services/api.ts
import axios from 'axios';
import { storage } from '../utils/storage';
import { API_CONFIG, HTTP_STATUS } from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
});

// จัดการ Response และ Error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 🚩 เช็คว่าถ้าเป็น Preflight หรือโดน Cancel ไม่ต้องทำอะไร
    if (axios.isCancel(error)) return Promise.reject(error);

    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // เคลียร์เฉพาะข้อมูลฝั่ง client; HttpOnly cookie จะให้ backend จัดการ
      
      storage.clear();
      window.location.replace('/');
    }
    return Promise.reject(error);
  }
);

export default api;