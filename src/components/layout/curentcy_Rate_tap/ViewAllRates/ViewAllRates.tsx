import { useState, useEffect } from "react";
import "./ViewAllRates.css";
import {
  ExchangeRateService,
  CurrencyService,
  type BoothRates,
  type CurrencyData,
} from "../../../../services/currency.service";

export default function ViewAllRates() {
  const [boothRates, setBoothRates] = useState<BoothRates[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rates, currs] = await Promise.all([
        ExchangeRateService.getAll(),
        CurrencyService.getAll(),
      ]);
      setCurrencies(currs);
    } catch (err) {
      console.error("ViewAllRates: loadData", err);
    } finally {
      setLoading(false);
    }
  };

  /** หา buy rate ของสกุลเงินในบูธ์ที่ระบุ */
  const getRate = (booth: BoothRates, code: string): string => {
    const rate = booth.exchange_rates.find((r) => r.name === code);
    return rate ? rate.base_buy.toFixed(4) : "–";
  };

  if (loading) return <div className="cr-loading">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="var-wrap">
      {/* ===== Header row ===== */}
      <div className="var-header">
        <div>
          <h2 className="var-title">View All Booths Rates</h2>
          <p className="var-subtitle">
            Comparing BUY rates across all locations
          </p>
        </div>
        <button className="var-btn-export" onClick={() => window.print()}>
          Export Data
        </button>
      </div>

      {/* ===== Table ===== */}
      <div className="table-container">
        <table className="table var-table">
          <thead>
            <tr>
              <th className="var-th var-th--currency">Currency</th>
              {boothRates.map((b) => (
                <th key={b.booth_id} className="var-th text-center">
                  Booth {b.booth_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currencies.map((cur, idx) => (
              <tr
                key={cur.id}
                className={`border-t border-gray-100 hover\:bg-gray-50 ${idx % 2 !== 0 ? "main-row-alt" : ""}`}
              >
                <td className="var-td var-td--code">
                  <div className="var-currency-cell">
                    <span className="var-code">{cur.code}</span>
                    <span className="var-name">{cur.name}</span>
                  </div>
                </td>
                {boothRates.map((b) => (
                  <td
                    key={b.booth_id}
                    className="var-td text-center var-rate-val"
                  >
                    {getRate(b, cur.code)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
