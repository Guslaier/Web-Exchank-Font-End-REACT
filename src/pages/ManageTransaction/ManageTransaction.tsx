// src/pages/ManageBooth/ManageBooth.tsx
import React, { useState, useEffect } from 'react';
import BoothGrid from '../../components/layout/BoothGrid/BoothGrid';
import TransactionTable from '../../components/layout/TransactionTable/TransactionTable';
import Button from '../../components/common/Buttom/Buttom';
import './ManageTransaction.css';
import Search from '../../components/common/Search/Search';
import { transactionVoidService } from '../../services/transaction_void.service.ts';
import type { TransactionVoid } from '../../types/transaction.ts';
import type { Booth } from '../../types/booth.ts';
import { boothService } from '../../services/booth.service.ts';

const ManageTransaction: React.FC = () => {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [transactions, setTransactions] = useState<TransactionVoid[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ฟังก์ชันสำหรับดึงข้อมูลใหม่
  const fetchData = async () => {
    try {
      // เรียกใช้ Service ที่เชื่อมกับ Database
      const [boothData, tranData] = await Promise.all([
        boothService.getBoothSMockup(),
        transactionVoidService.getTranseMock()
      ]);
      
      setBooths(boothData);
      setTransactions(tranData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. ดึงข้อมูลครั้งแรกเมื่อหน้าจอโหลด
    fetchData();

    // 2. ตั้งเวลาให้อัปเดตอัตโนมัติทุกๆ 30 วินาที (Optional)
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30000ms = 30 วินาที

    // ล้าง interval เมื่อปิดหน้าจอนี้เพื่อประหยัด RAM
    return () => clearInterval(interval);
  }, []);

  if (loading && booths.length === 0) {
    return <div className="loading">Loading system data...</div>;
  }

  return (
    <div className="conten">
      <h2 className="title">Select Booth For View detail</h2>
      
      <Search onSearch={(query) => console.log("Search:", query)} placeholder="Search booths..." />
      
      <div className="filter-Group">
        <Button label="OPEN" variant="open" />
        <Button label="CLOSE" variant="close" />
        {/* เพิ่มปุ่ม Refresh มือถือ */}
        <Button label="Refresh" variant="view" onClick={fetchData} />
      </div>

      <BoothGrid booths={booths} />

      <div className="Request-Void">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Request Void Transaction</h3>
        </div>
        <TransactionTable data={transactions} />
      </div>
    </div>
  );
};

export default ManageTransaction;