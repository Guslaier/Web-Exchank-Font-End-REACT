import { Languages } from "lucide-react";
import "./LanguageSelector.css";
import React, { useEffect } from "react";

const LanguageSelector = () => {
  const [preferredLang, setPreferredLang] = React.useState(
    localStorage.getItem("preferred_lang") || "en"
  );

  useEffect(() => {
    const savedLang = localStorage.getItem("preferred_lang");
    
    // 1. ถ้ายังไม่มีภาษาในเครื่อง ให้ตั้งเป็น en
    if (!savedLang) {
      localStorage.setItem("preferred_lang", "en");
    }

    // 🚩 จุดสำคัญ: อย่าสั่ง reload() ใน useEffect ทันทีที่โหลดเสร็จ 
    // ไม่อย่างนั้นมันจะรีโหลดหน้าเว็บซ้ำไปซ้ำมาไม่หยุด
    applyGoogleTranslate(savedLang || "en");
  }, []);

  const applyGoogleTranslate = (langCode: string) => {
    // ตั้งค่า Cookie ไว้ก่อนเพื่อให้ Google Script ที่โหลดมาเห็นค่าทันที
    document.cookie = `googtrans=/auto/${langCode}; path=/`;
    document.cookie = `googtrans=/auto/${langCode}; domain=${window.location.hostname}; path=/`;
  };

  const changeLanguage = (langCode: string) => {
    console.log("Changing language to:", langCode);
    
    const selectEl = document.querySelector(".goog-te-combo") as HTMLSelectElement;

    if (selectEl) {
      selectEl.value = langCode;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      
      localStorage.setItem("preferred_lang", langCode);
      setPreferredLang(langCode);
      
      // รอแป๊บหนึ่งให้ Google ทำงานก่อนค่อยรีโหลด หรือถ้าจะรีโหลดเลยต้องเช็คให้ดี
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      // 🚩 ถ้าหา .goog-te-combo ไม่เจอ (Script ยังโหลดไม่เสร็จ) 
      // ให้เซ็ตแค่ Cookie กับ LocalStorage แล้วรีโหลดหน้า
      applyGoogleTranslate(langCode);
      localStorage.setItem("preferred_lang", langCode);
      window.location.reload();
    }
  };

  return (
    <div className="trabsition-container">
      {/* ซ่อน Element ดั้งเดิมของ Google ไว้ไม่ให้เห็น */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      {/* ปุ่มสลับภาษา TH */}
      <button onClick={() => changeLanguage("th")} 
      className={`btn-t ${preferredLang === "th" ? "active" : ""}`}
        translate="no"
        disabled={preferredLang === "th"}
      >
        
        TH
      </button>

      <div className="">/</div>

      {/* ปุ่มสลับภาษา EN */}
      <button
        onClick={() => changeLanguage("en")}
        className={`btn-t ${preferredLang === "en" ? "active" : ""}`}
        translate="no"
        disabled={preferredLang === "en"}
      >
        EN
      </button>

    </div>
  );
};

export default LanguageSelector;
