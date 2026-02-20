const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generatePRAnalysis(data) {
  const {
    project_name, client_type, project_budget,
    spent_till_date, new_pr_value, historical_win_probability,
    project_size, remaining_budget, risk_level,
    risk_score, budget_utilization_after, expected_value,
    effort_level, is_overrun,
  } = data;

  const prompt = `
You are an expert HVAC procurement advisor for a construction engineering company.

Analyse this Purchase Request and give a professional recommendation to the director.

PROJECT DETAILS:
- Project Name: ${project_name}
- Client Type: ${client_type}
- Project Size: ₹${Number(project_size).toLocaleString("en-IN")}
- Project Budget: ₹${Number(project_budget).toLocaleString("en-IN")}
- Spent Till Date: ₹${Number(spent_till_date).toLocaleString("en-IN")}
- New PR Value: ₹${Number(new_pr_value).toLocaleString("en-IN")}
- Remaining Budget After PR: ₹${Number(remaining_budget).toLocaleString("en-IN")}
- Budget Utilization After PR: ${budget_utilization_after}%
- Historical Win Probability: ${(historical_win_probability * 100).toFixed(0)}%
- Expected Project Value: ₹${Number(expected_value).toLocaleString("en-IN")}
- Risk Level: ${risk_level} (Score: ${risk_score}/90)
- Budget Overrun: ${is_overrun ? "YES — CRITICAL" : "No"}
- Suggested Effort: ${effort_level}

Respond in this exact JSON format:
{
  "short_recommendation": "One sentence summary for the director (max 20 words)",
  "detailed_analysis": "2-3 sentences explaining risk, budget situation, and procurement advice",
  "action_items": ["action 1", "action 2", "action 3"],
  "risk_flags": ["flag 1", "flag 2"] or [],
  "confidence": "High" or "Medium" or "Low"
}

Be concise, professional, and specific to HVAC/MEP procurement context.
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid Gemini response format");
  } catch (err) {
    console.error("❌ Gemini error:", err.message);
    return null;
  }
}

async function askFollowUp(projectContext, question) {
  const prompt = `
You are an HVAC procurement advisor. A director has a question about this project:

PROJECT: ${projectContext.project_name}
Risk Level: ${projectContext.risk_level}
Budget Remaining: ₹${Number(projectContext.remaining_budget).toLocaleString("en-IN")}
PR Value: ₹${Number(projectContext.new_pr_value).toLocaleString("en-IN")}
Effort Recommendation: ${projectContext.effort_level}
Win Probability: ${(projectContext.historical_win_probability * 100).toFixed(0)}%

Director's Question: ${question}

Give a direct, professional answer in 2-4 sentences. Be specific to HVAC/MEP procurement.
`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("❌ Gemini follow-up error:", err.message);
    return "Unable to generate response. Please try again.";
  }
}

module.exports = { generatePRAnalysis, askFollowUp };
