import { useState } from "react";
import "./Report.css";
import EmployeeReport from "../../components/layout/Report_tap/Employee_Report/Employee_Report";

type TabId = "shift" | "employee" | "exclusive" | "view_all";

const TABS: { id: TabId; label: string }[] = [
  { id: "shift", label: "Report Shift" },
  { id: "employee", label: "Employee Report" },
];

export default function Report() {
  const [activeTab, setActiveTab] = useState<TabId>("shift");

  return (
    <div className="rp-page">
      {/* ===== Header ===== */}
      <div className="rp-header header">
        <div className="h-l">
          <h1 className="TP">Report Management</h1>
          <p className="STP">Manage and view various reports</p>
        </div>
      </div>

      {/* ===== Tab buttons ===== */}
      <div className="rp-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`rp-tab-btn${activeTab === tab.id ? " rp-tab-btn--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Tab content ===== */}
      <div className="rp-content">
        <div style={{ display: activeTab === "shift" ? "block" : "none" }}>
          {/* <CentralRateBase /> */}
        </div>
        <div style={{ display: activeTab === "employee" ? "block" : "none" }}>
          <EmployeeReport />
        </div>
      </div>
    </div>
  );
}
