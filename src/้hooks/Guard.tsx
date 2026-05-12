import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { storage } from '../utils/storage';
import { Path } from '../config/path.Config';
import type { UserRole } from '../types/entities';

interface GuardProps {
  allowedRoles?: UserRole[];
}

const MainGuard = ({ allowedRoles }: GuardProps) => {
  const location = useLocation();
  
  // 🔍 เปลี่ยนจากการเช็ค token เป็นการเช็ค userInfo หรือ userRole แทน
  // เพราะเราย้าย token ไปไว้ใน HttpOnly Cookie แล้ว
  const userInfo = storage.get<string>('userInfo'); 
  const userRole = storage.get<UserRole>('userRole');

  // ถ้าไม่มีข้อมูล User ใน storage แสดงว่ายังไม่ได้ Login หรือ Session หลุด
  if (!userInfo) {
    return <Navigate to={Path.LOGIN} state={{ from: location }} replace />;
  }

  // 🔍 Role Check
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to={Path.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default MainGuard;