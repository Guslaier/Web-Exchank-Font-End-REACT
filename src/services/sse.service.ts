import { useEffect } from 'react';

export const useSSE = (onMessage: () => void) => {
  useEffect(() => {
  const worker = new SharedWorker(
    new URL('../workers/sse-worker.ts', import.meta.url),
    { type: 'module' } // 🚩 ต้องมีบรรทัดนี้
  );

  worker.port.start();
  worker.port.postMessage({ type: 'INIT' });

  worker.port.onmessage = (event) => {
    if (event.data.type === 'SSE_DATA') {
      onMessage();
    }
  };
}, []);

};