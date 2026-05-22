const mongoose = require("mongoose");

const shapEntrySchema = new mongoose.Schema({
  feature: String,
  value: Number,
  shap_value: Number,
});

const riskResultSchema = new mongoose.Schema({
  label: String,
  probabilities: mongoose.Schema.Types.Mixed,
  shap_values: [shapEntrySchema],
  base_value: Number,
});

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    vitals: {
      age: Number,
      sex: Number,
      smoking: Number,
      family_history_heart: Number,
      heart_rate: Number,
      systolic_bp: Number,
      diastolic_bp: Number,
      temperature: Number,
      spo2: Number,
      weight: Number,
      bmi: Number,
      blood_glucose: Number,
      cholesterol: Number,
      hba1c: Number,
      creatinine: Number,
      chest_pain: Number,
      shortness_of_breath: Number,
      fatigue: Number,
      dizziness: Number,
    },
    predictions: {
      cardiovascular_risk: riskResultSchema,
      general_severity: riskResultSchema,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
