import React from 'react';

export default function StatRow({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-[#F0EAD6]/50 rounded-xl p-3 border border-[#00416A]/8">
          <p className="text-black/40 text-xs mb-1">{s.label}</p>
          <p className="font-mono font-bold text-base" style={{ color: s.color || '#00416A' }}>{s.value ?? '–'}</p>
          {s.sub && <p className={`text-xs mt-0.5 ${s.subColor || 'text-black/30'}`}>{s.sub}</p>}
        </div>
      ))}
    </div>
  );
}