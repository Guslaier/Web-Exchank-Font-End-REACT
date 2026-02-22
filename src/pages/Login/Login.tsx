import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';
import './Login.css';
import Button from '../../components/common/Buttom/Buttom';
import { loginAsAdmin,loginAsStaff } from '../../services/auth.service';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ username, password });// 🚩 เรียกฟังก์ชันจัดการข้อมูล
      res
        navigate('/'); // 🚩 สั่งเปลี่ยนหน้าเมื่อสำเร็จ
        window.location.reload(); // เพื่อให้ App.tsx โหลดสถานะใหม่จาก storage
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error("Login failed", error);
    }
};
const handleLoginStaff = async () => {
    try {
        await loginAsStaff(); // 🚩 เรียกฟังก์ชันจัดการข้อมูล
        navigate('/'); // 🚩 สั่งเปลี่ยนหน้าเมื่อสำเร็จ
        window.location.reload(); // เพื่อให้ App.tsx โหลดสถานะใหม่จาก storage
    } catch (error) {
        console.error("Login failed", error);
    }
};


const handleLoginAdmin = async () => {
    try {
        await loginAsAdmin(); // 🚩 จัดการ storage ใน service
        navigate('/');       // 🚩 เปลี่ยนหน้า
        window.location.reload(); // โหลด role ใหม่เข้า App.tsx
    } catch (error) {
        console.error("Login failed", error);
    }
};
  return (
    <div className="login-container">
      <div className="login-logo">
        <h1><span className="m-yellow">M</span><br/>Exchange</h1>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="username" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        
        {error && <p style={{ color: '#ff8a8a', fontSize: '14px' }}>{error}</p>}
        
        <Button label="Login" variant="submit" type="submit" disabled/>
         {/* ปุ่มสำหรับ Login แบบ Admin และ Staff โดยตรง (สำหรับการทดสอบ) */}
      </form>
      <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
        <Button label="Admin" variant="submit" onClick={handleLoginAdmin} />
        <Button label="Staff" variant="submit" onClick={handleLoginStaff} />
      </div>
    </div>
  );
};

export default Login;