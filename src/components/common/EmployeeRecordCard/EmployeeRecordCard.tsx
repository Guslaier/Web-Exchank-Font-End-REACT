import type { EmployeePerformanceData } from "../../../services/report.service";
import "./EmployeeRecordCard.css";

export type DailySheetData = {
  days: Array<{
    dateNo: number;
    weekday: string;
    isWeekend: boolean;
    cashAdvance: number;
    overShort: number;
  }>;
  totals: {
    cashAdvance: number;
    overShort: number;
  };
};

type EmployeeRecordCardProps = {
  record: EmployeePerformanceData;
  syncingId: string | null;
  isExpanded: boolean;
  dailySheet: DailySheetData;
  onToggleDetail: (record: EmployeePerformanceData) => void;
  onSync: (record: EmployeePerformanceData) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function EmployeeRecordCard({
  record,
  syncingId,
  isExpanded,
  dailySheet,
  onToggleDetail,
  onSync,
}: EmployeeRecordCardProps) {
  const net =
    Number(record.totalBalanceCheck || 0) -
    Number(record.totalCashAdvance || 0);

  return (
    <div
      className={`employee-report__grid-item employee-report__record-card ${isExpanded ? "is-selected" : ""}`}
    >
      <div className="employee-report__grid-row" role="row">
        {/* <div role="cell">
          <div className="employee-report__employee-cell-wrap">
            <div className="employee-report__employee-cell">
              <strong>{record.user.username}</strong>
              <span title={record.user.email}>{record.user.email}</span>
            </div>
            <div className="employee-detail">
              <div className="detail-row" role="row">
                <div role="cell">{formatDate(record.reportMonth)}</div>
                <div role="cell">
                  {formatCurrency(Number(record.totalBalanceCheck || 0))}
                </div>
                <div role="cell">
                  {formatCurrency(Number(record.totalCashAdvance || 0))}
                </div>
                <div
                  role="cell"
                  className={net >= 0 ? "is-positive" : "is-negative"}
                >
                  {formatCurrency(net)}
                </div>
              </div>
              <div className="employee-report__actions">
                <button
                  type="button"
                  onClick={() => onToggleDetail(record)}
                  aria-label="View detail"
                  title="View detail"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path
                      d="M12 5C6.5 5 2.1 8.4 1 12c1.1 3.6 5.5 7 11 7s9.9-3.4 11-7c-1.1-3.6-5.5-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onSync(record)}
                  disabled={syncingId === record.id}
                  aria-label={syncingId === record.id ? "Syncing" : "Sync"}
                  title={syncingId === record.id ? "Syncing" : "Sync"}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                    className={syncingId === record.id ? "is-spinning" : ""}
                  >
                    <path
                      d="M20 12a8 8 0 0 1-14.6 4.5l-1.5 1.5A1 1 0 0 1 2.2 17V12a1 1 0 0 1 1-1h5a1 1 0 0 1 .7 1.7l-2 2A6 6 0 1 0 6 9H4a8 8 0 0 1 16 3ZM22 7v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-.7-1.7l2-2A6 6 0 0 0 6 8h2a8 8 0 0 1 14-4.5l1.5-1.5A1 1 0 0 1 24.8 3V7a1 1 0 0 1-1 1h-1Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div> */}
        <div className="employee-report__employee-cell-wrap" role="cell">
          <div className="time">
            <strong>{formatDate(record.reportMonth)}</strong>
          </div>

          <div className="employee-info">
            <strong>{record.user.username}</strong>
            <div className="email" title={record.user.email}>{record.user.email}</div>
          </div>
          <div className="cash_advance">
            <div className="h-ti">Cash Advance</div>
            <p>{formatCurrency(Number(record.totalCashAdvance || 0))}</p>
          </div>
          <div className=" balance_check">
            <div className="h-ti ">Over / Short</div>
            <p className={`${Number(record.totalBalanceCheck || 0) >= 0 ? "is-positive" : "is-negative"}`}>{formatCurrency(Number(record.totalBalanceCheck || 0))}</p>
          </div>

          <div className="employee-report__actions">
            <button
              type="button"
              onClick={() => onToggleDetail(record)}
              aria-label="View detail"
              title="View detail"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path
                  d="M12 5C6.5 5 2.1 8.4 1 12c1.1 3.6 5.5 7 11 7s9.9-3.4 11-7c-1.1-3.6-5.5-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-2.2a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onSync(record)}
              disabled={syncingId === record.id}
              aria-label={syncingId === record.id ? "Syncing" : "Sync"}
              title={syncingId === record.id ? "Syncing" : "Sync"}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
                className={syncingId === record.id ? "is-spinning" : ""}
              >
                <path
                  d="M20 12a8 8 0 0 1-14.6 4.5l-1.5 1.5A1 1 0 0 1 2.2 17V12a1 1 0 0 1 1-1h5a1 1 0 0 1 .7 1.7l-2 2A6 6 0 1 0 6 9H4a8 8 0 0 1 16 3ZM22 7v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-.7-1.7l2-2A6 6 0 0 0 6 8h2a8 8 0 0 1 14-4.5l1.5-1.5A1 1 0 0 1 24.8 3V7a1 1 0 0 1-1 1h-1Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          <div className=" employee-report__net">
            <div className="h-ti">Net</div>
            <div className={`net ${net >= 0 ? "is-positive" : "is-negative"}`}>
              <span>{formatCurrency(net)}</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="employee-report__daily-sheet-wrap">
            <table className="employee-report__daily-sheet employee-report__daily-sheet--vertical">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Date</th>
                  <th>Cash Advance</th>
                  <th>Over / Short</th>
                </tr>
              </thead>
              <tbody>
                {dailySheet.days.map((day) => (
                  <tr key={`v-${day.dateNo}`}>
                    <td className={day.isWeekend ? "is-weekend" : ""}>
                      {day.weekday}
                    </td>
                    <td className={day.isWeekend ? "is-weekend" : ""}>
                      {day.dateNo}
                    </td>
                    <td>
                      {day.cashAdvance > 0
                        ? `-${formatCurrency(day.cashAdvance)}`
                        : ""}
                    </td>
                    <td
                      className={
                        day.overShort < 0
                          ? "is-negative"
                          : day.overShort > 0
                            ? "is-positive"
                            : ""
                      }
                    >
                      {day.overShort !== 0 ? formatCurrency(day.overShort) : ""}
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
