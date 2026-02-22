import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import ManageTransaction from "./pages/ManageTransaction/ManageTransaction.tsx";
import MainGuard from "./้hooks/Guard.tsx";
import { Path } from "./config/path.Config.ts";
import LogoutAction from "./components/common/auth/LogoutAction.tsx";
import Login from "./pages/Login/Login.tsx";

const router = createBrowserRouter([
  {
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
          
          // 🚩 ชั้นใน: หน้าที่ต้องเป็น ADMIN เท่านั้น (เช่น จัดการ User หรือดู Transaction พิเศษ)
          {
            element: <MainGuard allowedRoles={["MANAGER"]} />,
            children: [
              // { path: "manage-user", element: <ManageUser /> }, // ตัวอย่างหน้า Admin
                {
                  path: Path.MANAGE_TRANSACTION, // ใช้แค่ชื่อ path ไม่ต้องใส่ / ข้างหน้าใน children
                  element: <ManageTransaction />,
                },
            ]
          },

          {
            // 🚩 ชั้นใน: หน้าที่ Staff เข้าได้ (เช่น ดู Dashboard หรือจัดการ Transaction ทั่วไป)
            element: <MainGuard allowedRoles={["STAFF"]} />, // ทั้ง STAFF และ ADMIN เข้าได้
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
    path: Path.LOGON,
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
