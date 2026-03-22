import React from 'react';

export default function StatRow({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
          <p className="text-white/35 text-xs mb-1">{s.label}</p>
          <p className="font-mono font-bold text-base" style={{ color: s.color || 'white' }}>{s.value ?? '–'}</p>
          {s.sub && <p className={`text-xs mt-0.5 ${s.subColor || 'text-white/30'}`}>{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}