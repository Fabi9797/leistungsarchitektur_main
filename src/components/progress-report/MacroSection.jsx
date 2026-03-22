import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { detectAnomalies, cleanAverage } from '@/lib/nutrilize-parser';
import ChartCard from './ChartCard';
import StatRow from './StatRow';
import DayButtons from './DayButtons';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs shadow-md">
      <p className="text-black/40 mb-1">{label}</p>
      {payload.map((p, i) => p.value > 0 && (
        <p key={i} className="font-mono" style={{ color: p.fill || p.color }}>{p.name}: {p.value?.toFixed(0)} g</p>
      ))}
    </div>
  );
};

export default function MacroSection({ data, proteinTarget, notes, onNoteChange }) {
  const macroData = data.map(d => ({
    dateLabel: d.dateLabel,
    date: d.date,
    Kohlenhydrate: d.carbs || 0,
    Protein: d.protein || 0,
    Fett: d.fat || 0,
  }));

  const proteinVals = useMemo(() => data.map(d => d.protein), [data]);
  const proteinAnom = useMemo(() => detectAnomalies(proteinVals), [proteinVals]);
  const proteinAvg = useMemo(() => cleanAverage(proteinVals, proteinAnom), [proteinVals, proteinAnom]);

  const proteinDaysHit = proteinTarget
    ? proteinVals.filter((v, i) => !proteinAnom[i] && v !== null && v >= proteinTarget).length
    : null;
  const cleanProteinDays = proteinVals.filter((v, i) => !proteinAnom[i] && v !== null).length;

  const interval = Math.max(0, Math.floor(data.length / 10));

  const stats = [
    { label: 'Ø Protein (bereinigt)', value: proteinAvg ? `${proteinAvg.toFixed(0)} g` : '–', color: '#3ecf8e' },
    { label: 'Protein-Ziel', value: proteinTarget ? `${proteinTarget} g` : '–', color: '#ffffff60' },
    ...(proteinDaysHit !== null ? [{
      label: 'Ziel erreicht',
      value: `${proteinDaysHit} / ${cleanProteinDays} Tage`,
      color: proteinDaysHit / cleanProteinDays > 0.7 ? '#3ecf8e' : '#e74c3c',
    }] : []),
  ];

  return (
    <ChartCard title="Nährwertverteilung" badge={proteinAvg ? `Ø ${proteinAvg.toFixed(0)}g Protein` : undefined}>
      <StatRow stats={stats} />

      <p className="text-white/30 text-xs mb-2">Makros pro Tag (gestapelt)</p>
      <div className="h-[160px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={macroData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff07" />
            <XAxis dataKey="dateLabel" tick={{ fill: '#ffffff25', fontSize: 10 }} interval={interval} />
            <YAxis tick={{ fill: '#ffffff25', fontSize: 10 }} width={36} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#ffffff50' }} />
            <Bar dataKey="Kohlenhydrate" stackId="a" fill="#f39c12" />
            <Bar dataKey="Protein" stackId="a" fill="#3ecf8e" />
            <Bar dataKey="Fett" stackId="a" fill="#e74c5f" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <DayButtons data={data} metricKey="protein" metricLabel="Protein" notes={notes} onNoteChange={onNoteChange} />
    </ChartCard>
  );
}