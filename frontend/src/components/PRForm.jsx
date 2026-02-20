import React from "react";

const INR = (v) => `₹${Number(v).toLocaleString("en-IN")}`;

export default function PRForm({ form, onChange, onSubmit, loading, error }) {
  return (
    <div className="card form-card">
      <h2 className="section-title">📋 New Purchase Request</h2>

      <form onSubmit={onSubmit} className="pr-form">
        {/* Row 1 */}
        <div className="form-row">
          <div className="form-group full-width">
            <label>Project Name</label>
            <input name="project_name" value={form.project_name} onChange={onChange} required />
          </div>
        </div>

        {/* Row 2 */}
        <div className="form-row">
          <div className="form-group">
            <label>Client Type</label>
            <select name="client_type" value={form.client_type} onChange={onChange}>
              <option value="Repeat">Repeat</option>
              <option value="New">New</option>
            </select>
          </div>
          <div className="form-group">
            <label>Historical Win Probability</label>
            <div className="input-hint-wrap">
              <input
                name="historical_win_probability"
                type="number" min="0" max="1" step="0.01"
                value={form.historical_win_probability}
                onChange={onChange} required
              />
              <span className="input-hint">{(form.historical_win_probability * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="form-row">
          <div className="form-group">
            <label>Project Size (₹)</label>
            <input name="project_size" type="number" value={form.project_size} onChange={onChange} required />
            <small>{INR(form.project_size)}</small>
          </div>
          <div className="form-group">
            <label>Project Budget (₹)</label>
            <input name="project_budget" type="number" value={form.project_budget} onChange={onChange} required />
            <small>{INR(form.project_budget)}</small>
          </div>
        </div>

        {/* Row 4 */}
        <div className="form-row">
          <div className="form-group">
            <label>Spent Till Date (₹)</label>
            <input name="spent_till_date" type="number" value={form.spent_till_date} onChange={onChange} required />
            <small>{INR(form.spent_till_date)}</small>
          </div>
          <div className="form-group">
            <label>New PR Value (₹)</label>
            <input name="new_pr_value" type="number" value={form.new_pr_value} onChange={onChange} required />
            <small>{INR(form.new_pr_value)}</small>
          </div>
        </div>

        {/* Budget bar preview */}
        <BudgetPreview form={form} />

        {error && <div className="error-banner">⚠️ {error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Analysing…" : "🔍 Analyse PR"}
        </button>
      </form>
    </div>
  );
}

function BudgetPreview({ form }) {
  const used = ((form.spent_till_date / form.project_budget) * 100).toFixed(1);
  const afterPR = (((form.spent_till_date + form.new_pr_value) / form.project_budget) * 100).toFixed(1);
  const overrun = afterPR > 100;

  return (
    <div className="budget-preview">
      <p className="preview-label">Live Budget Preview</p>
      <div className="bar-track">
        <div className="bar-used" style={{ width: `${Math.min(used, 100)}%` }} />
        <div
          className={`bar-pr ${overrun ? "bar-overrun" : ""}`}
          style={{ width: `${Math.min(afterPR - used, 100 - used)}%`, left: `${Math.min(used, 100)}%` }}
        />
      </div>
      <div className="bar-legend">
        <span>Spent: {used}%</span>
        <span style={{ color: overrun ? "#e53e3e" : "#38a169" }}>After PR: {afterPR}%</span>
      </div>
    </div>
  );
}
