import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import Swal from 'sweetalert2';
import { ShiftAdminService, type ShiftRecord } from '../services/shift-admin.service';
import {
  ExchangeTransactionService,
  type ExchangeTransaction,
} from '../services/exchange-transaction.service';

function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function fmtDT(ds?: string) {
  if (!ds) return '—';
  return new Date(ds).toLocaleString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Dashboard() {
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [txns, setTxns]   = useState<ExchangeTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        ShiftAdminService.getActives(),
        ExchangeTransactionService.getMany(300, 0),
      ]);
      setShifts(s);
      setTxns(t);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'โหลดข้อมูลไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const todayTxns  = txns.filter(t => isToday(t.transaction?.createdAt ?? t.updatedAt));
  const pendingCnt = todayTxns.filter(t => t.status === 'PENDING').length;
  const todayTHB   = todayTxns
    .filter(t => t.status === 'COMPLETED')
    .reduce((s, t) => s + Number(t.totalthaiBahtAmount), 0);

  return (
    <div className="dash-page">
      <div className="header">
        <div className="h-l">
          <h1 className="TP">Dashboard</h1>
          <p className="STP">ภาพรวมระบบแลกเปลี่ยนเงินตรา</p>
        </div>
        <button className="dash-refresh-btn" onClick={load} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="dash-stats-row">
        <div className="dash-stat-card accent-blue">
          <span className="dash-stat-icon">🏪</span>
          <div className="dash-stat-info">
            <span className="dash-stat-label">Active Shifts</span>
            <span className="dash-stat-value">{loading ? '—' : shifts.length}</span>
          </div>
        </div>
        <div className="dash-stat-card accent-green">
          <span className="dash-stat-icon">📊</span>
          <div className="dash-stat-info">
            <span className="dash-stat-label">Today's Transactions</span>
            <span className="dash-stat-value">{loading ? '—' : todayTxns.length}</span>
          </div>
        </div>
        <div className="dash-stat-card accent-orange">
          <span className="dash-stat-icon">⚠️</span>
          <div className="dash-stat-info">
            <span className="dash-stat-label">Pending Approvals</span>
            <span className="dash-stat-value">{loading ? '—' : pendingCnt}</span>
          </div>
        </div>
        <div className="dash-stat-card accent-purple">
          <span className="dash-stat-icon">💰</span>
          <div className="dash-stat-info">
            <span className="dash-stat-label">Today's Volume (THB)</span>
            <span className="dash-stat-value">
              {loading ? '—' : todayTHB.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Active Shifts */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">🏪 Active Shifts ({shifts.length})</h2>
        </div>
        {loading ? (
          <div className="dash-skeleton-wrap">
            {[1, 2, 3].map(i => <div key={i} className="dash-skeleton-row" />)}
          </div>
        ) : shifts.length === 0 ? (
          <div className="dash-empty">ไม่มี Shift ที่เปิดอยู่ขณะนี้</div>
        ) : (
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Shift ID</th>
                  <th>พนักงาน</th>
                  <th>บูธ</th>
                  <th>เปิดเมื่อ</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map(s => (
                  <tr key={s.id}>
                    <td className="dash-table-id">{s.id}</td>
                    <td>{s.user?.username ?? s.userId}</td>
                    <td>{s.booth?.name ?? s.boothId}</td>
                    <td>{fmtDT(s.startTime)}</td>
                    <td><span className="dash-chip dash-chip-active">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">
            📋 รายการวันนี้ล่าสุด ({todayTxns.length})
          </h2>
        </div>
        {loading ? (
          <div className="dash-skeleton-wrap">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="dash-skeleton-row" />)}
          </div>
        ) : todayTxns.length === 0 ? (
          <div className="dash-empty">ยังไม่มีรายการในวันนี้</div>
        ) : (
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>ประเภท</th>
                  <th>สกุลเงิน</th>
                  <th>จำนวน</th>
                  <th>ยอดบาท</th>
                  <th>สถานะ</th>
                  <th>เวลา</th>
                </tr>
              </thead>
              <tbody>
                {todayTxns.slice(0, 30).map(tx => (
                  <tr key={tx.id}>
                    <td className="dash-table-id">{tx.id}</td>
                    <td>
                      <span className={tx.type === 'BUY' ? 'dash-type-buy' : 'dash-type-sell'}>
                        {tx.type}
                      </span>
                    </td>
                    <td>{tx.exchangeRateName}</td>
                    <td>{Number(tx.foreignCurrencyAmount).toLocaleString()}</td>
                    <td>{Number(tx.totalthaiBahtAmount).toLocaleString()} ฿</td>
                    <td>
                      <span className={'dash-chip dash-chip-' + tx.status.toLowerCase()}>
                        {tx.status}
                      </span>
                    </td>
                    <td>{fmtDT(tx.transaction?.createdAt ?? tx.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
