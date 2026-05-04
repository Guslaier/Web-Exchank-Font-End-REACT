import './App.css'
import Navbar from './components/layout/navbar/Navbar'
import { Outlet } from 'react-router-dom'
import { storage } from './utils/storage'
import type { UserRole } from './types/entities.ts';
import { useEffect, useState } from 'react';
import type { UserDatas } from './services/User.service.ts';
function App() {
  
  const [role] = useState<UserRole>(storage.get<UserRole>('userRole') || 'EMPLOYEE'); 
  const [userName] = useState<string>(storage.get<object>('userInfo') ? (storage.get<object>('userInfo') as UserDatas).username : ''); 
  // ดึง role และ userName จาก Storage หรือกำหนดค่าเริ่มต้น
  useEffect(() => {
    // 1. ดึงภาษาล่าสุดจาก localStorage (ถ้าไม่มีให้ใช้ 'th' เป็นค่าเริ่มต้น)
    const savedLang = localStorage.getItem("preferred_lang") || "th";
    
    // 2. ตั้งค่า Cookie ให้ Google Translate รู้ภาษานั้นทันที
    document.cookie = `googtrans=/auto/${savedLang}; path=/`;
    document.cookie = `googtrans=/auto/${savedLang}; domain=${document.domain}; path=/`;

    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const addScript = document.createElement("script");
      addScript.id = scriptId;
      addScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(addScript);
    }

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en", // ต้นทางเป็น en เพื่อให้แปลเป็นภาษาอื่นได้
          includedLanguages: "en,th",
          autoDisplay: true,
        },
        "google_translate_element"
      );
    };
  }, []);
  return (

    <div className="M-container">
      {/* 1. Sidebar ด้านซ้าย (Navbar ของคุณ) */}
        {/* ส่ง role และ userName จาก state ไปยัง Navbar */}
        <Navbar role={role} userName={userName} />
     

      {/* 2. ส่วนเนื้อหาด้านขวา */}
      <main className="content">
        <Outlet />
      </main>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
    </div>
  )
}

export default App