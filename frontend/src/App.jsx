import React, { useState } from "react";
import PRForm from "./components/PRForm";
import PRSummary from "./components/PRSummary";
import axios from "axios";

const INITIAL = {
  project_name: "Hospital OT HVAC",
  client_type: "Repeat",
  project_size: 7500000,
  project_budget: 5000000,
  spent_till_date: 3200000,
  new_pr_value: 1200000,
  historical_win_probability: 0.72,
};

// ✅ Reads from env variable in production, falls back to empty string (proxy) in dev
const BASE_URL = process.env.REACT_APP_API_URL || "";

export default function App() {
  const [form, setForm] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "client_type" ? value : parseFloat(value) || value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${BASE_URL}/api/analyze-pr`, form); // ✅ Updated
      if (data.success) setResult(data.data);
    } catch (err) {
      setError("Server error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setResult(null); setForm(INITIAL); };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-inner">
          <span className="header-logo">🌬️</span>
          <div>
            <h1>HVAC Procurement Risk Analyser</h1>
            <p>AI-assisted Purchase Request evaluation for project directors</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {!result ? (
          <PRForm form={form} onChange={handleChange} onSubmit={handleSubmit} loading={loading} error={error} />
        ) : (
          <PRSummary result={result} onReset={handleReset} />
        )}
      </main>

      <footer className="app-footer">
        Vakharia Airtech · Internal Tool · v1.0
      </footer>
    </div>
  );
}
