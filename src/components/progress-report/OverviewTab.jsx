import React, { useMemo } from 'react';
import { detectAnomalies, cleanAverage, formatSleep } from '@/lib/nutrilize-parser';

function StatCard({ label, value, sub, color, accent }) {
  return (
    <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: accent || color || '#3ecf8e' }} />
      <p className="text-white/40 text-xs mb-2">{label}</p>
      <p className="text-white font-mono text-xl font-bold" style={{ color: color || 'white' }}>{value ?? '–'}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

const METRICS = [
  { key: 'calories', label: 'Ø Kalorien', unit: 'kcal', color: '#3ecf8e' },
  { key: 'protein', label: 'Ø Protein', unit: 'g', color: '#3ecf8e' },
  { key: 'steps', label: 'Ø Schritte', unit: 'Schr.', color: '#f39c12' },
  { key: 'sleepMinutes', label: 'Ø Schlaf', unit: '', color: '#74b9ff', isSleep: true },
  { key: 'hrv', label: 'Ø HRV', unit: 'ms', color: '#a29bfe' },
  { key: 'restingHR', label: 'Ø Ruhepuls', unit: 'bpm', color: '#fd79a8' },
];

export default function OverviewTab({ data }) {
  const stats = useMemo(() => {
    return METRICS.map(m => {
      const values = data.map(d => d[m.key]);
      const anomalies = detectAnomalies(values);
      const avg = cleanAverage(values, anomalies);
      const valid = values.filter((v, i) => !anomalies[i] && v !== null && !isNaN(v));
      const min = valid.length ? Math.min(...valid) : null;
      const max = valid.length ? Math.max(...valid) : null;
      const anomalyCount = anomalies.filter(Boolean).length;
      return { ...m, avg, min, max, anomalyCount, values, anomalies };
    });
  }, [data]);

  const currentWeight = useMemo(() => {
    const withWeight = data.filter(d => d.weight !== null && d.weight > 0);
    if (!withWeight.length) return null;
    return withWeight[withWeight.length - 1].weight;
  }, [data]);

  const firstWeight = useMemo(() => {
    const withWeight = data.filter(d => d.weight !== null && d.weight > 0);
    return withWeight.length ? withWeight[0].weight : null;
  }, [data]);

  const weightDelta = currentWeight !== null && firstWeight !== null ? (currentWeight - firstWeight) : null;

  const formatVal = (m, val) => {
    if (val === null || val === undefined) return '–';
    if (m.isSleep) return formatSleep(Math.round(val));
    return val.toFixed(1);
  };

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {/* Weight card */}
        <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: '#6c5ce7' }} />
          <p className="text-white/40 text-xs mb-2">Aktuelles Gewicht</p>
          <p className="text-white font-mono text-xl font-bold" style={{ color: '#6c5ce7' }}>
            {currentWeight !== null ? `${currentWeight.toFixed(1)} kg` : '–'}
          </p>
          {weightDelta !== null && (
            <p className={`text-xs mt-1 font-mono ${weightDelta < 0 ? 'text-[#3ecf8e]' : weightDelta > 0 ? 'text-red-400' : 'text-white/30'}`}>
              {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg seit Start
            </p>
          )}
        </div>

        {/* Days card */}
        <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: '#3ecf8e' }} />
          <p className="text-white/40 text-xs mb-2">Anzahl Tage</p>
          <p className="text-white font-mono text-xl font-bold">{data.length}</p>
          <p className="text-white/30 text-xs mt-1">
            {data[0]?.dateLabel} – {data[data.length - 1]?.dateLabel}
          </p>
        </div>

        {/* Other metric cards */}
        {stats.map(m => (
          <StatCard
            key={m.key}
            label={m.label}
            value={formatVal(m, m.avg) + (m.unit ? ` ${m.unit}` : '')}
            sub={`${m.anomalyCount} Anomalien`}
            color={m.color}
          />
        ))}
      </div>

      {/* Summary Table */}
      <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h4 className="text-white font-semibold text-sm">Detailübersicht</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Metrik', 'Ø roh', 'Ø bereinigt', 'Min', 'Max', 'Anomalien'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-white/40 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.map((m, i) => {
                const allValues = m.values.filter(v => v !== null && !isNaN(v) && v !== 0);
                const rawAvg = allValues.length ? allValues.reduce((a, b) => a + b, 0) / allValues.length : null;
                return (
                  <tr key={m.key} className={`border-b border-white/3 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                        <span className="text-white/70 text-xs">{m.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-white/60 text-xs">{rawAvg !== null ? (m.isSleep ? formatSleep(Math.round(rawAvg)) : rawAvg.toFixed(1)) : '–'}</td>
                    <td className="px-4 py-3 font-mono text-white text-xs font-semibold">{formatVal(m, m.avg)}</td>
                    <td className="px-4 py-3 font-mono text-white/60 text-xs">{formatVal(m, m.min)}</td>
                    <td className="px-4 py-3 font-mono text-white/60 text-xs">{formatVal(m, m.max)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${m.anomalyCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/30'}`}>
                        {m.anomalyCount}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}