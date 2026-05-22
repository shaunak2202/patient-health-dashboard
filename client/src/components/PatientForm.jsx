import { useState } from "react";
import { createPatient } from "../api/patients";

const SECTIONS = [
  {
    id: "demographics",
    label: "Demographics",
    fields: [
      { key: "age", label: "Age", type: "number", unit: "yrs", min: 1, max: 120, placeholder: "45" },
      {
        key: "sex", label: "Sex", type: "select",
        options: [{ value: 0, label: "Female" }, { value: 1, label: "Male" }],
      },
      {
        key: "smoking", label: "Smoking Status", type: "select",
        options: [
          { value: 0, label: "Never" },
          { value: 1, label: "Former" },
          { value: 2, label: "Current" },
        ],
      },
      {
        key: "family_history_heart", label: "Family History (Heart Disease)", type: "select",
        options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }],
      },
    ],
  },
  {
    id: "vitals",
    label: "Basic Vitals",
    fields: [
      { key: "heart_rate", label: "Heart Rate", type: "number", unit: "bpm", min: 20, max: 300, placeholder: "72" },
      { key: "systolic_bp", label: "Systolic BP", type: "number", unit: "mmHg", min: 60, max: 300, placeholder: "120" },
      { key: "diastolic_bp", label: "Diastolic BP", type: "number", unit: "mmHg", min: 30, max: 200, placeholder: "80" },
      { key: "temperature", label: "Temperature", type: "number", unit: "°F", min: 90, max: 110, step: 0.1, placeholder: "98.6" },
      { key: "spo2", label: "SpO₂", type: "number", unit: "%", min: 50, max: 100, step: 0.1, placeholder: "98" },
      { key: "weight", label: "Weight", type: "number", unit: "kg", min: 10, max: 500, step: 0.1, placeholder: "70" },
      { key: "bmi", label: "BMI", type: "number", unit: "kg/m²", min: 10, max: 70, step: 0.1, placeholder: "24.5" },
    ],
  },
  {
    id: "labs",
    label: "Lab Values",
    fields: [
      { key: "blood_glucose", label: "Blood Glucose", type: "number", unit: "mg/dL", min: 40, max: 800, placeholder: "95" },
      { key: "cholesterol", label: "Total Cholesterol", type: "number", unit: "mg/dL", min: 50, max: 600, placeholder: "185" },
      { key: "hba1c", label: "HbA1c", type: "number", unit: "%", min: 3, max: 20, step: 0.1, placeholder: "5.4" },
      { key: "creatinine", label: "Creatinine", type: "number", unit: "mg/dL", min: 0.1, max: 20, step: 0.1, placeholder: "0.9" },
    ],
  },
  {
    id: "symptoms",
    label: "Symptoms",
    fields: [
      { key: "chest_pain", label: "Chest Pain", type: "toggle" },
      { key: "shortness_of_breath", label: "Shortness of Breath", type: "toggle" },
      { key: "fatigue", label: "Fatigue", type: "toggle" },
      { key: "dizziness", label: "Dizziness", type: "toggle" },
    ],
  },
];

const DEFAULTS = {
  age: "", sex: 0, smoking: 0, family_history_heart: 0,
  heart_rate: "", systolic_bp: "", diastolic_bp: "",
  temperature: "", spo2: "", weight: "", bmi: "",
  blood_glucose: "", cholesterol: "", hba1c: "", creatinine: "",
  chest_pain: 0, shortness_of_breath: 0, fatigue: 0, dizziness: 0,
};

export default function PatientForm({ onResult }) {
  const [name, setName] = useState("");
  const [values, setValues] = useState(DEFAULTS);
  const [activeSection, setActiveSection] = useState("demographics");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key, val) => setValues((v) => ({ ...v, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const vitals = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? Number(v) : v])
      );
      const { data } = await createPatient({ name, vitals });
      onResult(data);
    } catch (err) {
      setError(err.response?.data?.error || "Prediction failed. Check that all services are running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
        <h2 className="text-xl font-semibold text-white">Patient Assessment</h2>
        <p className="text-blue-100 text-sm mt-1">Enter vitals and symptoms to generate ML risk predictions</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Patient name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                activeSection === s.id
                  ? "bg-white shadow text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Section fields */}
        {SECTIONS.filter((s) => s.id === activeSection).map((section) => (
          <div key={section.id} className="grid grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div key={field.key} className={field.type === "toggle" ? "col-span-1" : ""}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>

                {field.type === "number" && (
                  <div className="flex">
                    <input
                      type="number"
                      required
                      min={field.min}
                      max={field.max}
                      step={field.step || 1}
                      placeholder={field.placeholder}
                      value={values[field.key]}
                      onChange={(e) => set(field.key, e.target.value)}
                      className="flex-1 border border-slate-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg px-2 py-2 text-xs text-slate-500 flex items-center">
                      {field.unit}
                    </span>
                  </div>
                )}

                {field.type === "select" && (
                  <select
                    value={values[field.key]}
                    onChange={(e) => set(field.key, Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {field.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                )}

                {field.type === "toggle" && (
                  <button
                    type="button"
                    onClick={() => set(field.key, values[field.key] === 1 ? 0 : 1)}
                    className={`w-full py-2 rounded-lg border text-sm font-medium transition-all ${
                      values[field.key]
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-slate-50 border-slate-300 text-slate-500"
                    }`}
                  >
                    {values[field.key] ? "Yes" : "No"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? "Running ML Prediction…" : "Analyze Risk"}
        </button>
      </div>
    </form>
  );
}
