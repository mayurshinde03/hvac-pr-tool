import React from "react";
import RiskBadge from "./RiskBadge";

const INR = (v) => `₹${Number(v).toLocaleString("en-IN")}`;
const PCT = (v) => `${v}%`;

const EFFORT_COLOR = {
  "Fast-track – high probability client": "#276749",
  "Full design effort":                  "#2b6cb0",
  "Concept-level BOQ only":              "#b7791f",
  "Minimal effort – low expected value": "#c53030",
};

export default function PRSummary({ result, onReset }) {
  const effortColor = EFFORT_COLOR[result.effort_level] || "#4a5568";

  const handlePrint = () => window.print();

  return (
    <div className="summary-wrapper">
      {/* Director Summary Card */}
      <div className="card director-card" id="print-area">
        <div className="director-header">
          <div>
            <p className="director-label">Director Review Summary</p>
            <h2 className="director-project">{result.project_name}</h2>
            <p className="director-meta">Generated: {result.generated_at} · Client: {result.client_type}</p>
          </div>
          <RiskBadge level={result.risk_level} score={result.risk_score} />
        </div>

        {/* Key Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard label="Project Size"           value={INR(result.project_size)}             />
          <MetricCard label="Project Budget"         value={INR(result.project_budget)}           />
          <MetricCard label="Spent Till Date"        value={INR(result.spent_till_date)}          sub={`${result.budget_utilization_before}% utilization`} />
          <MetricCard label="New PR Value"           value={INR(result.new_pr_value)}             />
          <MetricCard
            label="Remaining Budget"
            value={INR(result.remaining_budget)}
            highlight={result.is_overrun ? "danger" : result.budget_utilization_after > 85 ? "warn" : "safe"}
          />
          <MetricCard label="Expected Project Value" value={INR(result.expected_value)}          sub={`${(result.historical_win_probability * 100).toFixed(0)}% win probability`} />
        </div>

        {/* Budget bar */}
        <div className="summary-bar-section">
          <div className="bar-track large">
            <div className="bar-used" style={{ width: `${Math.min(result.budget_utilization_before, 100)}%` }} />
            <div
              className={`bar-pr ${result.is_overrun ? "bar-overrun" : ""}`}
              style={{
                width: `${Math.min(result.budget_utilization_after - result.budget_utilization_before, 100 - result.budget_utilization_before)}%`,
                left: `${Math.min(result.budget_utilization_before, 100)}%`,
              }}
            />
          </div>
          <div className="bar-legend">
            <span>Before PR: {result.budget_utilization_before}%</span>
            <span style={{ color: result.is_overrun ? "#e53e3e" : "#d69e2e" }}>
              After PR: {result.budget_utilization_after}%
            </span>
          </div>
        </div>

        {/* Overrun alert */}
        {result.is_overrun && (
          <div className="alert-banner danger">
            🚨 Budget Overrun: This PR exceeds available budget by {INR(result.overrun_amount)}. Director approval mandatory.
          </div>
        )}

        {/* Effort level */}
        <div className="effort-box" style={{ borderColor: effortColor }}>
          <p className="effort-label">Recommended Effort Level</p>
          <p className="effort-value" style={{ color: effortColor }}>{result.effort_level}</p>
        </div>

        {/* AI Recommendation */}
        <div className="ai-box">
          <p className="ai-label">🤖 AI Recommendation</p>
          <p className="ai-text">{result.ai_recommendation}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-row">
        <button className="btn-secondary" onClick={handlePrint}>🖨️ Print / Save PDF</button>
        <button className="btn-primary"   onClick={onReset}>← Analyse Another PR</button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, highlight }) {
  const colors = { danger: "#fff5f5", warn: "#fffaf0", safe: "#f0fff4" };
  return (
    <div className="metric-card" style={{ background: highlight ? colors[highlight] : undefined }}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      {sub && <p className="metric-sub">{sub}</p>}
    </div>
  );
}
