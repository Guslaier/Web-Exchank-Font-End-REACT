import React, { useState, useEffect } from 'react';
import './TimeTag.css';

const TimeTag: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // ตั้งค่า Interval ให้ทำงานทุกๆ 60,000 มิลลิวินาที (1 นาที)
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // ล้างค่า Interval เมื่อคอมโพเนนต์ถูกถอดออก
    return () => clearInterval(timer);
  }, []);

  // ฟังก์ชันช่วยจัดรูปแบบวันที่และเวลาให้ตรงตามภาพตัวอย่าง
  const formatTime = (date: Date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    const dayName = days[date.getDay()];
    const dayDate = date.getDate();
    const monthName = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    // คืนค่ารูปแบบ "SAT 1 MAY 10 : 08"
    return `${dayName} ${dayDate} ${monthName} ${hours} : ${minutes}`;
  };

  return (
    <div className="time-tag-container">
      <span className="time-tag-text">
        {formatTime(currentTime)}
      </span>
    </div>
  );
};

export default TimeTag;