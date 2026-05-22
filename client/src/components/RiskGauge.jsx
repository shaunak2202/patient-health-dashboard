const COLORS = { Low: "#22c55e", Medium: "#f59e0b", High: "#ef4444" };
const BG = { Low: "bg-green-50 border-green-200", Medium: "bg-amber-50 border-amber-200", High: "bg-red-50 border-red-200" };
const TEXT = { Low: "text-green-700", Medium: "text-amber-700", High: "text-red-700" };

export default function RiskGauge({ title, result }) {
  if (!result) return null;
  const { label, probabilities } = result;
  const color = COLORS[label] || "#94a3b8";

  return (
    <div className={`rounded-xl border p-4 ${BG[label] || "bg-slate-50 border-slate-200"}`}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">{title}</p>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className={`text-2xl font-bold ${TEXT[label] || "text-slate-700"}`}>{label} Risk</span>
      </div>

      {/* Probability bars */}
      <div className="space-y-2">
        {Object.entries(probabilities).map(([lvl, prob]) => (
          <div key={lvl}>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-slate-600">{lvl}</span>
              <span className="font-medium text-slate-700">{(prob * 100).toFixed(1)}%</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${prob * 100}%`, backgroundColor: COLORS[lvl] || "#94a3b8" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
