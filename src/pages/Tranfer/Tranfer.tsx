import React, { useState, useEffect, useCallback } from 'react';
import './Tranfer.css';
import Swal from 'sweetalert2';
import { BoothService } from '../../services/booth.service';
import { CurrencyService, ExchangeRateService } from '../../services/currency.service';
import {
  TransferService,
  type TransferTransaction,
} from '../../services/transfer.service';
import type { BoothData } from '../../types/entities';
import type { CurrencyData, ExchangeCurrencyData } from '../../services/currency.service';

type TransferMode = 'BOOTH_TO_BOOTH' | 'CENTER_TO_BOOTH';
type CashFlow = 'CASH_IN' | 'CASH_OUT';

export default function Transfer() {
  const [mode, setMode] = useState<TransferMode>('BOOTH_TO_BOOTH');
  const [cashFlow, setCashFlow] = useState<CashFlow>('CASH_IN');

  const [booths, setBooths] = useState<BoothData[]>([]);
  const [currencies, setCurrencies] = useState<{ id: string; code: string; name: string }[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<TransferTransaction[]>([]);

  const [fromBoothId, setFromBoothId] = useState('');
  const [toBoothId, setToBoothId] = useState('');
  const [boothId, setBoothId] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [amount, setAmount] = useState('');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [boothsData, currenciesData, transfers] = await Promise.all([
        BoothService.getAllBooths(),
        ExchangeRateService.getAll(),
        TransferService.getAll(),
      ]);
      setBooths(boothsData);
      const newData = Object.values(currenciesData) as ExchangeCurrencyData[];
    const currencyList = newData.map((c) => c.rates.map((r) => ({
      id: r.id,
      code: c.currencyInfo.code,
      name: r.name,
    }))).flat();
    setCurrencies(currencyList);
      setRecentTransfers(transfers);
      if (currencyList.length > 0) {
        if (currencyList.some((r) => r.code === 'THB')) {
          setCurrencyId((currencyList.find((r) => r.code === 'THB') as any)?.id ?? '');
        } else {          setCurrencyId((currencyList[0] as any)?.id ?? '');
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      Swal.fire({
        icon: 'error',
        title: 'โหลดข้อมูลไม่สำเร็จ',
        text: 'ไม่สามารถดึงข้อมูลบูธหรืออัตราแลกเปลี่ยนได้ กรุณาลองใหม่',
        confirmButtonColor: 'var(--transfer-btn-process-bg)',
      });
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (!currencyId || !amount || parseFloat(amount) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณาเลือกสกุลเงินและระบุจำนวนเงินที่ถูกต้อง',
        confirmButtonColor: 'var(--transfer-btn-process-bg)',
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'BOOTH_TO_BOOTH') {
        if (!fromBoothId || !toBoothId) {
          Swal.fire({
            icon: 'warning',
            title: 'ข้อมูลไม่ครบ',
            text: 'กรุณาเลือก From Booth และ To Booth',
            confirmButtonColor: 'var(--transfer-btn-process-bg)',
          });
          return;
        }
        await TransferService.boothToBooth({
          boothId: fromBoothId,
          refBoothId: toBoothId,
          amount: parseFloat(amount),
          exchangeRateId: currencyId,
        });
      } else {
        if (!boothId) {
          Swal.fire({
            icon: 'warning',
            title: 'ข้อมูลไม่ครบ',
            text: 'กรุณาเลือกบูธ',
            confirmButtonColor: 'var(--transfer-btn-process-bg)',
          });
          return;
        }
        await TransferService.centerToBooth({
          boothId,
          amount: parseFloat(amount),
          type: cashFlow,
          exchangeRateId: currencyId,
        });
      }

      setAmount('');
      setFromBoothId('');
      setToBoothId('');
      setBoothId('');

      const transfers = await TransferService.getAll();
      setRecentTransfers(transfers);

      Swal.fire({
        icon: 'success',
        title: 'โอนเงินสำเร็จ',
        text: 'ทำรายการโอนเงินเรียบร้อยแล้ว',
        confirmButtonColor: 'var(--transfer-btn-process-bg)',
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Transfer failed. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'โอนเงินไม่สำเร็จ',
        text: Array.isArray(msg) ? msg.join(', ') : msg,
        confirmButtonColor: 'var(--transfer-btn-process-bg)',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="transfer-page">
        <div className='header'>
            <div className="h-l">
          <h1 className="TP">Transfer Transaction</h1>
      <p className="STP">Transfer currency between booths or center</p>
        </div>
            
        </div>
      

      <div className="transfer-form-card">
        {/* Transfer Type */}
        <div className="transfer-field-group">
          <label className="transfer-label">Transfer Type</label>
          <div className="transfer-toggle-group">
            <button
              className={`transfer-toggle-btn${mode === 'BOOTH_TO_BOOTH' ? ' active' : ''}`}
              onClick={() => { setMode('BOOTH_TO_BOOTH'); }}
            >
              Booth to Booth
            </button>
            <button
              className={`transfer-toggle-btn${mode === 'CENTER_TO_BOOTH' ? ' active' : ''}`}
              onClick={() => { setMode('CENTER_TO_BOOTH'); }}
            >
              Center to Booth
            </button>
          </div>
        </div>

        {/* Cash Flow (Center to Booth only) */}
        {mode === 'CENTER_TO_BOOTH' && (
          <div className="transfer-field-group">
            <label className="transfer-label">Cash Flow</label>
            <div className="transfer-toggle-group">
              <button
                className={`transfer-toggle-btn cash-in${cashFlow === 'CASH_IN' ? ' active' : ''}`}
                onClick={() => setCashFlow('CASH_IN')}
              >
                Cash In (Center → Booth)
              </button>
              <button
                className={`transfer-toggle-btn cash-out${cashFlow === 'CASH_OUT' ? ' active' : ''}`}
                onClick={() => setCashFlow('CASH_OUT')}
              >
                Cash Out (Booth → Center)
              </button>
            </div>
          </div>
        )}

        {/* Booth Selectors */}
        {mode === 'BOOTH_TO_BOOTH' ? (
          <div className="transfer-row">
            <div className="transfer-field">
              <label className="transfer-label">From Booth</label>
              <select
                className="transfer-select"
                value={fromBoothId}
                onChange={(e) => setFromBoothId(e.target.value)}
              >
                <option value="">Select booth...</option>
                {booths.map((b) => {
                  if (b.id !== toBoothId) {
                    return <option key={b.id} value={b.id}>{b.name}</option>;
                  }
                  return null;
                })}
              </select>
            </div>
            <div className="transfer-field">
              <label className="transfer-label">To Booth</label>
              <select
                className="transfer-select"
                value={toBoothId}
                onChange={(e) => setToBoothId(e.target.value)}
              >
                <option value="">Select booth...</option>
                {booths.map((b) => {
                  if (b.id !== fromBoothId) {
                    return <option key={b.id} value={b.id}>{b.name}</option>;
                  }
                  return null;
                })}
              </select>
            </div>
          </div>
        ) : (
          <div className="transfer-field-group">
            <label className="transfer-label">Booth</label>
            <select
              className="transfer-select"
              value={boothId}
              onChange={(e) => setBoothId(e.target.value)}
            >
              <option value="">Select booth...</option>
              {booths.map((b) => {
                if (b.id !== null) {
                  return <option key={b.id} value={b.id}>{b.name}</option>;
                }
                return null;
              })}
            </select>
          </div>
        )}

        {/* Currency + Amount */}
        <div className="transfer-row">
          <div className="transfer-field">
            <label className="transfer-label">Currency</label>
            <select
              className="transfer-select"
              value={currencyId}
              onChange={(e) => setCurrencyId(e.target.value)}
            >
              {(currencies as any[]).map((c) => (
                <option key={c.id} value={c.id}>
                  {`${c.code} : ${c.name}`}
                </option>
              ))}
            </select>
          </div>
          <div className="transfer-field">
            <label className="transfer-label">Amount</label>
            <input
              type="number"
              className="transfer-input"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="1"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          className="transfer-submit-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          <span className="transfer-submit-icon">➤</span>
          {loading ? 'Processing...' : 'Process Transfer'}
        </button>
      </div>

      {/* Recent Transfers */}
      <div className="transfer-recent">
        <h2 className="transfer-recent-title">Recent Transfers</h2>
        <div className="transfer-recent-list">
          {initialLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="transfer-skeleton" />
            ))
          ) : recentTransfers.length === 0 ? (
            <p className="transfer-empty">No recent transfers</p>
          ) : (
            recentTransfers.slice(0, 10).map((tx) => (
              <div key={tx.transactionNo || tx.id} className="transfer-recent-item">
                <div className="transfer-recent-left">
                  <div className="transfer-recent-icon">→</div>
                  <div>
                    <div className="transfer-recent-id">
                      {tx.transactionNo || tx.id}
                    </div>
                    <div className="transfer-recent-route">
                      {tx.boothName || tx.boothId}{' '}
                      → {tx.refBoothName || tx.refBoothId || 'Center'}
                    </div>
                  </div>
                </div>
                <div className="transfer-recent-right">
                  <div className="transfer-recent-amount">
                    {tx.amount?.toLocaleString()}{' '}
                    {tx.exchangeRateName || ''}
                  </div>
                  <div className="transfer-recent-time">
                    {tx.createdAt ? formatTime(tx.createdAt) : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
