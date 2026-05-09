import { useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "./Employee_Report.css";
import { EmployeeRecordCard } from "../../../common/EmployeeRecordCard/EmployeeRecordCard";
import {
  reportService,
  type EmployeePerformanceData,
} from "../../../../services/report.service";


const MONTH_INPUT_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
});

function startOfMonth(value: string) {
  const date = new Date(`${value}-01T00:00:00`);
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(value: string) {
  const date = new Date(`${value}-01T00:00:00`);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function EmployeeReport() {
  const [month, setMonth] = useState(() =>
    MONTH_INPUT_FORMATTER.format(new Date()),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState<EmployeePerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [expandedRecord, setExpandedRecordIds] = useState<boolean>(false);

  const summary = useMemo(() => {
    const totalEmployees = records.length;
    const totalBalanceCheck = records.reduce(
      (sum, item) => sum + Number(item.totalBalanceCheck || 0),
      0,
    );
    const totalCashAdvance = records.reduce(
      (sum, item) => sum + Number(item.totalCashAdvance || 0),
      0,
    );

    return {
      totalEmployees,
      totalBalanceCheck,
      totalCashAdvance,
      net: totalBalanceCheck - totalCashAdvance,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return records;
    }

    return records.filter((record) => {
      const username = record.user.username?.toLowerCase() ?? "";
      const email = record.user.email?.toLowerCase() ?? "";
      return username.includes(keyword) || email.includes(keyword);
    });
  }, [records, searchTerm]);

  const loadRecords = async (currentMonth = month) => {
    setLoading(true);
    try {
      const data = await reportService.getAll(
        startOfMonth(currentMonth),
        endOfMonth(currentMonth),
      );
      console.log("Loaded employee performance data:", data);
      setRecords(data);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    loadRecords();
  }, [month]);

  const handleToggleRecordDetail = () => {
    setExpandedRecordIds((prev) => !prev);
  };

  const handleSync = async (record: EmployeePerformanceData) => {
    setSyncingId(record.id);
    try {
      await reportService.syncUser(record.user.id, new Date(record.reportMonth));
      await loadRecords();
    } finally {
      setSyncingId(null);
    }
  };

  const handleRefresh = async () => {
    setExpandedRecordIds(false);
    await loadRecords();
  };

  const buildDailySheet = (record: EmployeePerformanceData) => {
    const monthDate = new Date(`${month}-01T00:00:00`);
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const grouped = new Map<number, { cashAdvance: number; overShort: number }>();

    for (const shift of record.user.shifts ?? []) {
      const shiftDate = new Date(shift.startTime);
      if (
        shiftDate.getFullYear() !== year ||
        shiftDate.getMonth() !== monthIndex
      ) {
        continue;
      }

      const day = shiftDate.getDate();
      const cash = Number(shift.cash_advance || 0);
      const overShort = Number(shift.balance_check || 0);
      const current = grouped.get(day) ?? { cashAdvance: 0, overShort: 0 };
      current.cashAdvance += cash;
      current.overShort += overShort;
      grouped.set(day, current);
    }

    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const dateNo = index + 1;
      const date = new Date(year, monthIndex, dateNo);
      const dayIndex = date.getDay();
      const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" })
        .format(date)
        .toUpperCase();
      const data = grouped.get(dateNo);
      return {
        dateNo,
        weekday,
        isWeekend: dayIndex === 0 || dayIndex === 6,
        cashAdvance: data?.cashAdvance ?? 0,
        overShort: data?.overShort ?? 0,
      };
    });

    const totals = days.reduce(
      (acc, day) => {
        acc.cashAdvance += day.cashAdvance;
        acc.overShort += day.overShort;
        return acc;
      },
      { cashAdvance: 0, overShort: 0 },
    );

    return { days, totals };
  };

  const handleExportMonthlyExcel = async () => {
    setExporting(true);
    try {
      if (filteredRecords.length === 0) {
        window.alert("No monthly data to export.");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Monthly Detail");

      const monthDate = new Date(`${month}-01T00:00:00`);
      const year = monthDate.getFullYear();
      const monthIndex = monthDate.getMonth();
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

      const setBorder = (cell: any) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      };

      filteredRecords.forEach((record, personIndex) => {
        const baseCol = personIndex * 5 + 1;
        const titleRow = 1;
        const subHeaderRow = 2;
        const dataStartRow = 3;
        const summaryStartRow = dataStartRow + daysInMonth + 2;

        const grouped = new Map<number, { cashAdvance: number; overShort: number }>();

        for (const shift of record.user.shifts ?? []) {
          const shiftDate = new Date(shift.startTime);
          if (
            shiftDate.getFullYear() !== year ||
            shiftDate.getMonth() !== monthIndex
          ) {
            continue;
          }

          const day = shiftDate.getDate();
          const cash = Number(shift.cash_advance || 0);
          const overShort = Number(shift.balance_check || 0);
          const current = grouped.get(day) ?? { cashAdvance: 0, overShort: 0 };
          current.cashAdvance += cash;
          current.overShort += overShort;
          grouped.set(day, current);
        }

        const titleDayCell = sheet.getCell(titleRow, baseCol + 1);
        titleDayCell.value = "DAY";
        titleDayCell.font = { bold: true };
        titleDayCell.alignment = { horizontal: "center", vertical: "middle" };
        titleDayCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEDE6C9" },
        };
        setBorder(titleDayCell);

        sheet.mergeCells(titleRow, baseCol + 2, titleRow, baseCol + 3);
        const titleNameCell = sheet.getCell(titleRow, baseCol + 2);
        titleNameCell.value = record.user.username.toUpperCase();
        titleNameCell.font = { bold: true };
        titleNameCell.alignment = { horizontal: "center", vertical: "middle" };
        titleNameCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFF00" },
        };
        setBorder(titleNameCell);
        setBorder(sheet.getCell(titleRow, baseCol + 3));

        const dayDateHeader = sheet.getCell(subHeaderRow, baseCol + 1);
        dayDateHeader.value = "DATE";
        dayDateHeader.font = { bold: true };
        dayDateHeader.alignment = { horizontal: "center", vertical: "middle" };
        dayDateHeader.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFEDE6C9" },
        };
        setBorder(dayDateHeader);

        const cashHeader = sheet.getCell(subHeaderRow, baseCol + 2);
        cashHeader.value = "CASH ADVANCE";
        cashHeader.font = { bold: true };
        cashHeader.alignment = { horizontal: "center", vertical: "middle" };
        cashHeader.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE4B3B3" },
        };
        setBorder(cashHeader);

        const overHeader = sheet.getCell(subHeaderRow, baseCol + 3);
        overHeader.value = "OVER/SHORT";
        overHeader.font = { bold: true };
        overHeader.alignment = { horizontal: "center", vertical: "middle" };
        overHeader.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF9EC0DF" },
        };
        setBorder(overHeader);

        let totalCashAdvance = 0;
        let totalOverShort = 0;

        for (let dayNo = 1; dayNo <= daysInMonth; dayNo += 1) {
          const rowNo = dataStartRow + (dayNo - 1);
          const date = new Date(year, monthIndex, dayNo);
          const dayShort = new Intl.DateTimeFormat("en-US", { weekday: "short" })
            .format(date)
            .toUpperCase();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const values = grouped.get(dayNo) ?? { cashAdvance: 0, overShort: 0 };

          totalCashAdvance += values.cashAdvance;
          totalOverShort += values.overShort;

          const dayCell = sheet.getCell(rowNo, baseCol);
          dayCell.value = dayShort;
          dayCell.alignment = { horizontal: "left", vertical: "middle" };
          dayCell.font = { bold: true };
          dayCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isWeekend ? "FFF2EEDC" : "FFF7F2DE" },
          };
          setBorder(dayCell);

          const dateCell = sheet.getCell(rowNo, baseCol + 1);
          dateCell.value = dayNo;
          dateCell.alignment = { horizontal: "right", vertical: "middle" };
          dateCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: isWeekend ? "FFF2EEDC" : "FFF7F2DE" },
          };
          setBorder(dateCell);

          const cashCell = sheet.getCell(rowNo, baseCol + 2);
          cashCell.value = values.cashAdvance === 0 ? "" : -values.cashAdvance;
          cashCell.numFmt = "#,##0.00";
          cashCell.alignment = { horizontal: "right", vertical: "middle" };
          if (values.cashAdvance > 0) {
            cashCell.font = { color: { argb: "FFD92D20" } };
          }else if (values.cashAdvance < 0) {
            cashCell.font = { color: { argb: "FF2F9B52" } };
            }
          setBorder(cashCell);

          const overCell = sheet.getCell(rowNo, baseCol + 3);
          overCell.value = values.overShort === 0 ? "" : values.overShort;
          overCell.numFmt = "#,##0.00";
          overCell.alignment = { horizontal: "right", vertical: "middle" };
          if (values.overShort < 0) {
            overCell.font = { color: { argb: "FFD92D20" } };
          }else if (values.overShort > 0) {
            overCell.font = { color: { argb: "FF2F9B52" } };
            }
          setBorder(overCell);
        }

        const sumMonthCell = sheet.getCell(summaryStartRow, baseCol + 2);
        sumMonthCell.value = month;
        sumMonthCell.font = { bold: true };
        sumMonthCell.alignment = { horizontal: "center", vertical: "middle" };
        setBorder(sumMonthCell);

        const sumNameCell = sheet.getCell(summaryStartRow, baseCol + 3);
        sumNameCell.value = record.user.username.toUpperCase();
        sumNameCell.font = { bold: true };
        sumNameCell.alignment = { horizontal: "center", vertical: "middle" };
        setBorder(sumNameCell);

        const summaryRows = [
          { label: "OVER/SHORT", value: totalOverShort, color: "FF9EC0DF" },
          { label: "CASH ADVANCE", value: -totalCashAdvance, color: "FFE4B3B3" },
          { label: "TOTAL", value: totalOverShort - totalCashAdvance, color: "FFFFFFFF" },
        ];

        summaryRows.forEach((item, idx) => {
          const rowNo = summaryStartRow + 1 + idx;
          const labelCell = sheet.getCell(rowNo, baseCol + 2);
          const valueCell = sheet.getCell(rowNo, baseCol + 3);
          labelCell.value = item.label;
          valueCell.value = item.value;
          valueCell.numFmt = "#,##0.00";

          labelCell.font = { bold: true };
          valueCell.font = { bold: true };

          labelCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: item.color },
          };
          valueCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: item.color },
          };

          labelCell.alignment = { horizontal: "left", vertical: "middle" };
          valueCell.alignment = { horizontal: "right", vertical: "middle" };

          if (item.value < 0) {
            valueCell.font = {
              bold: true,
              color: { argb: "FFD92D20" },
            };
          }

          setBorder(labelCell);
          setBorder(valueCell);
        });

        sheet.getColumn(baseCol).width = 8;
        sheet.getColumn(baseCol + 1).width = 7;
        sheet.getColumn(baseCol + 2).width = 13;
        sheet.getColumn(baseCol + 3).width = 13;
        sheet.getColumn(baseCol + 4).width = 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `employee-monthly-layout-${month}.xlsx`,
      );
    } finally {
      setExporting(false);
    }
  };

  const handleExportMonthlyPdf = () => {
  if (filteredRecords.length === 0) return window.alert("No data.");
  const doc = new jsPDF({ orientation: "portrait" });
  
  const monthDate = new Date(`${month}-01T00:00:00`);
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  filteredRecords.forEach((record, index) => {
    if (index > 0) doc.addPage();

    const grouped = new Map<number, { cash: number; overShort: number }>();
    (record.user.shifts ?? []).forEach(s => {
      const d = new Date(s.startTime);
      if (d.getFullYear() === year && d.getMonth() === monthIndex) {
        const day = d.getDate();
        const curr = grouped.get(day) ?? { cash: 0, overShort: 0 };
        curr.cash += Number(s.cash_advance || 0);
        curr.overShort += Number(s.balance_check || 0);
        grouped.set(day, curr);
      }
    });

    doc.setFontSize(14);
    doc.text(`${month.toUpperCase()} - ${record.user.username.toUpperCase()}`, 14, 15);

    let totalCash = 0; let totalOverShort = 0;
    const body = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNo = i + 1;
      const dObj = new Date(year, monthIndex, dayNo);
      const val = grouped.get(dayNo) ?? { cash: 0, overShort: 0 };
      totalCash += val.cash; totalOverShort += val.overShort;

      return [
        dObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayNo,
        val.cash === 0 ? "" : formatCurrency(-val.cash),
        val.overShort === 0 ? "" : formatCurrency(val.overShort)
      ];
    });

    autoTable(doc, {
      startY: 20,
      head: [["DAY", "DATE", "CASH ADVANCE", "OVER/SHORT"]],
      body: body,
      headStyles: { fillColor: [188, 116, 100], halign: 'center' },
      styles: { fontSize: 8, lineWidth: 0.1 },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const dayNo = data.row.index + 1;
          const dObj = new Date(year, monthIndex, dayNo);
          const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;
          const val = grouped.get(dayNo) ?? { cash: 0, overShort: 0 };

          if (isWeekend && data.column.index <= 1) {
            data.cell.styles.fillColor = [242, 238, 220];
            if (data.column.index === 0) data.cell.styles.textColor = [189, 106, 83];
          }
          // สีตัวเลข Cash Advance
          if (data.column.index === 2 && val.cash > 0) data.cell.styles.textColor = [217, 45, 32];
          // สีตัวเลข Over/Short
          if (data.column.index === 3) {
            if (val.overShort < 0) data.cell.styles.textColor = [217, 45, 32];
            else if (val.overShort > 0) data.cell.styles.textColor = [47, 155, 82];
          }
        }
      }
    });

    // Summary Table
    const finalY = (doc as any).lastAutoTable.finalY;
    autoTable(doc, {
      startY: finalY + 5,
      margin: { left: 14, right: 150 },
      body: [
        ["OVER/SHORT", formatCurrency(totalOverShort)],
        ["CASH ADVANCE", formatCurrency(-totalCash)],
        ["TOTAL", formatCurrency(totalOverShort - totalCash)]
      ],
      styles: { fontSize: 10, fontStyle: 'bold', lineWidth: 0.1 },
      didParseCell: (data) => {
        const colors = [[158, 192, 223], [228, 179, 179], [255, 255, 255]];
        data.cell.styles.fillColor = colors[data.row.index] as [number, number, number];
        if (data.column.index === 1) {
          data.cell.styles.halign = 'right';
          const val = data.row.index === 0 ? totalOverShort : (data.row.index === 1 ? -totalCash : totalOverShort - totalCash);
          if (val < 0) data.cell.styles.textColor = [217, 45, 32];
        }
      }
    });
  });

  doc.save(`Monthly-Report-${month}.pdf`);
};


  return (
    <section className="employee-report">
      <header className="employee-report__header">
        <div>
          <p className="employee-report__eyebrow">Employee Report</p>
          <h2 className="employee-report__title">
            Performance summary by employee
          </h2>
          <p className="employee-report__subtitle">
            Review monthly balance checks, cash advances, and shift details from
            the reports API.
          </p>
        </div>

        <label className="employee-report__month-filter">
          <span>Report Month</span>
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </label>
      </header>

      <div className="employee-report__summary-grid">
        <article className="employee-report__summary-card">
          <span className="employee-report__summary-label">Employees</span>
          <strong>{summary.totalEmployees}</strong>
        </article>
        <article className="employee-report__summary-card">
          <span className="employee-report__summary-label">
            Total Balance Check
          </span>
          <strong>{formatCurrency(summary.totalBalanceCheck)}</strong>
        </article>
        <article className="employee-report__summary-card">
          <span className="employee-report__summary-label">
            Total Cash Advance
          </span>
          <strong>{formatCurrency(summary.totalCashAdvance)}</strong>
        </article>
        <article className="employee-report__summary-card employee-report__summary-card--accent">
          <span className="employee-report__summary-label">Net</span>
          <strong>{formatCurrency(summary.net)}</strong>
        </article>
      </div>

      <div className="employee-report__layout">
        <div className="employee-report__panel">
          <div className="employee-report__panel-header">
            <h3>Monthly records</h3>
            <div className="employee-report__panel-actions">
              <label className="employee-report__search">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search employee or email"
                  aria-label="Search employee"
                />
              </label>
              <div className="employee-report__export-group">
                <button
                  type="button"
                  className="employee-report__export-btn"
                  onClick={handleExportMonthlyExcel}
                  disabled={loading || filteredRecords.length === 0 || exporting}
                >
                  Monthly XLSX
                </button>
                <button
                  type="button"
                  className="employee-report__export-btn"
                  onClick={handleExportMonthlyPdf}
                  disabled={loading || filteredRecords.length === 0 || exporting}
                >
                  Monthly PDF
                </button>
              </div>
              <button
                type="button"
                className="employee-report__refresh-btn"
                onClick={handleRefresh}
                disabled={loading || exporting}
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="employee-report__state">Loading report data...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="employee-report__state">
              {records.length === 0
                ? "No employee performance data found for this month."
                : "No matching employee found."}
            </div>
          ) : (
            <div className="employee-report__table-wrap">
              <div className="employee-report__grid-table" role="table" aria-label="Employee monthly records">

                {filteredRecords.map((record) => (
                  <EmployeeRecordCard
                    key={record.id}
                    record={record}
                    syncingId={syncingId}
                    isExpanded={expandedRecord}
                    dailySheet={buildDailySheet(record)}
                    onToggleDetail={handleToggleRecordDetail}
                    onSync={handleSync}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
