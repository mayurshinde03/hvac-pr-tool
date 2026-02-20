import React from "react";

const INR = (v) => v ? `₹${Number(v).toLocaleString("en-IN")}` : "";

export default function PRForm({ form, onChange, onSubmit, loading, error }) {
  const budget = parseFloat(form.project_budget) || 0;
  const spent  = parseFloat(form.spent_till_date) || 0;
  const pr     = parseFloat(form.new_pr_value) || 0;
  const usedPct    = budget ? Math.min((spent / budget) * 100, 100) : 0;
  const afterPct   = budget ? Math.min(((spent + pr) / budget) * 100, 100) : 0;
  const isOverrun  = budget && (spent + pr) > budget;

  return (
    <div className="form-card">
      <form onSubmit={onSubmit} className="pr-form">

        {/* Project Info */}
        <div className="form-section">
          <p className="form-section-label">Project Information</p>
          <div className="form-row-2">
            <div className="form-group span-2">
              <label>Project Name</label>
              <input name="project_name" value={form.project_name} onChange={onChange} placeholder="e.g. Hospital OT HVAC" required />
            </div>
            <div className="form-group">
              <label>Client Type</label>
              <select name="client_type" value={form.client_type} onChange={onChange}>
                <option value="Repeat">Repeat Client</option>
                <option value="New">New Client</option>
              </select>
            </div>
            <div className="form-group">
              <label>Win Probability</label>
              <div className="input-addon-wrap">
                <input name="historical_win_probability" type="number" min="0" max="1" step="0.01" value={form.historical_win_probability} onChange={onChange} required />
                <span className="input-addon">{(form.historical_win_probability * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financials */}
        <div className="form-section">
          <p className="form-section-label">Financial Details</p>
          <div className="form-row-2">
            <div className="form-group">
              <label>Project Size (₹)</label>
              <input name="project_size" type="number" value={form.project_size} onChange={onChange} placeholder="75,00,000" required />
              {form.project_size && <small className="form-hint">{INR(form.project_size)}</small>}
            </div>
            <div className="form-group">
              <label>Project Budget (₹)</label>
              <input name="project_budget" type="number" value={form.project_budget} onChange={onChange} placeholder="50,00,000" required />
              {form.project_budget && <small className="form-hint">{INR(form.project_budget)}</small>}
            </div>
            <div className="form-group">
              <label>Spent Till Date (₹)</label>
              <input name="spent_till_date" type="number" value={form.spent_till_date} onChange={onChange} placeholder="32,00,000" required />
              {form.spent_till_date && <small className="form-hint">{INR(form.spent_till_date)}</small>}
            </div>
            <div className="form-group">
              <label>New PR Value (₹)</label>
              <input name="new_pr_value" type="number" value={form.new_pr_value} onChange={onChange} placeholder="12,00,000" required />
              {form.new_pr_value && <small className="form-hint">{INR(form.new_pr_value)}</small>}
            </div>
          </div>
        </div>

        {/* Budget Preview */}
        {budget > 0 && (
          <div className="form-section">
            <p className="form-section-label">Live Budget Preview</p>
            <div className="budget-bar-track">
              <div className="budget-bar-used"  style={{ width: `${usedPct}%` }} />
              <div className={`budget-bar-pr ${isOverrun ? "overrun" : ""}`} style={{ width: `${Math.max(afterPct - usedPct, 0)}%` }} />
            </div>
            <div className="budget-bar-labels">
              <span>Spent: {usedPct.toFixed(1)}%</span>
              <span className={isOverrun ? "text-danger" : "text-warning"}>After PR: {((spent + pr) / budget * 100).toFixed(1)}%</span>
              <span className={isOverrun ? "text-danger" : "text-success"}>
                {isOverrun ? `⚠ Overrun by ${INR((spent + pr) - budget)}` : `Available: ${INR(budget - spent - pr)}`}
              </span>
            </div>
          </div>
        )}

        {error && <div className="error-box">⚠️ {error}</div>}

        <div className="form-footer">
          <button type="submit" className="btn-primary btn-lg" disabled={loading}>
            {loading ? <><span className="spinner-sm" /> Analysing…</> : "🔍 Analyse PR"}
          </button>
        </div>
      </form>
    </div>
  );
}
