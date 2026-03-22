# Web-Exchank Frontend (React)

## ภาพรวมโครงงาน (Frontend)

Frontend ของระบบ **Web-Exchank** ถูกพัฒนาขึ้นเพื่อเป็นส่วนติดต่อผู้ใช้งานสำหรับการบันทึกและติดตามธุรกรรมการแลกเปลี่ยนเงินตราต่างประเทศ ช่วยให้พนักงานและผู้จัดการสามารถทำงานได้สะดวกขึ้น ลดความล่าช้าในการปิดยอดรายวัน และสามารถตรวจสอบข้อมูลธุรกรรม/สถานะทางการเงินได้รวดเร็วผ่านหน้าแดชบอร์ด

ระบบฝั่ง Frontend เน้นการใช้งานง่าย (Usability) และการแสดงผลข้อมูลแบบทันที (Real-time experience) โดยเชื่อมต่อกับ Backend API เพื่อดึงข้อมูลธุรกรรม อัตราแลกเปลี่ยน รายงาน และการจัดการผู้ใช้งาน

### กลุ่มผู้ใช้งาน

- **Employee:** ทำธุรกรรมแลกเปลี่ยนเงินตรา, บันทึกข้อมูลลูกค้า, ตรวจสอบยอด/รายการเคลื่อนไหว, ปิดกะ
- **Manager:** ตรวจสอบ/จัดการธุรกรรม, จัดการผู้ใช้และบูท, ปรับอัตราแลกเปลี่ยน, ดูรายงานและส่งออกไฟล์

## เทคโนโลยีที่ใช้

- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **Routing:** react-router-dom
- **HTTP Client:** axios
- **UI Icons:** FontAwesome, react-icons

---

## การติดตั้งครั้งแรก 

### 1) ติดตั้ง Dependencies

```bash
npm install
```

### 2) ตั้งค่า Environment Variables

โปรเจกต์นี้ใช้ Vite environment variables ถูกกำหนดไว้ในไฟล์ `.env`

- `VITE_API_URL` = URL ของ Backend API 
  
### 3) รันโปรเจกต์โหมด Development

```bash
npm run dev
```

### 4) สร้างไฟล์สำหรับ Production

```bash
npm run build
```

### 5) Preview Production build

```bash
npm run preview
```

---

## เชื่อมต่อกับ Backend

- Backend API: ตั้งค่าที่ `VITE_API_URL`
- ต้องรัน backend และฐานข้อมูลให้พร้อมก่อน (ดูคู่มือใน repo backend)
