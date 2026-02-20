import React, { useState } from "react";
import PRForm from "../components/PRForm";
import PRSummary from "../components/PRSummary";
import api from "../api";

const INITIAL = {
  project_name: "",
  client_type: "Repeat",
  project_size: "",
  project_budget: "",
  spent_till_date: "",
  new_pr_value: "",
  historical_win_probability: 0.72,
};

export default function AnalysePage() {
  const [form, setForm]       = useState(INITIAL);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === "client_type" ? value : parseFloat(value) || value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/api/analyze-pr", form);
      if (data.success) setResult(data.data);
      else setError(data.error || "Analysis failed.");
    } catch (err) {
      setError("Cannot reach server. Check backend status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{result ? "Analysis Result" : "New PR Analysis"}</h1>
          <p className="page-sub">{result ? `Report for ${result.project_name}` : "Evaluate a purchase request against project budget and risk"}</p>
        </div>
        {result && <button className="btn-outline" onClick={() => { setResult(null); setForm(INITIAL); }}>← New Analysis</button>}
      </div>

      {!result
        ? <PRForm form={form} onChange={handleChange} onSubmit={handleSubmit} loading={loading} error={error} />
        : <PRSummary result={result} onReset={() => { setResult(null); setForm(INITIAL); }} />
      }
    </div>
  );
}
