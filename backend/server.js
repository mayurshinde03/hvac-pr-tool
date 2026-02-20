require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const PRAnalysis = require("./models/PRAnalysis");

const app = express();

// ✅ Updated CORS — allows both local and Render frontend
app.use(cors({
  origin: [
    "http://localhost:3000",
    /\.onrender\.com$/,          // covers any onrender.com subdomain
  ],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());


// ─── MongoDB Connection ────────────────────────────────────────────────────────

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ─── Risk Scoring Engine ───────────────────────────────────────────────────────

function calculateRiskScore({ project_budget, spent_till_date, new_pr_value, client_type, historical_win_probability, project_size }) {
  let score = 0;

  const utilization = (spent_till_date + new_pr_value) / project_budget;
  if (utilization >= 1.0)       score += 40;
  else if (utilization >= 0.85) score += 30;
  else if (utilization >= 0.70) score += 20;
  else                          score += 10;

  if (client_type === "New") score += 15;

  if (historical_win_probability < 0.40)      score += 25;
  else if (historical_win_probability < 0.60) score += 15;
  else if (historical_win_probability < 0.75) score += 5;

  const prRatio = new_pr_value / project_size;
  if (prRatio > 0.30)      score += 10;
  else if (prRatio > 0.15) score += 5;

  return score;
}

function getRiskLevel(score) {
  if (score >= 70) return "Critical";
  if (score >= 50) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

function getRecommendation(data, remainingBudget) {
  const { client_type, historical_win_probability, project_budget, spent_till_date, new_pr_value } = data;
  const utilizationAfterPR = (spent_till_date + new_pr_value) / project_budget;
  const winPct = (historical_win_probability * 100).toFixed(0);

  if (remainingBudget < 0) {
    return {
      effort: "Minimal effort – low expected value",
      message: `⚠️ PR exceeds available budget by ₹${Math.abs(remainingBudget).toLocaleString("en-IN")}. Immediate director approval required before any procurement. Consider phasing or scope revision.`,
    };
  }

  if (historical_win_probability >= 0.75 && client_type === "Repeat") {
    return {
      effort: "Fast-track – high probability client",
      message: `✅ Proceed immediately. Repeat client with ${winPct}% historical conversion. Budget is healthy. Prioritize delivery timeline and skip intermediate approvals.`,
    };
  }

  if (historical_win_probability >= 0.60 && utilizationAfterPR < 0.85) {
    return {
      effort: "Full design effort",
      message: `✅ Proceed with detailed BOQ. ${client_type} client with ${winPct}% historical conversion. Budget utilization stays within safe range after this PR.`,
    };
  }

  if (historical_win_probability < 0.45) {
    return {
      effort: "Minimal effort – low expected value",
      message: `🔴 Win probability is only ${winPct}%. Limit effort to a high-level estimate. Re-evaluate when client engagement improves.`,
    };
  }

  if (utilizationAfterPR >= 0.85) {
    return {
      effort: "Concept-level BOQ only",
      message: `🟡 Budget utilization after PR will reach ${(utilizationAfterPR * 100).toFixed(1)}%. Proceed with concept-level BOQ only. Seek director sign-off before full commitment.`,
    };
  }

  return {
    effort: "Concept-level BOQ only",
    message: `🟡 Moderate risk detected. Prepare concept-level design and confirm client intent before committing full procurement resources.`,
  };
}

// ─── POST: Analyse PR + Save to MongoDB ───────────────────────────────────────

app.post("/api/analyze-pr", async (req, res) => {
  try {
    const data = req.body;
    const {
      project_name, project_budget, spent_till_date,
      new_pr_value, historical_win_probability,
      project_size, client_type,
    } = data;

    const remainingBudget   = project_budget - spent_till_date - new_pr_value;
    const utilizationBefore = ((spent_till_date / project_budget) * 100).toFixed(1);
    const utilizationAfter  = (((spent_till_date + new_pr_value) / project_budget) * 100).toFixed(1);
    const expectedValue     = project_size * historical_win_probability;
    const riskScore         = calculateRiskScore(data);
    const riskLevel         = getRiskLevel(riskScore);
    const recommendation    = getRecommendation(data, remainingBudget);

    const result = {
      project_name,
      client_type,
      project_size,
      project_budget,
      spent_till_date,
      new_pr_value,
      historical_win_probability,
      remaining_budget:           remainingBudget,
      budget_utilization_before:  parseFloat(utilizationBefore),
      budget_utilization_after:   parseFloat(utilizationAfter),
      expected_value:             expectedValue,
      risk_score:                 riskScore,
      risk_level:                 riskLevel,
      is_overrun:                 remainingBudget < 0,
      overrun_amount:             remainingBudget < 0 ? Math.abs(remainingBudget) : 0,
      effort_level:               recommendation.effort,
      ai_recommendation:          recommendation.message,
      generated_at:               new Date(), // ✅ Fixed — was toLocaleString()
    };

    const saved = new PRAnalysis(result);
    await saved.save();
    console.log(`💾 Saved PR: ${project_name} | Risk: ${riskLevel}`);

    // Send formatted date to frontend
    res.json({
      success: true,
      data: {
        ...result,
        generated_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      },
    });
  } catch (err) {
    console.error("❌ Analyse PR error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET: Fetch PR History ─────────────────────────────────────────────────────

app.get("/api/history", async (req, res) => {
  try {
    const records = await PRAnalysis.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: records.length, data: records });
  } catch (err) {
    console.error("❌ History fetch error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET: Stats Summary ────────────────────────────────────────────────────────

app.get("/api/stats", async (req, res) => {
  try {
    const total    = await PRAnalysis.countDocuments();
    const critical = await PRAnalysis.countDocuments({ risk_level: "Critical" });
    const high     = await PRAnalysis.countDocuments({ risk_level: "High" });
    const overruns = await PRAnalysis.countDocuments({ is_overrun: true });

    res.json({ success: true, data: { total, critical, high, overruns } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET: Health Check ─────────────────────────────────────────────────────────

app.get("/health", (_, res) =>
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
);

// ─── Start Server ──────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ HVAC PR Server running on http://localhost:${PORT}`));
