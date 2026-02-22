/**
 * รวมฟังก์ชันจัดการ Format ข้อมูลที่จำเป็นสำหรับ React Project
 */

// 1. Format สกุลเงิน (Currency) - สำคัญมากสำหรับโปรเจกต์ Mexchang ของคุณ
export const formatCurrency = (value: number, currency = 'THB'): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};

// 2. Format วันที่แบบไทย (Date Format)
export const formatThaiDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 3. Format เบอร์โทรศัพท์ (Phone Number)
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};

// 4. ตัดข้อความให้สั้นลง (Truncate Text) - ใช้กับหัวข้อหรือรายละเอียดในตาราง
export const truncateText = (text: string, limit: number): string => {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
};

// 5. แปลง Role เป็นภาษาไทย (Role Mapper)
export const formatRoleName = (role: string): string => {
  const roles: Record<string, string> = {
    MANAGER: 'ผู้จัดการ',
    EMPLOYEE: 'พนักงาน',
  };
  return roles[role] || role;
};


/**
 * 7. ฟังก์ชันแปลงสถานะการแลกเปลี่ยน (Exchange Status Formatter)
 * ตัวอย่าง: 'PENDING' -> 'รอดำเนินการ'
 *  
 * สามารถใช้ในตารางเพื่อแสดงสถานะการแลกเปลี่ยนได้อย่างชัดเจน
 *  ตัวอย่างการใช้งาน: formatExchangeStatus('PENDING') -> 'รอดำเนินการ'
 *  */  
export const formatExchangeStatus = (status: string): string => {
    const statuses: Record<string, string> = {
            PENDING: 'รอดำเนินการ',
            APPROVED: 'อนุมัติแล้ว',
            REJECTED: 'ถูกปฏิเสธ',
            COMPLETED: 'เสร็จสมบูรณ์',
    };
    return statuses[status] || status;
}   

/**
 * 6. ฟังก์ชันใส่คอมม่า (Comma) สำหรับตัวเลขทั่วไป
 * ตัวอย่าง: 10000 -> 10,000
 */
export const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * 7. ฟังก์ชันสำหรับใส่คอมม่าพร้อมทศนิยมคงที่ (เช่น 2 ตำแหน่ง)
 * ตัวอย่าง: 10000 -> 10,000.00
 */
export const formatDecimal = (value: number | string, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '0.' + '0'.repeat(decimals);

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

