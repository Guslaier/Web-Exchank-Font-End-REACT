import React, { useState, useCallback } from 'react';
import './Report.css';
import Swal from 'sweetalert2';
import { SystemLogService, type SystemLog } from '../services/system-log.service';
import { ShiftAdminService, type ShiftRecord } from '../services/shift-admin.service';

type TabKey = 'logs' | 'shifts';

function fmtDT(ds?: string) {
  if (!ds) return '—';
  return new Date(ds).toLocaleString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default function Report() {
  const [activeTab, setActiveTab] = useState<TabKey>('logs');

  // ===== Tab 1: System Logs =====
  const [logDate, setLogDate]   = useState(todayStr());
  const [logs, setLogs]         = useState<SystemLog[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [logSearched, setLogSearched] = useState(false);

  const loadLogs = useCallback(async () => {
    setLogLoading(true);
    setLogSearched(true);
    try {
      const data = await SystemLogService.getAll(logDate);
      setLogs(data);
    } catch (err: any) {
      Swal.fire({
        icon: 'error', title: 'โหลด Log ไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setLogLoading(false);
    }
  }, [logDate]);

  // ===== Tab 2: Shifts =====
  const [shiftDate, setShiftDate]     = useState(todayStr());
  const [shifts, setShifts]           = useState<ShiftRecord[]>([]);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [shiftSearched, setShiftSearched] = useState(false);
  const [auditingId, setAuditingId]   = useState<string | null>(null);

  const loadShifts = useCallback(async () => {
    setShiftLoading(true);
    setShiftSearched(true);
    try {
      const data = await ShiftAdminService.getAll(shiftDate);
      setShifts(data);
    } catch (err: any) {
      Swal.fire({
        icon: 'error', title: 'โหลด Shift ไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setShiftLoading(false);
    }
  }, [shiftDate]);

  const handleAudit = async (shift: ShiftRecord) => {
    const { value: balanceCheck } = await Swal.fire({
      title: 'Audit Shift',
      html: `<p style="font-size:.9rem;color:#4a5568;margin-bottom:.75rem">Shift ID: <b>${shift.id}</b></p>
             <input id="swal-balance" type="number" class="swal2-input" placeholder="Balance Check (THB)" />
             <input id="swal-cash" type="number" class="swal2-input" placeholder="Cash Advance (THB)" />
             <input id="swal-note" type="text" class="swal2-input" placeholder="Note (optional)" />`,
      showCancelButton: true,
      confirmButtonText: 'บันทึก Audit',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#3535cc',
      preConfirm: () => ({
        balance_check: parseFloat((document.getElementById('swal-balance') as HTMLInputElement).value) || undefined,
        cash_advance:  parseFloat((document.getElementById('swal-cash')    as HTMLInputElement).value) || undefined,
        note:          (document.getElementById('swal-note') as HTMLInputElement).value || undefined,
      }),
    });
    if (!balanceCheck) return;

    setAuditingId(shift.id);
    try {
      await ShiftAdminService.audit(shift.id, balanceCheck as any);
      Swal.fire({ icon: 'success', title: 'Audit บันทึกสำเร็จ', timer: 1800, timerProgressBar: true, confirmButtonColor: '#3535cc' });
      await loadShifts();
    } catch (err: any) {
      Swal.fire({
        icon: 'error', title: 'Audit ไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setAuditingId(null);
    }
  };

  return (
    <div className="rpt-page">
      <div className="header">
        <div className="h-l">
          <h1 className="TP">Report &amp; Audit</h1>
          <p className="STP">System logs and shift audit management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="rpt-tabs">
        <button
          className={'rpt-tab-btn' + (activeTab === 'logs' ? ' active' : '')}
          onClick={() => setActiveTab('logs')}
        >
          📋 System Logs
        </button>
        <button
          className={'rpt-tab-btn' + (activeTab === 'shifts' ? ' active' : '')}
          onClick={() => setActiveTab('shifts')}
        >
          🕐 Shifts Audit
        </button>
      </div>

      {/* ===== TAB 1: System Logs ===== */}
      {activeTab === 'logs' && (
        <div className="rpt-section">
          <div className="rpt-filter-bar">
            <span className="rpt-filter-label">วันที่</span>
            <input
              type="date"
              className="rpt-date-input"
              value={logDate}
              onChange={e => setLogDate(e.target.value)}
              max={todayStr()}
            />
            <button
              className="rpt-search-btn"
              onClick={loadLogs}
              disabled={logLoading}
            >
              {logLoading ? 'กำลังโหลด...' : '🔍 โหลด Logs'}
            </button>
          </div>

          {logLoading ? (
            <div className="rpt-skeleton-wrap">
              {[1, 2, 3, 4].map(i => <div key={i} className="rpt-skeleton-row" />)}
            </div>
          ) : !logSearched ? (
            <div className="rpt-hint">เลือกวันที่แล้วกด โหลด Logs</div>
          ) : logs.length === 0 ? (
            <div className="rpt-empty">ไม่มี Log ในวันที่เลือก</div>
          ) : (
            <>
              <div className="rpt-section-header" style={{ borderTop: '1px solid #e2e8f0', borderRadius: 0 }}>
                <span className="rpt-section-title">ผลลัพธ์</span>
                <span className="rpt-count-badge">{logs.length} รายการ</span>
              </div>
              <div className="rpt-table-wrapper">
                <table className="rpt-table">
                  <thead>
                    <tr>
                      <th>เวลา</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>{fmtDT(log.createdAt)}</td>
                        <td><b>{log.action}</b></td>
                        <td className="rpt-details-cell">{log.details}</td>
                        <td className="rpt-table-id">{log.userId ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== TAB 2: Shifts Audit ===== */}
      {activeTab === 'shifts' && (
        <div className="rpt-section">
          <div className="rpt-filter-bar">
            <span className="rpt-filter-label">วันที่</span>
            <input
              type="date"
              className="rpt-date-input"
              value={shiftDate}
              onChange={e => setShiftDate(e.target.value)}
              max={todayStr()}
            />
            <button
              className="rpt-search-btn"
              onClick={loadShifts}
              disabled={shiftLoading}
            >
              {shiftLoading ? 'กำลังโหลด...' : '🔍 โหลด Shifts'}
            </button>
          </div>

          {shiftLoading ? (
            <div className="rpt-skeleton-wrap">
              {[1, 2, 3].map(i => <div key={i} className="rpt-skeleton-row" />)}
            </div>
          ) : !shiftSearched ? (
            <div className="rpt-hint">เลือกวันที่แล้วกด โหลด Shifts</div>
          ) : shifts.length === 0 ? (
            <div className="rpt-empty">ไม่มี Shift ในวันที่เลือก</div>
          ) : (
            <>
              <div className="rpt-section-header" style={{ borderTop: '1px solid #e2e8f0', borderRadius: 0 }}>
                <span className="rpt-section-title">ผลลัพธ์</span>
                <span className="rpt-count-badge">{shifts.length} รายการ</span>
              </div>
              <div className="rpt-table-wrapper">
                <table className="rpt-table">
                  <thead>
                    <tr>
                      <th>Shift ID</th>
                      <th>พนักงาน</th>
                      <th>บูธ</th>
                      <th>เปิด</th>
                      <th>ปิด</th>
                      <th>สถานะ</th>
                      <th>Balance Check</th>
                      <th>Audit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map(s => (
                      <tr key={s.id}>
                        <td className="rpt-table-id">{s.id}</td>
                        <td>{s.user?.username ?? s.userId}</td>
                        <td>{s.booth?.name ?? s.boothId}</td>
                        <td>{fmtDT(s.startTime)}</td>
                        <td>{s.endTime ? fmtDT(s.endTime) : <span style={{ color: '#48bb78' }}>เปิดอยู่</span>}</td>
                        <td>
                          <span className={'rpt-chip rpt-chip-' + (s.status === 'OPEN' ? 'open' : 'closed')}>
                            {s.status}
                          </span>
                        </td>
                        <td>{s.balance_check != null ? s.balance_check.toLocaleString() + ' ฿' : '—'}</td>
                        <td>
                          <button
                            className="rpt-audit-btn"
                            onClick={() => handleAudit(s)}
                            disabled={auditingId === s.id}
                          >
                            ✏️ Audit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
