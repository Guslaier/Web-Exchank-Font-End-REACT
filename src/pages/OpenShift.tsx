import React, { useState, useEffect, useCallback } from 'react';
import './OpenShift.css';
import Swal from 'sweetalert2';
import { BoothService } from '../services/booth.service';
import { ShiftAdminService, type ShiftRecord } from '../services/shift-admin.service';
import { STORAGE_KEYS } from '../config/api.config';
import type { BoothData } from '../types/entities';
import { ShiftService } from '../services/shift.service';

function fmtDT(ds?: string | Date) {
  if (!ds) return '—';
  return new Date(ds).toLocaleString('th-TH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function OpenShift() {
  const [booths, setBooths]         = useState<BoothData[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<string>('');
  const [currentShift, setCurrentShift]   = useState<ShiftRecord | null>(null);
  const [loading, setLoading]       = useState(false);
  const [opening, setOpening]       = useState(false);
  const [closing, setClosing]       = useState(false);
  const [isStatus, setIsStatus]     = useState<string>("Unknown");

  const storedShiftId = localStorage.getItem(STORAGE_KEYS.SHIFT_ID);
  const storedBoothId = localStorage.getItem(STORAGE_KEYS.BOOTH_ID);

  const loadBooths = useCallback(async () => {
    setLoading(true);
    try {
      const data = await BoothService.getAllBooths();
      setBooths(data.filter(b => b.isActive));
    } catch {
      /* silently ignore on load */
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCurrentShift = useCallback(async () => {
    if (!storedShiftId) { setCurrentShift(null); return; }
    try {
      const actives = await ShiftAdminService.getActives();
      const found   = actives.find(s => s.id === storedShiftId) ?? null;
      setCurrentShift(found);
      if (!found) {
        // shift closed externally — clean up storage
        localStorage.removeItem(STORAGE_KEYS.SHIFT_ID);
        localStorage.removeItem(STORAGE_KEYS.BOOTH_ID);
      }
    } catch {
      /* ignore */
    }
  }, [storedShiftId]);

  useEffect(() => {
    loadBooths();
    loadCurrentShift();
  }, [loadBooths, loadCurrentShift]);

  const fetchBoothStatus = async (boothId: string) => {
    try {
      const shiftData = await ShiftService.getByBooth(boothId);
  
      if (shiftData?.startTime) {
        const now = new Date();
        const startTime = new Date(shiftData.startTime);
  
        // สร้าง Date Object ที่เซ็ตเวลาเป็น 00:00:00 เพื่อเช็คแค่วันที่
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const shiftDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
  
        // คำนวณหาความต่างของวัน
        const diffTime = shiftDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
        if (diffDays === 0) {
          return "HaveCurrentShift";
        } else if (diffDays === 1) {
          return "ReadyForTomorrow";
        } else if (diffDays < 0) {
          return "Expired";
        } else {
          return "FutureShift";
        }
      } else {

        return "NoShift";
      }
    } catch (error) {
      setIsStatus("Unknown");
    }
  };
  const handleOpen = async () => {
    if (!selectedBooth) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือก Booth',
        text: 'โปรดเลือก Booth ที่ต้องการเปิด Shift',
        confirmButtonColor: '#3535cc',
      });
      return;
    }

    const ceckedBoothOpen = await fetchBoothStatus(selectedBooth);
    if(ceckedBoothOpen === "HaveCurrentShift" || ceckedBoothOpen === "ReadyForTomorrow"){
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถเปิด Shift ได้',
        text: 'Booth นี้มี Shift ที่เปิดอยู่แล้ว หรือพร้อมเปิดพรุ่งนี้',
        confirmButtonColor: '#3535cc',
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: 'ยืนยันการเปิด Shift',
      html: `เปิด Shift ที่ <strong>${booths?.find(b => b.id === selectedBooth)?.name ?? selectedBooth}</strong><br><small style="color:#718096">${booths?.find(b => b.id === selectedBooth)?.location ?? ''}</small>`,
      showCancelButton: true,
      confirmButtonText: '✅ เปิด Shift',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#48bb78',
      cancelButtonColor: '#718096',
    });
    if (!confirm.isConfirmed) return;

    setOpening(true);
    try {
      const shift = await ShiftAdminService.open(selectedBooth);
      localStorage.setItem(STORAGE_KEYS.SHIFT_ID, shift.id);
      localStorage.setItem(STORAGE_KEYS.BOOTH_ID, selectedBooth);
      setCurrentShift(shift);
      await loadBooths();
      Swal.fire({
        icon: 'success',
        title: 'เปิด Shift สำเร็จ',
        html: `<p>Shift ID: <strong>${shift.id}</strong></p><p>Booth: <strong>${booths?.find(b => b.id === selectedBooth)?.name ?? selectedBooth}</strong></p>`,
        confirmButtonColor: '#3535cc',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'เกิดข้อผิดพลาดในการเปิด Shift';
      Swal.fire({ icon: 'error', title: 'เปิด Shift ไม่สำเร็จ', text: msg, confirmButtonColor: '#3535cc' });
    } finally {
      setOpening(false);
    }
  };

  const handleClose = async () => {
    if (!storedShiftId) return;

    const confirm = await Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการปิด Shift',
      text: `ต้องการปิด Shift นี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้`,
      showCancelButton: true,
      confirmButtonText: '🔒 ปิด Shift',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#718096',
    });
    if (!confirm.isConfirmed) return;

    setClosing(true);
    try {
      await ShiftAdminService.close(storedShiftId);
      localStorage.removeItem(STORAGE_KEYS.SHIFT_ID);
      localStorage.removeItem(STORAGE_KEYS.BOOTH_ID);
      setCurrentShift(null);
      setSelectedBooth('');
      await loadBooths();
      Swal.fire({
        icon: 'success',
        title: 'ปิด Shift สำเร็จ',
        text: 'Shift ของคุณถูกปิดเรียบร้อยแล้ว',
        confirmButtonColor: '#3535cc',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'เกิดข้อผิดพลาดในการปิด Shift';
      Swal.fire({ icon: 'error', title: 'ปิด Shift ไม่สำเร็จ', text: msg, confirmButtonColor: '#3535cc' });
    } finally {
      setClosing(false);
    }
  };

  const shiftOpen = !!storedShiftId && !!currentShift;

  return (
    <div className="os-page">
      {/* Header */}
      <div className="header">
        <div className="h-l">
          <h1 className="TP">Open Shift</h1>
          <p className="STP">เปิด / ปิด กะการทำงาน</p>
        </div>
        <button
          className="os-refresh-btn"
          onClick={() => { loadBooths(); loadCurrentShift(); }}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ── Current Shift Status Banner ── */}
      <div className={`os-status-banner ${shiftOpen ? 'os-status-open' : 'os-status-closed'}`}>
        <div className="os-status-icon">{shiftOpen ? '🟢' : '🔴'}</div>
        <div className="os-status-body">
          <span className="os-status-label">
            {shiftOpen ? 'Shift กำลังเปิดอยู่' : 'ยังไม่มี Shift ที่เปิดอยู่'}
          </span>
          {shiftOpen && currentShift && (
            <span className="os-status-meta">
              Shift ID: <strong>{currentShift.id}</strong>
              &nbsp;·&nbsp;
              เริ่มเมื่อ: <strong>{fmtDT(currentShift.startTime)}</strong>
              {currentShift.booth && (
                <>&nbsp;·&nbsp;Booth: <strong>{currentShift.booth.name}</strong></>
              )}
            </span>
          )}
        </div>
        {shiftOpen && (
          <button
            className="os-close-btn"
            onClick={handleClose}
            disabled={closing}
          >
            {closing ? 'กำลังปิด...' : '🔒 ปิด Shift'}
          </button>
        )}
      </div>

      {/* ── Open Shift Form (shown when no shift is open) ── */}
      {!shiftOpen && (
        <div className="os-card">
          <h2 className="os-card-title">เลือก Booth เพื่อเปิด Shift</h2>

          {loading ? (
            <div className="os-skeleton-grid">
              {[1, 2, 3, 4].map(i => <div key={i} className="os-skeleton-booth" />)}
            </div>
          ) : booths.length === 0 ? (
            <div className="os-empty">ไม่มี Booth ที่พร้อมใช้งาน</div>
          ) : (
            <div className="os-booth-grid">
              {booths.map(booth => {
                const currant = !(!!booth.currentShiftId);
                const selected = selectedBooth === booth.id;
                return (
                  <button
                    key={booth.id}
                    className={`os-booth-card ${selected ? 'os-booth-selected' : ''} ${currant ? 'os-booth-occupied' : ''}`}
                    onClick={() => setSelectedBooth(booth.id)}
                    disabled={currant}
                  >
                    <div className="os-booth-icon">🏪</div>
                    <div className="os-booth-name">{booth.name}</div>
                    <div className="os-booth-location">📍 {booth.location}</div>
                    <div className={`os-booth-chip ${currant ? 'os-chip-busy' : 'os-chip-free'}`}>
                      {currant ? 'Available' : 'HaveCurrentShift'}
                    </div>
                    {selected && <div className="os-booth-check">✓</div>}
                  </button>
                );
              })}
            </div>
          )}

          <div className="os-action-row">
            {selectedBooth && (
              <span className="os-selected-label">
                เลือกแล้ว: <strong>{booths.find(b => b.id === selectedBooth)?.name}</strong>
              </span>
            )}
            <button
              className="os-open-btn"
              onClick={handleOpen}
              disabled={!selectedBooth || opening}
            >
              {opening ? '⏳ กำลังเปิด...' : '✅ เปิด Shift'}
            </button>
          </div>
        </div>
      )}

      {/* ── Active Shift Detail Card (shown when shift is open) ── */}
      {shiftOpen && currentShift && (
        <div className="os-card">
          <h2 className="os-card-title">รายละเอียด Shift ปัจจุบัน</h2>
          <div className="os-detail-grid">
            <div className="os-detail-item">
              <span className="os-detail-label">Shift ID</span>
              <span className="os-detail-value os-mono">{currentShift.id}</span>
            </div>
            <div className="os-detail-item">
              <span className="os-detail-label">Booth</span>
              <span className="os-detail-value">
                {currentShift.booth?.name ?? storedBoothId ?? '—'}
              </span>
            </div>
            <div className="os-detail-item">
              <span className="os-detail-label">สาขา</span>
              <span className="os-detail-value">
                {currentShift.booth?.location ?? '—'}
              </span>
            </div>
            <div className="os-detail-item">
              <span className="os-detail-label">เวลาเริ่ม</span>
              <span className="os-detail-value">{fmtDT(currentShift.startTime)}</span>
            </div>
            <div className="os-detail-item">
              <span className="os-detail-label">สถานะ</span>
              <span className={`os-status-chip os-chip-${currentShift.status?.toLowerCase()}`}>
                {currentShift.status}
              </span>
            </div>
            <div className="os-detail-item">
              <span className="os-detail-label">พนักงาน (User ID)</span>
              <span className="os-detail-value os-mono">{currentShift.userId}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
