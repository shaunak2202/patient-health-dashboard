import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-800">{d.feature}</p>
      <p className="text-slate-500">Input: <span className="font-medium text-slate-700">{d.value}</span></p>
      <p className={d.shap_value > 0 ? "text-red-600" : "text-green-600"}>
        SHAP: {d.shap_value > 0 ? "+" : ""}{d.shap_value.toFixed(4)}
        <span className="text-slate-400 ml-1">
          ({d.shap_value > 0 ? "↑ increases risk" : "↓ decreases risk"})
        </span>
      </p>
    </div>
  );
};

export default function ShapChart({ shapValues, title }) {
  if (!shapValues?.length) return null;

  const data = [...shapValues]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 8)
    .reverse();

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">{title} — Top Feature Contributions</h4>
      <p className="text-xs text-slate-400 mb-4">
        Red bars push risk <strong>higher</strong>; green bars push risk <strong>lower</strong>.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => v.toFixed(3)} tick={{ fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="feature"
            width={140}
            tick={{ fontSize: 11, fill: "#475569" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke="#94a3b8" />
          <Bar dataKey="shap_value" radius={[0, 3, 3, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.shap_value > 0 ? "#ef4444" : "#22c55e"} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
