// src/components/auth/LogoutAction.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../../utils/storage';

const LogoutAction = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 🚩 ล้างข้อมูลทั้งหมดใน Storage
    storage.clear();
    
    // 🚩 ส่งผู้ใช้กลับไปหน้า Login (หรือหน้าหลัก)
    navigate('/login', { replace: true });
  }, [navigate]);

  return null; // ไม่ต้องแสดงผลอะไร
};

export default LogoutAction;