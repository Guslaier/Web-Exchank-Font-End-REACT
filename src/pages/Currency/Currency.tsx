import { useState } from "react";
import "./Currency.css";
import CentralRateBase from "../../components/layout/curentcy_Rate_tap/CentralRateBase/CentralRateBase";
import ExchangeRates from "../../components/layout/curentcy_Rate_tap/ExchangeRates/ExchangeRates";
import ExclusiveCurrency from "../../components/layout/curentcy_Rate_tap/ExclusiveCurrency/ExclusiveCurrency";
import ViewAllRates from "../../components/layout/curentcy_Rate_tap/ViewAllRates/ViewAllRates";

type TabId = "central" | "formula" | "exclusive" | "view_all";

const TABS: { id: TabId; label: string }[] = [
  { id: "central", label: "Central Rate Base" },
  { id: "formula", label: "Formula Rate" },
  { id: "exclusive", label: "Exclusive Currency" },
  { id: "view_all", label: "View All Rates" },
];

export default function Currency() {
  const [activeTab, setActiveTab] = useState<TabId>("central");

  return (
    <div className="cr-page">
      {/* ===== Header ===== */}
      <div className="cr-header header">
        <div className="h-l">
          <h1 className="TP">Currency Management</h1>
          <p className="STP">Manage exchange rates and currency settings</p>
        </div>
      </div>

      {/* ===== Tab buttons ===== */}
      <div className="cr-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`cr-tab-btn${activeTab === tab.id ? " cr-tab-btn--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Tab content ===== */}
      <div className="cr-content">
        <div style={{ display: activeTab === "central" ? "block" : "none" }}>
          <CentralRateBase />
        </div>
        <div style={{ display: activeTab === "formula" ? "block" : "none" }}>
          <ExchangeRates />
        </div>
        <div style={{ display: activeTab === "exclusive" ? "block" : "none" }}>
          <ExclusiveCurrency />
        </div>
        <div style={{ display: activeTab === "view_all" ? "block" : "none" }}>
          <ViewAllRates />
        </div>
      </div>
    </div>
  );
}
