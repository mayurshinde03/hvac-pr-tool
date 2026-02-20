import React from "react";

const CONFIG = {
  Low:      { color: "#38a169", bg: "#f0fff4", icon: "🟢" },
  Medium:   { color: "#d69e2e", bg: "#fffff0", icon: "🟡" },
  High:     { color: "#dd6b20", bg: "#fffaf0", icon: "🟠" },
  Critical: { color: "#e53e3e", bg: "#fff5f5", icon: "🔴" },
};

export default function RiskBadge({ level, score }) {
  const { color, bg, icon } = CONFIG[level] || CONFIG.Medium;
  return (
    <span
      className="risk-badge"
      style={{ color, background: bg, border: `1.5px solid ${color}` }}
    >
      {icon} {level} <span className="risk-score">({score}/90)</span>
    </span>
  );
}
