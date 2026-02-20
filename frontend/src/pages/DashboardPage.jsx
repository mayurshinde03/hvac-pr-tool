import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import RiskBadge from "../components/RiskBadge";

const INR = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function DashboardPage() {
  const [stats, setStats]   = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/api/stats"), api.get("/api/history")])
      .then(([s, h]) => {
        setStats(s.data.data);
        setRecent(h.data.data.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" />Loading dashboard…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Overview of all purchase request analyses</p>
        </div>
        <Link to="/analyse" className="btn-primary">＋ New PR Analysis</Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="📁" label="Total Analyses"  value={stats?.total    || 0} color="blue"   />
        <StatCard icon="🔴" label="Critical Risk"   value={stats?.critical || 0} color="purple" />
        <StatCard icon="🟠" label="High Risk"       value={stats?.high     || 0} color="orange" />
        <StatCard icon="⚠️" label="Budget Overruns" value={stats?.overruns || 0} color="red"    />
      </div>

      {/* Recent table */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Recent Analyses</h2>
          <Link to="/history" className="btn-link">View all →</Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>PR Value</th>
                  <th>Remaining</th>
                  <th>Risk</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i}>
                    <td className="td-bold">{r.project_name}</td>
                    <td><span className={`client-tag ${r.client_type === "Repeat" ? "tag-repeat" : "tag-new"}`}>{r.client_type}</span></td>
                    <td>{INR(r.new_pr_value)}</td>
                    <td className={r.is_overrun ? "text-danger" : "text-success"}>{INR(r.remaining_budget)}</td>
                    <td><RiskBadge level={r.risk_level} /></td>
                    <td className="td-effort">{r.effort_level}</td>
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

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <p className="empty-icon">📋</p>
      <p className="empty-title">No analyses yet</p>
      <p className="empty-sub">Run your first PR analysis to see data here.</p>
      <Link to="/analyse" className="btn-primary">Analyse a PR</Link>
    </div>
  );
}
