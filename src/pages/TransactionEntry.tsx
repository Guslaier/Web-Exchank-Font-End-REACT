import React, { useState, useEffect, useCallback } from 'react';
import './TransactionEntry.css';
import Swal from 'sweetalert2';
import api from '../services/api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/api.config';

type TranType = 'BUY' | 'SELL';

interface RateOption {
  id: string;
  name: string;
  buy_rate: number;
  sell_rate: number;
}

const EMPTY_FORM = {
  foreignAmount: '',
  note: '',
  passportNo: '',
  fullName: '',
  nationality: '',
  phoneNumber: '',
  hotelName: '',
  roomNumber: '',
};

export default function TransactionEntry() {
  const shiftId = localStorage.getItem(STORAGE_KEYS.SHIFT_ID);

  const [type, setType]             = useState<TranType>('BUY');
  const [rates, setRates]           = useState<RateOption[]>([]);
  const [selectedRateId, setSelectedRateId] = useState('');
  const [form, setForm]             = useState({ ...EMPTY_FORM });
  const [imgFile, setImgFile]       = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [showOptional, setShowOptional] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(true);

  const loadRates = useCallback(async () => {
    setRatesLoading(true);
    try {
      const res = await api.get<RateOption[]>(API_ENDPOINTS.EXCHANGE_RATE.GET_ALL);
      const arr = Array.isArray(res.data) ? res.data : [];
      setRates(arr);
      if (arr.length > 0) setSelectedRateId(arr[0].id);
    } catch (err: any) {
      Swal.fire({
        icon: 'error', title: 'โหลด Exchange Rates ไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setRatesLoading(false);
    }
  }, []);

  useEffect(() => { loadRates(); }, [loadRates]);

  const selectedRate = rates.find(r => r.id === selectedRateId);
  const activeRate   = selectedRate ? (type === 'BUY' ? selectedRate.buy_rate : selectedRate.sell_rate) : 0;
  const foreignAmt   = parseFloat(form.foreignAmount) || 0;
  const thaiBahtAmt  = foreignAmt * activeRate;

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImgPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedRateId) {
      Swal.fire({ icon: 'warning', title: 'กรุณาเลือกสกุลเงิน', confirmButtonColor: '#3535cc' });
      return;
    }
    if (foreignAmt <= 0) {
      Swal.fire({ icon: 'warning', title: 'กรุณาระบุจำนวนเงิน', confirmButtonColor: '#3535cc' });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: 'ยืนยันรายการ',
      html: `<b>${type}</b> ${selectedRate?.name ?? ''}<br/>
             จำนวน: <b>${foreignAmt.toLocaleString()}</b><br/>
             อัตราแลกเปลี่ยน: <b>${activeRate}</b><br/>
             ยอดบาท: <b>${thaiBahtAmt.toLocaleString('th-TH', { maximumFractionDigits: 2 })} ฿</b>`,
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#3535cc',
      cancelButtonColor: '#a0aec0',
    });
    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('exchangeRatesId', selectedRateId);
      fd.append('type', type);
      fd.append('foreignAmount', foreignAmt.toString());
      fd.append('exchangeRate', activeRate.toString());
      fd.append('thaiBahtAmount', thaiBahtAmt.toString());
      if (form.note)         fd.append('note', form.note);
      if (form.passportNo)   fd.append('passportNo', form.passportNo);
      if (form.fullName)     fd.append('fullName', form.fullName);
      if (form.nationality)  fd.append('nationality', form.nationality);
      if (form.phoneNumber)  fd.append('phoneNumber', form.phoneNumber);
      if (form.hotelName)    fd.append('hotelName', form.hotelName);
      if (form.roomNumber)   fd.append('roomNumber', form.roomNumber);
      if (imgFile)           fd.append('customer_img', imgFile);

      await api.post(API_ENDPOINTS.EXCHANGE_TRANSACTION.CREATE, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Swal.fire({
        icon: 'success', title: 'บันทึกรายการสำเร็จ',
        timer: 2000, timerProgressBar: true,
        confirmButtonColor: '#3535cc',
      });

      setForm({ ...EMPTY_FORM });
      setImgFile(null);
      setImgPreview(null);
      setShowOptional(false);
    } catch (err: any) {
      Swal.fire({
        icon: 'error', title: 'บันทึกไม่สำเร็จ',
        text: err?.response?.data?.message ?? 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#3535cc',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!shiftId) {
    return (
      <div className="txe-page">
        <div className="header">
          <div className="h-l">
            <h1 className="TP">Transaction Entry</h1>
            <p className="STP">บันทึกรายการแลกเปลี่ยน</p>
          </div>
        </div>
        <div className="txe-no-shift">⚠️ ยังไม่ได้เปิด Shift กรุณาเปิด Shift ก่อนเริ่มงาน</div>
      </div>
    );
  }

  return (
    <div className="txe-page">
      <div className="header">
        <div className="h-l">
          <h1 className="TP">Transaction Entry</h1>
          <p className="STP">บันทึกรายการแลกเปลี่ยนเงินตรา</p>
        </div>
      </div>

      <div className="txe-card">
        {/* BUY / SELL toggle */}
        <div className="txe-type-toggle">
          <button
            className={'txe-type-btn' + (type === 'BUY' ? ' buy-active' : '')}
            onClick={() => setType('BUY')}
          >
            💵 BUY (ซื้อเงินต่างชาติ)
          </button>
          <button
            className={'txe-type-btn' + (type === 'SELL' ? ' sell-active' : '')}
            onClick={() => setType('SELL')}
          >
            💴 SELL (ขายเงินต่างชาติ)
          </button>
        </div>

        {/* Currency Selector */}
        <div className="txe-form-group">
          <label className="txe-label">สกุลเงิน / Exchange Rate</label>
          {ratesLoading ? (
            <div style={{ color: '#a0aec0', fontSize: '0.87rem' }}>กำลังโหลด...</div>
          ) : (
            <select
              className="txe-select"
              value={selectedRateId}
              onChange={e => setSelectedRateId(e.target.value)}
            >
              {rates.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Rate Display */}
        {selectedRate && (
          <div className="txe-rate-display">
            <div className="txe-rate-item">
              <span className="txe-rate-label">Buy Rate</span>
              <span className="txe-rate-value" style={{ color: '#006d35' }}>{selectedRate.buy_rate}</span>
            </div>
            <div className="txe-rate-item">
              <span className="txe-rate-label">Sell Rate</span>
              <span className="txe-rate-value" style={{ color: '#c00000' }}>{selectedRate.sell_rate}</span>
            </div>
            <div className="txe-rate-item">
              <span className="txe-rate-label">อัตราที่ใช้</span>
              <span className="txe-rate-value">{activeRate}</span>
            </div>
          </div>
        )}

        {/* Foreign Amount */}
        <div className="txe-form-group">
          <label className="txe-label">จำนวนเงินต่างชาติ</label>
          <input
            type="number"
            className="txe-input"
            placeholder="0.00"
            min="0"
            value={form.foreignAmount}
            onChange={e => setForm(f => ({ ...f, foreignAmount: e.target.value }))}
          />
        </div>

        {/* THB Amount */}
        {foreignAmt > 0 && (
          <div className="txe-thb-box">
            <span className="txe-thb-label">ยอดเงินบาท (คำนวณอัตโนมัติ)</span>
            <span className="txe-thb-value">
              {thaiBahtAmt.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
            </span>
          </div>
        )}

        {/* Note */}
        <div className="txe-form-group">
          <label className="txe-label">
            หมายเหตุ <span className="txe-optional">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            className="txe-input"
            placeholder="หมายเหตุ..."
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          />
        </div>

        <hr className="txe-divider" />

        {/* Optional Customer Info Toggle */}
        <button
          className="txe-optional-toggle"
          onClick={() => setShowOptional(v => !v)}
          type="button"
        >
          {showOptional ? '▼' : '▶'} ข้อมูลลูกค้า (ไม่บังคับ)
        </button>

        {showOptional && (
          <>
            <div className="txe-form-grid-2">
              <div className="txe-form-group">
                <label className="txe-label">ชื่อ-นามสกุล</label>
                <input type="text" className="txe-input" placeholder="Full Name"
                  value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="txe-form-group">
                <label className="txe-label">เลขพาสปอร์ต</label>
                <input type="text" className="txe-input" placeholder="Passport No."
                  value={form.passportNo} onChange={e => setForm(f => ({ ...f, passportNo: e.target.value }))} />
              </div>
              <div className="txe-form-group">
                <label className="txe-label">สัญชาติ</label>
                <input type="text" className="txe-input" placeholder="Nationality"
                  value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} />
              </div>
              <div className="txe-form-group">
                <label className="txe-label">เบอร์โทร</label>
                <input type="text" className="txe-input" placeholder="Phone Number"
                  value={form.phoneNumber} onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
              </div>
              <div className="txe-form-group">
                <label className="txe-label">โรงแรม</label>
                <input type="text" className="txe-input" placeholder="Hotel Name"
                  value={form.hotelName} onChange={e => setForm(f => ({ ...f, hotelName: e.target.value }))} />
              </div>
              <div className="txe-form-group">
                <label className="txe-label">เลขห้อง</label>
                <input type="text" className="txe-input" placeholder="Room Number"
                  value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} />
              </div>
            </div>

            <div className="txe-form-group">
              <label className="txe-label">รูปภาพลูกค้า</label>
              <div className="txe-img-upload">
                {imgPreview && (
                  <img src={imgPreview} alt="customer" className="txe-img-preview" />
                )}
                <input type="file" accept="image/*" onChange={handleImgChange} />
              </div>
            </div>
          </>
        )}

        <button
          className="txe-submit-btn"
          onClick={handleSubmit}
          disabled={submitting || ratesLoading}
        >
          {submitting ? 'กำลังบันทึก...' : '✓ บันทึกรายการ'}
        </button>
      </div>
    </div>
  );
}
