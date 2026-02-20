import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import AnalysePage from "./pages/AnalysePage";
import HistoryPage from "./pages/HistoryPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="app-content">
          <Routes>
            <Route path="/"         element={<DashboardPage />} />
            <Route path="/analyse"  element={<AnalysePage />} />
            <Route path="/history"  element={<HistoryPage />} />
            <Route path="*"         element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="app-footer">
          Vakharia Airtech · Internal Procurement Tool · v2.0
        </footer>
      </div>
    </BrowserRouter>
  );
}
