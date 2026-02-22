// src/utils/auth.ts
import type { UserRole } from '../types/auth.ts';

// ดึง Role จากที่เก็บไว้มาเช็คสิทธิ์แบบเร็วๆ
export const checkAccess = (userRole: UserRole, allowedRoles: UserRole[]): boolean => {
  return allowedRoles.includes(userRole);
};