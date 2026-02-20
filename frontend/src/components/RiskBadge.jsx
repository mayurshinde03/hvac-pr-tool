import React from "react";

const CONFIG = {
  Low:      { cls: "badge-low",      icon: "●" },
  Medium:   { cls: "badge-medium",   icon: "●" },
  High:     { cls: "badge-high",     icon: "●" },
  Critical: { cls: "badge-critical", icon: "●" },
};

export default function RiskBadge({ level, score }) {
  const { cls, icon } = CONFIG[level] || CONFIG.Medium;
  return (
    <span className={`risk-badge ${cls}`}>
      <span className="badge-dot">{icon}</span>
      {level}
      {score !== undefined && <span className="badge-score">{score}/90</span>}
    </span>
  );
}
