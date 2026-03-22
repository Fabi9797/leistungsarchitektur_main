import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0f0f23] border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-white/50 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-white/60">{p.name}:</span>
          <span className="text-white font-mono font-semibold">{p.value?.toFixed(1)} g</span>
        </div>
      ))}
    </div>
  );
};

export default function MacroChart({ data }) {
  const chartData = data.map(d => ({
    date: d.dateLabel || d.date,
    Kohlenhydrate: d.carbs,
    Protein: d.protein,
    Fett: d.fat,
  }));

  return (
    <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-5 mb-6">
      <h4 className="text-white font-semibold text-sm mb-4">Makronährstoff-Verteilung</h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis dataKey="date" tick={{ fill: '#ffffff30', fontSize: 10 }} tickLine={false} axisLine={false}
            interval={Math.floor(chartData.length / 8)} />
          <YAxis tick={{ fill: '#ffffff30', fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Kohlenhydrate" stackId="a" fill="#f39c12" radius={[0,0,0,0]} />
          <Bar dataKey="Protein" stackId="a" fill="#3ecf8e" radius={[0,0,0,0]} />
          <Bar dataKey="Fett" stackId="a" fill="#e74c3c" radius={[2,2,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-3">
        {[['Kohlenhydrate', '#f39c12'], ['Protein', '#3ecf8e'], ['Fett', '#e74c3c']].map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="text-white/40 text-xs">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}