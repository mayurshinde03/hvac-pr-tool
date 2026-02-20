const mongoose = require("mongoose");

const PRSchema = new mongoose.Schema({
  project_name:               String,
  client_type:                String,
  project_size:               Number,
  project_budget:             Number,
  spent_till_date:            Number,
  new_pr_value:               Number,
  historical_win_probability: Number,
  remaining_budget:           Number,
  budget_utilization_before:  Number,
  budget_utilization_after:   Number,
  expected_value:             Number,
  risk_score:                 Number,
  risk_level:                 String,
  effort_level:               String,
  ai_recommendation:          String,
  is_overrun:                 Boolean,
  overrun_amount:             Number,
  generated_at:               { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("PRAnalysis", PRSchema);
