import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import RiskBadge from "../components/RiskBadge";

const INR = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function HistoryPage() {
  const [records,  setRecords]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [risk,     setRisk]     = useState("All");

  useEffect(() => {
    api.get("/api/history")
      .then(r => { setRecords(r.data.data); setFiltered(r.data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let d = records;
    if (search) d = d.filter(r => r.project_name.toLowerCase().includes(search.toLowerCase()));
    if (risk !== "All") d = d.filter(r => r.risk_level === risk);
    setFiltered(d);
  }, [search, risk, records]);

  if (loading) return <div className="page-loading"><div className="spinner" />Loading history…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">PR History</h1>
          <p className="page-sub">{records.length} total analyses saved</p>
        </div>
        <Link to="/analyse" className="btn-primary">＋ New Analysis</Link>
      </div>

      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Search project name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="chip-group">
          {["All","Low","Medium","High","Critical"].map(l => (
            <button key={l} className={`chip ${risk === l ? "chip-active" : ""}`} onClick={() => setRisk(l)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="section-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🔍</p>
            <p className="empty-title">No results found</p>
            <p className="empty-sub">Try a different search or filter</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Budget</th>
                  <th>PR Value</th>
                  <th>Remaining</th>
                  <th>Win %</th>
                  <th>Risk</th>
                  <th>Effort</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i}>
                    <td className="td-bold">{r.project_name}</td>
                    <td><span className={`client-tag ${r.client_type === "Repeat" ? "tag-repeat" : "tag-new"}`}>{r.client_type}</span></td>
                    <td>{INR(r.project_budget)}</td>
                    <td>{INR(r.new_pr_value)}</td>
                    <td className={r.is_overrun ? "text-danger" : ""}>{INR(r.remaining_budget)}</td>
                    <td>{(r.historical_win_probability * 100).toFixed(0)}%</td>
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
