import { useState } from "react";
import RiskGauge from "./RiskGauge";
import ShapChart from "./ShapChart";

const TABS = ["Overview", "Cardiovascular XAI", "Severity XAI"];

export default function RiskDashboard({ patient, onBack }) {
  const [tab, setTab] = useState(0);
  const { predictions, name, vitals, createdAt } = patient;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">{name}</h2>
          <p className="text-indigo-200 text-sm mt-0.5">
            Assessed {new Date(createdAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-indigo-200 hover:text-white text-sm underline"
        >
          ← New patient
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-5 py-3 text-sm font-medium transition-colors ${
              tab === i
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <RiskGauge title="Cardiovascular Risk" result={predictions.cardiovascular_risk} />
              <RiskGauge title="General Severity" result={predictions.general_severity} />
            </div>

            {/* Key vitals summary */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Recorded Vitals</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Age", vitals.age, "yrs"],
                  ["Heart Rate", vitals.heart_rate, "bpm"],
                  ["Systolic BP", vitals.systolic_bp, "mmHg"],
                  ["Diastolic BP", vitals.diastolic_bp, "mmHg"],
                  ["SpO₂", vitals.spo2, "%"],
                  ["Temp", vitals.temperature, "°F"],
                  ["BMI", vitals.bmi, ""],
                  ["Glucose", vitals.blood_glucose, "mg/dL"],
                  ["Cholesterol", vitals.cholesterol, "mg/dL"],
                ].map(([label, val, unit]) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-base font-semibold text-slate-800">
                      {val} <span className="text-xs font-normal text-slate-400">{unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active symptoms */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Active Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  ["Chest Pain", vitals.chest_pain],
                  ["Shortness of Breath", vitals.shortness_of_breath],
                  ["Fatigue", vitals.fatigue],
                  ["Dizziness", vitals.dizziness],
                ]
                  .filter(([, v]) => v)
                  .map(([label]) => (
                    <span key={label} className="bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full">
                      {label}
                    </span>
                  ))}
                {[vitals.chest_pain, vitals.shortness_of_breath, vitals.fatigue, vitals.dizziness].every((v) => !v) && (
                  <span className="text-slate-400 text-sm">None reported</span>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 1 && (
          <ShapChart
            shapValues={predictions.cardiovascular_risk?.shap_values}
            title="Cardiovascular Risk"
          />
        )}

        {tab === 2 && (
          <ShapChart
            shapValues={predictions.general_severity?.shap_values}
            title="General Severity"
          />
        )}
      </div>
    </div>
  );
}
