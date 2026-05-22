import { useEffect, useState } from "react";
import { listPatients, deletePatient } from "../api/patients";

const RISK_COLOR = { Low: "text-green-600 bg-green-50", Medium: "text-amber-600 bg-amber-50", High: "text-red-600 bg-red-50" };

export default function PatientHistory({ refreshKey, onSelect }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await listPatients();
      setPatients(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshKey]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deletePatient(id);
    setPatients((p) => p.filter((x) => x._id !== id));
  };

  if (loading) return <p className="text-slate-400 text-sm text-center py-8">Loading history…</p>;
  if (!patients.length) return <p className="text-slate-400 text-sm text-center py-8">No patients yet.</p>;

  return (
    <div className="space-y-2">
      {patients.map((p) => {
        const cv = p.predictions?.cardiovascular_risk?.label;
        const sev = p.predictions?.general_severity?.label;
        return (
          <div
            key={p._id}
            onClick={() => onSelect(p)}
            className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{p.name}</p>
              <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              {cv && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_COLOR[cv] || ""}`}>
                  CV: {cv}
                </span>
              )}
              {sev && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RISK_COLOR[sev] || ""}`}>
                  Sev: {sev}
                </span>
              )}
              <button
                onClick={(e) => handleDelete(e, p._id)}
                className="text-slate-300 hover:text-red-400 transition-colors ml-1 text-lg leading-none"
                title="Delete"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
