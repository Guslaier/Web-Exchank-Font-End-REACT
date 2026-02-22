// src/types/auth.ts

import type { User, Shift,UserRole } from './entities'; // Import จาก Entity ที่เราทำไว้

/** * ประเภทสิทธิ์การใช้งาน (อิงตาม Table users.role ใน DB)
 */

/**
 * ข้อมูลที่ได้รับหลังจาก Login สำเร็จ 
 */
export interface AuthResponse {
  accessToken: string;
  user: User; // ข้อมูลพื้นฐานจาก Table users
  currentShift?: Shift; // หากเป็น Staff จะมีข้อมูลกะปัจจุบันที่กำลังทำงานอยู่
}

/**
 * โครงสร้างข้อมูลสำหรับหน้า Login
 */
export interface LoginCredentials {
  username: string; //
  password: string; //
}

/**
 * ข้อมูลที่เก็บไว้ใน Context หรือ Global State (เช่น UserInfo)
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
  shiftId: number | null; // สำหรับใช้ทำ Transactions
  loading: boolean;
}

/**
 * ข้อมูลความปลอดภัย (Token Payload)
 */
export interface TokenPayload {
  sub: number; // User ID
  username: string;
  role: UserRole;
  iat: number; // Issued at
  exp: number; // Expiration
}