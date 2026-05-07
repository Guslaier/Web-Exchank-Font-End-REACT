import React, { useState, useEffect, useCallback } from 'react';
import './RecordTrading.css';
import Swal from 'sweetalert2';
import {
  ExchangeTransactionService,
  type ExchangeTransaction,
} from '../services/exchange-transaction.service';
import { STORAGE_KEYS } from '../config/api.config';

function fmtDT(ds?: string) {
  if (!ds) return '—';
  return new Date(ds).toLocaleString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function RecordTrading() {
  const shiftId = localStorage.getItem(STORAGE_KEYS.SHIFT_ID);

  const [txns, setTxns]       = useState<ExchangeTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [voidingId, setVoidingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!shiftId) return;
    setLoading(true);
    try {
      const data = await ExchangeTransactionService.getByShift(shiftId);
      setTxns(data);
    } catch (err: any) {
      Swal.fire({
        icon: 'error', title: 'โหลดข้อมูลไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  useEffect(() => { load(); }, [load]);

  const handleVoidRequest = async (tx: ExchangeTransaction) => {
    const { value: reason } = await Swal.fire({
      title: 'ขอยกเลิกรายการ',
      input: 'textarea',
      inputLabel: 'เหตุผลในการขอยกเลิก',
      inputPlaceholder: 'ระบุเหตุผล...',
      inputAttributes: { rows: '3' },
      showCancelButton: true,
      confirmButtonText: 'ส่งคำขอ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#a0aec0',
      inputValidator: (v) => v?.trim() ? undefined : 'กรุณาระบุเหตุผล',
    });
    if (!reason) return;

    setVoidingId(tx.id);
    try {
      await ExchangeTransactionService.requestVoid(tx.id, reason.trim());
      Swal.fire({
        icon: 'success', title: 'ส่งคำขอยกเลิกเรียบร้อย',
        text: 'รอ Admin / Manager อนุมัติ',
        timer: 2000, timerProgressBar: true,
        confirmButtonColor: '#3535cc',
      });
      await load();
    } catch (err: any) {
      Swal.fire({
        icon: 'error', title: 'ส่งคำขอไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setVoidingId(null);
    }
  };

  const buyCount  = txns.filter(t => t.type === 'BUY').length;
  const sellCount = txns.filter(t => t.type === 'SELL').length;
  const totalTHB  = txns
    .filter(t => t.status === 'COMPLETED')
    .reduce((s, t) => s + Number(t.totalthaiBahtAmount), 0);

  if (!shiftId) {
    return (
      <div className="rec-page">
        <div className="header">
          <div className="h-l">
            <h1 className="TP">Record Trading</h1>
            <p className="STP">รายการแลกเปลี่ยนของ Shift นี้</p>
          </div>
        </div>
        <div className="rec-no-shift">⚠️ ยังไม่ได้เปิด Shift กรุณาเปิด Shift ก่อนเริ่มงาน</div>
      </div>
    );
  }

  return (
    <div className="rec-page">
      <div className="header">
        <div className="h-l">
          <h1 className="TP">Record Trading</h1>
          <p className="STP">รายการแลกเปลี่ยนของ Shift นี้</p>
        </div>
      </div>

      {/* Shift Banner */}
      <div className="rec-shift-banner">
        <span className="rec-shift-label">Shift ปัจจุบัน:</span>
        <span className="rec-shift-id">{shiftId}</span>
        <button className="rec-reload-btn" onClick={load} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      <div className="rec-section">
        <div className="rec-section-header">
          <span className="rec-section-title">รายการทั้งหมดใน Shift ({txns.length})</span>
        </div>

        {txns.length > 0 && (
          <div className="rec-summary">
            <span>BUY: <strong>{buyCount}</strong></span>
            <span>SELL: <strong>{sellCount}</strong></span>
            <span>ยอดรวม (COMPLETED): <strong>{totalTHB.toLocaleString()} ฿</strong></span>
          </div>
        )}

        {loading ? (
          <div className="rec-skeleton-wrap">
            {[1, 2, 3, 4].map(i => <div key={i} className="rec-skeleton-row" />)}
          </div>
        ) : txns.length === 0 ? (
          <div className="rec-empty">ยังไม่มีรายการใน Shift นี้</div>
        ) : (
          <div className="rec-table-wrapper">
            <table className="rec-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>ประเภท</th>
                  <th>สกุลเงิน</th>
                  <th>จำนวน</th>
                  <th>ยอดบาท</th>
                  <th>สถานะ</th>
                  <th>เวลา</th>
                  <th>ขอยกเลิก</th>
                </tr>
              </thead>
              <tbody>
                {txns.map(tx => (
                  <tr key={tx.id}>
                    <td className="rec-table-id">{tx.id}</td>
                    <td>
                      <span className={tx.type === 'BUY' ? 'rec-type-buy' : 'rec-type-sell'}>
                        {tx.type}
                      </span>
                    </td>
                    <td>{tx.exchangeRateName}</td>
                    <td>{Number(tx.foreignCurrencyAmount).toLocaleString()}</td>
                    <td>{Number(tx.totalthaiBahtAmount).toLocaleString()} ฿</td>
                    <td>
                      <span className={'rec-chip rec-chip-' + tx.status.toLowerCase()}>
                        {tx.status}
                      </span>
                    </td>
                    <td>{fmtDT(tx.transaction?.createdAt ?? tx.updatedAt)}</td>
                    <td>
                      {tx.status === 'COMPLETED' && (
                        <button
                          className="rec-void-btn"
                          onClick={() => handleVoidRequest(tx)}
                          disabled={voidingId === tx.id}
                        >
                          ✕ ขอยกเลิก
                        </button>
                      )}
                    </td>
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
