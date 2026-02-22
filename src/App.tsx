import './App.css'
import Navbar from './components/layout/navbar/Navbar'
import { Outlet } from 'react-router-dom'
import { storage } from './utils/storage'
import type { UserRole } from './types/entities.ts';
import { useState } from 'react';
function App() {
  
  const [role] = useState<UserRole>(storage.get<UserRole>('userRole') || 'STAFF'); // ดึง role จาก Storage หรือกำหนดเป็น 'STAFF' เป็นค่าเริ่มต้น
  return (
    <div className="container">
      {/* 1. Sidebar ด้านซ้าย (Navbar ของคุณ) */}
      <aside>
        {/* ส่ง role จาก state ไปยัง Navbar */}
        <Navbar role={role} />
      </aside>

      {/* 2. ส่วนเนื้อหาด้านขวา */}
      <main className="content">
        <Outlet /> 
      </main>
    </div>
  )
}

export default App