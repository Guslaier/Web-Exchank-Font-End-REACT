import { useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';

export const useSSE = (onRefresh: () => void) => {
  useEffect(() => {
    const controller = new AbortController();

    const connectSse = async () => {
      await fetchEventSource(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.SSE.REFRESH}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          'Accept': 'text/event-stream',
        },
        signal: controller.signal,
        onmessage(msg) {
          if (msg.data) {
            const data = JSON.parse(msg.data);
            if (data.signal === 'refresh') {
              onRefresh(); // เรียกฟังก์ชันดึงข้อมูลใหม่
            }
          }
        },
        onclose() {
          console.log('SSE connection closed');
        },
        onerror(err) {
          console.error('SSE Error:', err);
        }
      });
    };

    connectSse();

    return () => {
      controller.abort(); // ตัดการเชื่อมต่อเมื่อปิดหน้าจอ
    };
  }, [onRefresh]);
};