import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import MainGuard from "./้hooks/Guard.tsx";
import { Path } from "./config/path.Config.ts";
import LogoutAction from "./components/common/auth/LogoutAction.tsx";
import Login from "./pages/Login/Login.tsx";
import UserManagement from "./pages/User/UserManagement.tsx";
import ResetPassword from "./pages/Reset_Password/Reset_Password.tsx";
import Profile from "./pages/Profile/Profile.tsx";
import BoothManagement from "./pages/Booth/BoothManagement.tsx";
import Currency from "./pages/Currency/Currency.tsx";

const router = createBrowserRouter([
  {
            path: Path.RESET_PASSWORD,
            element: <ResetPassword />,

  },{
    
    // 🚩 ชั้นนอกสุด: หน้าที่ต้อง Login เท่านั้น (ทั้ง Admin และ Staff)
    element: <MainGuard />, 
    children: [
      {
        path: "/",
        element: <App />, 
        children: [
          // หน้าที่ทั้ง Admin และ Staff เข้าได้
          {
            path: Path.LOGOUT,
            element: <LogoutAction />,
          },
          {
            path: Path.LOGOUT_CLOSESHIFT,
            element: <LogoutAction />,
          },
          {
            path: Path.PROFILE,
            element: <Profile />, 
          },
          
          
          // 🚩 ชั้นใน: หน้าที่ต้องเป็น ADMIN เท่านั้น (เช่น จัดการ User หรือดู Transaction พิเศษ)
          {
            element: <MainGuard allowedRoles={["ADMIN","MANAGER"]} />,
            children: [
              // { path: "manage-user", element: <ManageUser /> }, // ตัวอย่างหน้า Admin
                {
                  path: Path.MANAGE_TRANSACTION, // ใช้แค่ชื่อ path ไม่ต้องใส่ / ข้างหน้าใน children
                  element: <div>Manage Transaction (Admin Only)</div>,
                },
                {
                  path: Path.MANAGE_USER,
                  element: <UserManagement />, // ตัวอย่างหน้า User Management
                },
                {
                  path: Path.MANAGE_BOOTH,
                  element: <BoothManagement />, // ตัวอย่างหน้า Booth Management

                },
                {
                  path: Path.EDIT_RATE,
                  element: <Currency />, // ตัวอย่างหน้า Currency Management
                }

            ]
          },

          {
            // 🚩 ชั้นใน: หน้าที่ Staff เข้าได้ (เช่น ดู Dashboard หรือจัดการ Transaction ทั่วไป)
            element: <MainGuard allowedRoles={["EMPLOYEE"]} />, // ทั้ง STAFF และ ADMIN เข้าได้
            children: [
              {

              }
            ]
          }
        ],
      },
    ],
  },
  {
    // 🚩 หน้า Login อยู่นอก Guard เสมอ
    path: Path.LOGIN,
    element: <Login />,
  },
  {
    // 🚩 ถ้าพิมพ์ URL มั่วให้กลับไปหน้าแรก
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
