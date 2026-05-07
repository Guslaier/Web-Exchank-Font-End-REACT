import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './transection.css';
import Swal from 'sweetalert2';
import {
  ExchangeTransactionService,
  type ExchangeTransaction,
} from '../../services/exchange-transaction.service';

type TabKey = 'today' | 'history';

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

function formatDateTime(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: 'txn-chip-completed',
    PENDING: 'txn-chip-pending',
    VOIDED: 'txn-chip-voided',
    CANCELED: 'txn-chip-canceled',
  };
  return (
    <span className={`txn-chip ${map[status] ?? 'txn-chip-completed'}`}>
      {status}
    </span>
  );
}

export default function TransactionPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');

  // === Tab 1: Today ===
  const [allTxns, setAllTxns] = useState<ExchangeTransaction[]>([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todaySearch, setTodaySearch] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // === Tab 2: History ===
  const [shiftId, setShiftId] = useState('');
  const [historyTxns, setHistoryTxns] = useState<ExchangeTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearched, setHistorySearched] = useState(false);

  const loadTodayTxns = useCallback(async () => {
    setTodayLoading(true);
    try {
      const data = await ExchangeTransactionService.getMany(500, 0);
      setAllTxns(data);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'โหลดข้อมูลไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'ไม่สามารถดึงข้อมูล transaction ได้',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setTodayLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodayTxns();
  }, [loadTodayTxns]);

  const todayTxns = useMemo(() => {
    return allTxns.filter((tx) => {
      const date = tx.transaction?.createdAt ?? tx.updatedAt;
      if (!isToday(date)) return false;
      if (!todaySearch.trim()) return true;
      return tx.id.toLowerCase().includes(todaySearch.trim().toLowerCase());
    });
  }, [allTxns, todaySearch]);

  const pendingTxns = useMemo(
    () => todayTxns.filter((tx) => tx.status === 'PENDING'),
    [todayTxns],
  );

  const handleApprove = async (tx: ExchangeTransaction, approve: boolean) => {
    const action = approve ? 'อนุมัติยกเลิก (Void)' : 'ปฏิเสธการยกเลิก';
    const result = await Swal.fire({
      icon: 'question',
      title: action,
      html: `Transaction: <b>${tx.id}</b><br/>เหตุผล: ${tx.voidReason ?? '—'}`,
      showCancelButton: true,
      confirmButtonText: approve ? 'อนุมัติ' : 'ปฏิเสธ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: approve ? '#e53e3e' : '#3535cc',
      cancelButtonColor: '#a0aec0',
    });
    if (!result.isConfirmed) return;

    setApprovingId(tx.id);
    try {
      await ExchangeTransactionService.approvePending(tx.id, approve ? 'VOIDED' : 'CANCELED');
      Swal.fire({
        icon: 'success',
        title: approve ? 'อนุมัติเรียบร้อย' : 'ปฏิเสธเรียบร้อย',
        timer: 1800,
        timerProgressBar: true,
        confirmButtonColor: '#3535cc',
      });
      await loadTodayTxns();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'ดำเนินการไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleHistorySearch = async () => {
    const id = shiftId.trim();
    if (!id) {
      Swal.fire({ icon: 'warning', title: 'กรุณาระบุ Shift ID', confirmButtonColor: '#3535cc' });
      return;
    }
    setHistoryLoading(true);
    setHistorySearched(true);
    try {
      const data = await ExchangeTransactionService.getByShift(id);
      setHistoryTxns(data);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'ค้นหาไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'ไม่พบข้อมูล session นี้',
        confirmButtonColor: '#3535cc',
      });
      setHistoryTxns([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="txn-page">
      <div className="header">
        <div className="h-l">
          <h1 className="TP">Transactions</h1>
          <p className="STP">Manage and review exchange transactions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="txn-tabs">
        <button
          className={`txn-tab-btn${activeTab === 'today' ? ' active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          📋 Today's Transactions
          {pendingTxns.length > 0 && (
            <span className="txn-badge">{pendingTxns.length}</span>
          )}
        </button>
        <button
          className={`txn-tab-btn${activeTab === 'history' ? ' active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          🕐 Session History
        </button>
      </div>

      {/* ===== TAB 1: Today ===== */}
      {activeTab === 'today' && (
        <div className="txn-content">
          {/* Pending Approval */}
          {!todayLoading && pendingTxns.length > 0 && (
            <div className="txn-section">
              <div className="txn-section-header txn-header-warn">
                <span>⚠️</span>
                <h2 className="txn-section-title">
                  รายการขอยกเลิก รอการอนุมัติ ({pendingTxns.length})
                </h2>
              </div>
              <div className="txn-card-list">
                {pendingTxns.map((tx) => (
                  <div key={tx.id} className="txn-card txn-card-pending">
                    <div className="txn-card-top">
                      <div className="txn-card-title-row">
                        <span className="txn-id">{tx.id}</span>
                        <StatusChip status={tx.status} />
                      </div>
                      <span className={`txn-type-badge txn-type-${tx.type.toLowerCase()}`}>
                        {tx.type}
                      </span>
                    </div>
                    <div className="txn-card-body">
                      <div className="txn-info-row">
                        <span className="txn-info-label">สกุลเงิน</span>
                        <span>{tx.exchangeRateName}</span>
                      </div>
                      <div className="txn-info-row">
                        <span className="txn-info-label">จำนวน</span>
                        <span>{Number(tx.foreignCurrencyAmount).toLocaleString()}</span>
                      </div>
                      <div className="txn-info-row">
                        <span className="txn-info-label">ยอดบาท</span>
                        <span>{Number(tx.totalthaiBahtAmount).toLocaleString()} ฿</span>
                      </div>
                      <div className="txn-info-row">
                        <span className="txn-info-label">เหตุผล</span>
                        <span className="txn-void-reason">{tx.voidReason ?? '—'}</span>
                      </div>
                    </div>
                    <div className="txn-card-actions">
                      <button
                        className="txn-btn txn-btn-approve"
                        onClick={() => handleApprove(tx, true)}
                        disabled={approvingId === tx.id}
                      >
                        ✓ อนุมัติ (Void)
                      </button>
                      <button
                        className="txn-btn txn-btn-deny"
                        onClick={() => handleApprove(tx, false)}
                        disabled={approvingId === tx.id}
                      >
                        ✕ ปฏิเสธ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Today Table */}
          <div className="txn-section">
            <div className="txn-section-header">
              <h2 className="txn-section-title">รายการวันนี้ทั้งหมด</h2>
              <input
                type="text"
                className="txn-search-input"
                placeholder="ค้นหาตาม Transaction ID..."
                value={todaySearch}
                onChange={(e) => setTodaySearch(e.target.value)}
              />
            </div>

            {todayLoading ? (
              <div className="txn-skeleton-list">
                {[1, 2, 3].map((i) => <div key={i} className="txn-skeleton" />)}
              </div>
            ) : todayTxns.length === 0 ? (
              <div className="txn-empty">ไม่มีรายการในวันนี้</div>
            ) : (
              <div className="txn-table-wrapper">
                <table className="txn-table">
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
                    {todayTxns.map((tx) => (
                      <tr key={tx.id} className={tx.status === 'PENDING' ? 'txn-row-pending' : ''}>
                        <td className="txn-table-id">{tx.id}</td>
                        <td>
                          <span className={`txn-type-badge txn-type-${tx.type.toLowerCase()}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td>{tx.exchangeRateName}</td>
                        <td>{Number(tx.foreignCurrencyAmount).toLocaleString()}</td>
                        <td>{Number(tx.totalthaiBahtAmount).toLocaleString()} ฿</td>
                        <td><StatusChip status={tx.status} /></td>
                        <td className="txn-table-time">
                          {formatDateTime(tx.transaction?.createdAt ?? tx.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB 2: History ===== */}
      {activeTab === 'history' && (
        <div className="txn-content">
          <div className="txn-section">
            <div className="txn-section-header">
              <h2 className="txn-section-title">ค้นหาประวัติตาม Session (Shift ID)</h2>
            </div>
            <div className="txn-history-search">
              <input
                type="text"
                className="txn-search-input txn-search-lg"
                placeholder="กรอก Shift ID..."
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleHistorySearch()}
              />
              <button
                className="txn-btn txn-btn-search"
                onClick={handleHistorySearch}
                disabled={historyLoading}
              >
                {historyLoading ? 'กำลังค้นหา...' : '🔍 ค้นหา'}
              </button>
            </div>

            {historyLoading ? (
              <div className="txn-skeleton-list">
                {[1, 2, 3, 4].map((i) => <div key={i} className="txn-skeleton" />)}
              </div>
            ) : historySearched && historyTxns.length === 0 ? (
              <div className="txn-empty">ไม่พบรายการใน Session นี้</div>
            ) : historyTxns.length > 0 ? (
              <>
                <div className="txn-history-summary">
                  พบ <strong>{historyTxns.length}</strong> รายการ &nbsp;·&nbsp;
                  BUY: <strong>{historyTxns.filter(t => t.type === 'BUY').length}</strong> &nbsp;·&nbsp;
                  SELL: <strong>{historyTxns.filter(t => t.type === 'SELL').length}</strong>
                </div>
                <div className="txn-table-wrapper">
                  <table className="txn-table">
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
                      {historyTxns.map((tx) => (
                        <tr key={tx.id}>
                          <td className="txn-table-id">{tx.id}</td>
                          <td>
                            <span className={`txn-type-badge txn-type-${tx.type.toLowerCase()}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td>{tx.exchangeRateName}</td>
                          <td>{Number(tx.foreignCurrencyAmount).toLocaleString()}</td>
                          <td>{Number(tx.totalthaiBahtAmount).toLocaleString()} ฿</td>
                          <td><StatusChip status={tx.status} /></td>
                          <td className="txn-table-time">
                            {formatDateTime(tx.transaction?.createdAt ?? tx.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
