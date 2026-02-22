// src/utils/storage.ts

export const storage = {
  /**
   * บันทึกข้อมูลลง LocalStorage (แปลง Object เป็น JSON อัตโนมัติ)
   */
  set: <T>(key: string, value: T): void => {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage', error);
    }
  },

  /**
   * ดึงข้อมูลจาก LocalStorage และแปลงกลับเป็น Type ที่ต้องการ
   */
  get: <T>(key: string): T | null => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;

      // ถ้าข้อมูลดูเหมือน JSON ให้ Parse กลับ
      if (value.startsWith('{') || value.startsWith('[')) {
        return JSON.parse(value) as T;
      }
      return value as unknown as T;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  },

  /**
   * ลบข้อมูลรายตัว (เช่น ตอน Logout)
   */
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  /**
   * ล้างข้อมูลทั้งหมด
   */
  clear: (): void => {
    localStorage.clear();
  }
};