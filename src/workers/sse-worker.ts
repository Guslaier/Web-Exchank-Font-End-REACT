// src/workers/sse-worker.ts

// เก็บพอร์ตของ Tab ต่างๆ ที่เชื่อมต่อเข้ามา
const ports: Set<MessagePort> = new Set();
let eventSource: EventSource | null = null;

// ฟังก์ชันเชื่อมต่อ SSE
const connectSSE = () => {
  if (eventSource) return;

  console.log('[Shared Worker] Connecting to SSE via Cookie...');

  // 🚩 เรียกผ่าน Relative Path หรือ URL ของ Nginx
  // Browser จะส่ง HttpOnly Cookie ไปให้เองอัตโนมัติ
  eventSource = new EventSource('/api/sse/refresh-signal', {
    withCredentials: true, 
  });

  eventSource.onmessage = (event) => {
    // เมื่อมีข้อมูลใหม่ ส่งไปบอกทุก Tab ที่เปิดอยู่
    const data = JSON.parse(event.data);
    ports.forEach((port) => {
      port.postMessage({ type: 'SSE_DATA', data });
    });
  };

  eventSource.onerror = (error) => {
    console.error('[Shared Worker] SSE Error:', error);
    eventSource?.close();
    eventSource = null;
    
    // ลองเชื่อมต่อใหม่หลังจาก 5 วินาทีถ้าหลุด
    setTimeout(connectSSE, 5000);
  };
};


const _self = self as any;
// เมื่อมี Tab ใหม่เชื่อมต่อเข้ามา
_self.onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  ports.add(port);

  port.onmessage = (event) => {
    if (event.data.type === 'INIT') {
      connectSSE();
    }
  };

  // เมื่อ Tab ปิดลง
  port.start();
};