import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="nav-brand">
          <span className="nav-logo">🌬️</span>
          <div>
            <p className="nav-title">HVAC PR Analyser</p>
            <p className="nav-sub">Vakharia Airtech</p>
          </div>
        </div>

        <div className={`nav-links ${open ? "open" : ""}`}>
          <NavLink to="/"        end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={() => setOpen(false)}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/analyse"    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={() => setOpen(false)}>
            <span>🔍</span> Analyse PR
          </NavLink>
          <NavLink to="/history"    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={() => setOpen(false)}>
            <span>📋</span> History
          </NavLink>
        </div>

        <button className="nav-hamburger" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
}
