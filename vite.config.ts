import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    
    // 1. เปิดให้เข้าถึงผ่าน IP ในวงแลน (เช่น 192.168.x.x)
    host: true, 
    // 2. ตั้งค่า CORS เพื่ออนุญาตทุก Domain
    cors: true ,
  }
})
