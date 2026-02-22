// src/utils/validation.ts

// เช็คว่าเป็นอีเมลที่ถูกต้องไหม
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// เช็คความยาวรหัสผ่าน (เช่น ต้อง 6 ตัวขึ้นไป)
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// เช็คว่าเป็นตัวเลขเท่านั้นไหม (ใช้กับช่องจำนวนเงิน)
export const isNumberOnly = (value: string): boolean => {
  return /^\d*\.?\d*$/.test(value);
};

