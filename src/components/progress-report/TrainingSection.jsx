import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ChartCard from './ChartCard';

const EXERCISE_COLORS = ['#00416A','#C8973A','#007B7F','#5B6DAE','#C0616A','#4A90B8','#7A5C8A','#2D7A5F'];

const ExTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs shadow-md">
      <p className="text-black/40 mb-1">{d?.date}</p>
      <p className="font-mono" style={{ color: payload[0].stroke }}>{payload[0].value?.toFixed(1)} kg E1RM</p>
      <p className="text-black/30">{d?.sessionType}</p>
    </div>
  );
};

export default function TrainingSection({ sessions, exerciseProgressions }) {
  const gkCount = sessions.filter(s => s.type?.match(/GK/i)).length;
  const lissCount = sessions.filter(s => s.type?.match(/LISS/i)).length;
  const topExercises = exerciseProgressions.slice(0, 6);

  return (
    <ChartCard title="Trainingsprogression" badge={`${sessions.length} Einheiten`}>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Gesamt Einheiten', value: sessions.length, color: '#00416A' },
          { label: 'GK-Einheiten', value: gkCount, color: '#5B6DAE' },
          { label: 'LISS-Einheiten', value: lissCount, color: '#4A90B8' },
        ].map((s, i) => (
          <div key={i} className="bg-[#F0EAD6]/50 rounded-xl p-3 border border-[#00416A]/8">
            <p className="text-black/40 text-xs mb-1">{s.label}</p>
            <p className="font-mono font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {topExercises.length === 0 && (
        <p className="text-white/30 text-sm text-center py-8">Keine E1RM-Daten gefunden</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topExercises.map((ex, i) => {
          const color = EXERCISE_COLORS[i % EXERCISE_COLORS.length];
          const pctColor = ex.progressPct >= 0 ? '#3ecf8e' : '#e74c3c';
          return (
            <div key={ex.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-white text-xs font-semibold truncate max-w-[140px]" title={ex.name}>{ex.name}</p>
                <span className="font-mono text-xs font-bold ml-2 flex-shrink-0" style={{ color: pctColor }}>
                  {ex.progressPct >= 0 ? '+' : ''}{ex.progressPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex gap-3 text-xs text-white/30 mb-3">
                <span>Start: <span className="text-white/60 font-mono">{ex.dataPoints[0]?.e1rm?.toFixed(1)} kg</span></span>
                <span>Aktuell: <span className="text-white/60 font-mono">{ex.dataPoints[ex.dataPoints.length - 1]?.e1rm?.toFixed(1)} kg</span></span>
              </div>
              <div className="h-[90px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ex.dataPoints} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff07" />
                    <XAxis dataKey="date" tick={{ fill: '#ffffff20', fontSize: 9 }} interval={Math.max(0, Math.floor(ex.dataPoints.length / 4))} />
                    <YAxis tick={{ fill: '#ffffff20', fontSize: 9 }} width={30} />
                    <Tooltip content={<ExTooltip />} />
                    <Line type="monotone" dataKey="e1rm" stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}