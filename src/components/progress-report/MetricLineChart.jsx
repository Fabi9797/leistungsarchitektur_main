import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { detectAnomalies, movingAverage, cleanAverage, formatSleep } from '@/lib/nutrilize-parser';
import DayButtons from './DayButtons';

const CustomTooltip = ({ active, payload, isSleep }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const fmtVal = (v) => {
    if (v === null || v === undefined) return '–';
    if (isSleep) return formatSleep(Math.round(v));
    return typeof v === 'number' ? v.toFixed(1) : v;
  };
  return (
    <div className="bg-white border border-black/10 rounded-xl px-3 py-2 text-xs shadow-md">
      <p className="text-black/40 mb-1">{d.dateLabel || d.date}</p>
      {payload.map((p, i) => p.value !== null && p.value !== undefined && (
        <p key={i} className="font-mono" style={{ color: p.stroke || p.fill }}>
          {p.name}: {fmtVal(p.value)}
        </p>
      ))}
      {d.isAnomaly && <p className="text-red-500 mt-1">⚠ Anomalie</p>}
      {d.isDummy && <p className="text-amber-500 mt-1">⚠ Dummy-Wert</p>}
    </div>
  );
};

const AnomalyDot = (props) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  if (payload.isDummy) return <circle cx={cx} cy={cy} r={5} fill="#f39c12" />;
  if (payload.isAnomaly) return <circle cx={cx} cy={cy} r={5} fill="#e74c3c" />;
  return null;
};

export default function MetricLineChart({ data, metricKey, label, color, unit, target, isSleep, secondaryKey, secondaryColor, secondaryLabel, notes, onNoteChange }) {
  const values = useMemo(() => data.map(d => d[metricKey]), [data, metricKey]);
  const anomalies = useMemo(() => detectAnomalies(values), [values]);
  const mavg = useMemo(() => movingAverage(data, metricKey), [data, metricKey]);
  const avg = useMemo(() => cleanAverage(values, anomalies), [values, anomalies]);

  const chartData = useMemo(() => data.map((d, i) => {
    const nk = `${metricKey}_${d.date}`;
    const noteEntry = notes?.[nk];
    const rawVal = noteEntry?.isDummy ? noteEntry.dummyVal : d[metricKey];
    return {
      ...d,
      value: rawVal,
      ma: mavg[i],
      isAnomaly: anomalies[i] && !noteEntry?.isDummy,
      isDummy: !!noteEntry?.isDummy,
      secondary: secondaryKey ? d[secondaryKey] : undefined,
    };
  }), [data, metricKey, notes, anomalies, mavg, secondaryKey]);

  const fmt = (v) => {
    if (v === null || v === undefined) return '–';
    if (isSleep) return formatSleep(Math.round(v));
    return typeof v === 'number' ? v.toFixed(1) : v;
  };

  const interval = Math.max(0, Math.floor(data.length / 10));

  return (
    <div>
      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00416A0d" />
            <XAxis dataKey="dateLabel" tick={{ fill: '#00000040', fontSize: 10 }} interval={interval} />
            <YAxis tick={{ fill: '#00000040', fontSize: 10 }} width={36} />
            <Tooltip content={<CustomTooltip isSleep={isSleep} />} />
            {avg !== null && <ReferenceLine y={avg} stroke={color} strokeDasharray="3 3" strokeOpacity={0.35} />}
            {target && <ReferenceLine y={target} stroke="#00416A40" strokeDasharray="4 4" label={{ value: 'Ziel', fill: '#00416A60', fontSize: 10 }} />}
            <Line type="monotone" dataKey="value" name={label} stroke={color} strokeWidth={2}
              dot={<AnomalyDot />} activeDot={{ r: 4 }} connectNulls={false} />
            <Line type="monotone" dataKey="ma" name="Ø 7T" stroke={color} strokeWidth={1.5}
              strokeDasharray="5 3" dot={false} strokeOpacity={0.45} connectNulls />
            {secondaryKey && (
              <Line type="monotone" dataKey="secondary" name={secondaryLabel || secondaryKey}
                stroke={secondaryColor || '#e17055'} strokeWidth={1.5} dot={false} connectNulls />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {notes && onNoteChange && (
        <DayButtons data={data} metricKey={metricKey} metricLabel={label} notes={notes} onNoteChange={onNoteChange} />
      )}
    </div>
  );
}