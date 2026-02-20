import React from "react";
import RiskBadge from "./RiskBadge";

const INR = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

const EFFORT_META = {
  "Fast-track – high probability client": { color: "#059669", bg: "#d1fae5", icon: "⚡" },
  "Full design effort":                   { color: "#2563eb", bg: "#dbeafe", icon: "✅" },
  "Concept-level BOQ only":               { color: "#d97706", bg: "#fef3c7", icon: "📐" },
  "Minimal effort – low expected value":  { color: "#dc2626", bg: "#fee2e2", icon: "⚠️" },
};

export default function PRSummary({ result, onReset }) {
  const em = EFFORT_META[result.effort_level] || EFFORT_META["Concept-level BOQ only"];

  return (
    <div className="summary-wrapper">
      <div className="summary-card" id="print-area">

        {/* Header */}
        <div className="summary-head">
          <div className="summary-head-left">
            <p className="summary-eyebrow">Director Review Summary</p>
            <h2 className="summary-project">{result.project_name}</h2>
            <p className="summary-meta">
              {result.generated_at} &nbsp;·&nbsp;
              <span className={`client-tag ${result.client_type === "Repeat" ? "tag-repeat" : "tag-new"}`}>{result.client_type} Client</span>
            </p>
          </div>
          <RiskBadge level={result.risk_level} score={result.risk_score} />
        </div>

        {/* Overrun Alert */}
        {result.is_overrun && (
          <div className="alert-danger">
            🚨 Budget Overrun — This PR exceeds available budget by <strong>{INR(result.overrun_amount)}</strong>. Director approval mandatory before proceeding.
          </div>
        )}

        {/* Metrics */}
        <div className="metrics-grid">
          <Metric label="Project Size"           value={INR(result.project_size)} />
          <Metric label="Project Budget"         value={INR(result.project_budget)} />
          <Metric label="Spent Till Date"        value={INR(result.spent_till_date)}   sub={`${result.budget_utilization_before}% of budget`} />
          <Metric label="New PR Value"           value={INR(result.new_pr_value)} />
          <Metric label="Remaining Budget"       value={INR(result.remaining_budget)}  highlight={result.is_overrun ? "danger" : result.budget_utilization_after > 85 ? "warn" : "good"} />
          <Metric label="Expected Project Value" value={INR(result.expected_value)}    sub={`${(result.historical_win_probability * 100).toFixed(0)}% win probability`} />
        </div>

        {/* Budget Bar */}
        <div className="summary-bar-section">
          <div className="budget-bar-track large">
            <div className="budget-bar-used" style={{ width: `${Math.min(result.budget_utilization_before, 100)}%` }} />
            <div
              className={`budget-bar-pr ${result.is_overrun ? "overrun" : ""}`}
              style={{ width: `${Math.min(result.budget_utilization_after - result.budget_utilization_before, 100 - result.budget_utilization_before)}%` }}
            />
          </div>
          <div className="budget-bar-labels">
            <span>Before PR: {result.budget_utilization_before}%</span>
            <span className={result.is_overrun ? "text-danger" : "text-warning"}>After PR: {result.budget_utilization_after}%</span>
          </div>
        </div>

        {/* Effort Level */}
        <div className="effort-card" style={{ background: em.bg, borderColor: em.color }}>
          <p className="effort-eyebrow">Recommended Effort Level</p>
          <p className="effort-value" style={{ color: em.color }}>{em.icon} {result.effort_level}</p>
        </div>

        {/* AI Recommendation */}
        <div className="ai-card">
          <p className="ai-label">🤖 AI Recommendation</p>
          <p className="ai-text">{result.ai_recommendation}</p>
        </div>

      </div>

      {/* Actions */}
      <div className="summary-actions">
        <button className="btn-outline" onClick={() => window.print()}>🖨️ Print / Save PDF</button>
        <button className="btn-primary" onClick={onReset}>← New Analysis</button>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, highlight }) {
  const bg = { danger: "#fff5f5", warn: "#fffbeb", good: "#f0fdf4" };
  return (
    <div className="metric-card" style={{ background: highlight ? bg[highlight] : undefined }}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      {sub && <p className="metric-sub">{sub}</p>}
    </div>
  );
}
