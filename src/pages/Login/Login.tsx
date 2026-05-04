import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/auth.service";
import "./Login.css";
import Button from "../../components/common/Buttom/Buttom";
import { Path } from "../../config/path.Config";
import InputPass from "../../components/common/input_pass/input_pass";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }); // 🚩 เรียกฟังก์ชันจัดการข้อมูล
      res;
      navigate("/"); // 🚩 สั่งเปลี่ยนหน้าเมื่อสำเร็จ
      window.location.reload(); // เพื่อให้ App.tsx โหลดสถานะใหม่จาก storage
    } catch (error) {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleLoginAdmin = async () => {
    try {
      await login({ email: "admin@m.exchang.com", password: "admin123" }); // 🚩 จัดการ storage ใน service
      navigate("/"); // 🚩 เปลี่ยนหน้า
      window.location.reload(); // โหลด role ใหม่เข้า App.tsx
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  return (
    <div className="login-container">
      <div className="login-logo" translate="no">
        <h1>
          <span className="m-yellow">M</span>
          <br />
          Exchange
        </h1>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputPass
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="forgot-password-wrapper">
          <Link className="forgot-link" to={Path.RESET_PASSWORD}>
            Forgot Password?
          </Link>
        </div>
        {error && <p style={{ color: "#ff8a8a", fontSize: "14px" }}>{error}</p>}

        <Button label="Login" variant="submit" type="submit" />
        {/* ปุ่มสำหรับ Login แบบ Admin และ Staff โดยตรง (สำหรับการทดสอบ) */}
      </form>
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <Button label="Admin" variant="submit" onClick={handleLoginAdmin} />
      </div>
    </div>
  );
};

export default Login;
