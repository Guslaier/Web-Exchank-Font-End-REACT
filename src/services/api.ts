// src/services/api.ts
import axios from 'axios';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS, HTTP_STATUS } from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// ดึง Token จาก Storage มาใส่ใน Header ทุกครั้งที่ส่ง
api.interceptors.request.use(
  (config) => {
    const token = storage.get<string>(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// จัดการ Response และ Error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ถ้า Token หมดอายุ (401) และยังไม่เคย retry
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          // TODO: เรียก API refresh token ที่นี่
          // const { data } = await api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
          // storage.set(STORAGE_KEYS.TOKEN, data.token);
          // originalRequest.headers.Authorization = `Bearer ${data.token}`;
          // return api(originalRequest);
        }
      } catch (refreshError) {
        // ถ้า refresh token ไม่สำเร็จ ให้ลบ token และ redirect ไป login
        storage.remove(STORAGE_KEYS.TOKEN);
        storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        // TODO: redirect to login page
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;