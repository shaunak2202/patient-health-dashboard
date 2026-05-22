import { useState } from "react";
import PatientForm from "./components/PatientForm";
import RiskDashboard from "./components/RiskDashboard";
import PatientHistory from "./components/PatientHistory";

export default function App() {
  const [result, setResult] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleResult = (patient) => {
    setResult(patient);
    setHistoryKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Patient Health Dashboard</h1>
          <p className="text-xs text-slate-400">ML Risk Prediction · SHAP Explanations</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-3 gap-6">
        {/* Left: form or result */}
        <div className="col-span-2">
          {result ? (
            <RiskDashboard patient={result} onBack={() => setResult(null)} />
          ) : (
            <PatientForm onResult={handleResult} />
          )}
        </div>

        {/* Right: history */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Patient History</h3>
            <PatientHistory
              refreshKey={historyKey}
              onSelect={(p) => setResult(p)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
