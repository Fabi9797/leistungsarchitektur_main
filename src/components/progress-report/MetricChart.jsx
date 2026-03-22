import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Line, Area, ReferenceLine, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Scatter
} from 'recharts';
import { movingAverage, detectAnomalies, cleanAverage, formatSleep } from '@/lib/nutrilize-parser';
import NoteModal from './NoteModal';

const CustomDot = ({ cx, cy, payload, color, isAnomaly, isDummy }) => {
  if (!payload || payload.value === null || payload.value === undefined) return null;
  if (isAnomaly) {
    return <circle cx={cx} cy={cy} r={5} fill="#e74c3c" stroke="#fff" strokeWidth={1.5} />;
  }
  if (isDummy) {
    return <circle cx={cx} cy={cy} r={5} fill="#f39c12" stroke="#fff" strokeWidth={1.5} />;
  }
  return null;
};

const CustomTooltip = ({ active, payload, label, isSleep }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0f0f23] border border-white/10 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-white/50 mb-1.5">{label}</p>
      {payload.map((p, i) => {
        if (p.value === null || p.value === undefined) return null;
        const val = isSleep ? formatSleep(Math.round(p.value)) : typeof p.value === 'number' ? p.value.toFixed(1) : p.value;
        return (
          <div key={i} className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-white/60">{p.name}:</span>
            <span className="text-white font-mono font-semibold">{val}</span>
          </div>
        );
      })}
    </div>
  );
};

export default function MetricChart({ data, metricKey, label, color, unit, target, isSleep, notes, onNoteChange }) {
  const [noteModal, setNoteModal] = useState(null);

  const rawValues = useMemo(() => data.map(d => d[metricKey]), [data, metricKey]);
  const anomalies = useMemo(() => detectAnomalies(rawValues), [rawValues]);
  const movAvg = useMemo(() => movingAverage(data, metricKey), [data, metricKey]);
  const avgClean = useMemo(() => cleanAverage(rawValues, anomalies), [rawValues, anomalies]);

  const chartData = useMemo(() => data.map((d, i) => {
    const noteKey = `${d.date}_${metricKey}`;
    const note = notes[noteKey];
    const isDummy = note?.useDummy && note?.dummyValue !== null;
    const displayValue = isDummy ? note.dummyValue : rawValues[i];
    return {
      date: d.dateLabel || d.date,
      fullDate: d.date,
      value: displayValue,
      movAvg: movAvg[i],
      isAnomaly: anomalies[i] && !isDummy,
      isDummy,
      hasNote: !!note?.text,
      index: i,
      rawValue: rawValues[i],
    };
  }), [data, metricKey, rawValues, anomalies, movAvg, notes]);

  const anomalyPoints = chartData.filter(d => d.isAnomaly && d.value !== null);
  const dummyPoints = chartData.filter(d => d.isDummy);

  const yValues = chartData.map(d => d.value).filter(v => v !== null && !isNaN(v));
  const yMin = yValues.length ? Math.min(...yValues) * 0.9 : 0;
  const yMax = yValues.length ? Math.max(...yValues) * 1.1 : 100;

  const openNote = (point) => {
    const noteKey = `${point.fullDate}_${metricKey}`;
    setNoteModal({
      date: point.date,
      fullDate: point.fullDate,
      index: point.index,
      value: point.rawValue,
      displayValue: isSleep ? formatSleep(point.rawValue) : `${point.rawValue?.toFixed?.(1) ?? '–'} ${unit}`,
    });
  };

  const saveNote = (noteData) => {
    const key = `${noteModal.fullDate}_${metricKey}`;
    onNoteChange(key, noteData);
    setNoteModal(null);
  };

  const deleteNote = () => {
    const key = `${noteModal.fullDate}_${metricKey}`;
    onNoteChange(key, null);
    setNoteModal(null);
  };

  return (
    <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          <h4 className="text-white font-semibold text-sm">{label}</h4>
          {unit && <span className="text-white/30 text-xs">({unit})</span>}
        </div>
        {avgClean !== null && (
          <div className="text-right">
            <span className="text-white/40 text-xs">Ø bereinigt: </span>
            <span className="text-white font-mono text-sm font-semibold">
              {isSleep ? formatSleep(Math.round(avgClean)) : avgClean.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 mt-2">
        {[
          { color, label: 'Tageswert', dashed: false },
          { color: color + '80', label: 'Ø 7 Tage', dashed: true },
          { color: '#e74c3c', label: 'Anomalie', dot: true },
          { color: '#f39c12', label: 'Dummy-Wert', dot: true },
          ...(target ? [{ color: '#888', label: 'Zielwert', dashed: true }] : []),
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {item.dot ? (
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
            ) : (
              <div className="w-5 h-0.5 flex-shrink-0" style={{
                background: item.color,
                borderTop: item.dashed ? `2px dashed ${item.color}` : 'none',
                height: item.dashed ? 0 : 2,
              }} />
            )}
            <span className="text-white/40 text-[10px]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#ffffff30', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(chartData.length / 8)}
          />
          <YAxis
            tick={{ fill: '#ffffff30', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[yMin, yMax]}
          />
          <Tooltip content={<CustomTooltip isSleep={isSleep} />} />

          {/* Clean average reference */}
          {avgClean !== null && (
            <ReferenceLine y={avgClean} stroke={color + '60'} strokeDasharray="4 4" />
          )}

          {/* Target reference */}
          {target && (
            <ReferenceLine y={target} stroke="#888888" strokeDasharray="4 4"
              label={{ value: 'Ziel', fill: '#888', fontSize: 10, position: 'insideTopRight' }} />
          )}

          {/* Main value line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            name="Tageswert"
            connectNulls={false}
          />

          {/* Moving average */}
          <Line
            type="monotone"
            dataKey="movAvg"
            stroke={color + '70'}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            name="Ø 7 Tage"
            connectNulls={true}
          />

          {/* Anomaly dots */}
          {anomalyPoints.length > 0 && (
            <Scatter
              data={anomalyPoints}
              fill="#e74c3c"
              r={5}
              shape={({ cx, cy }) => (
                <circle cx={cx} cy={cy} r={5} fill="#e74c3c" stroke="#fff" strokeWidth={1.5} />
              )}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Note buttons */}
      <div className="mt-4 flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
        {chartData.map((point, i) => {
          const noteKey = `${point.fullDate}_${metricKey}`;
          const hasNote = notes[noteKey];
          return (
            <button
              key={i}
              onClick={() => openNote(point)}
              title={point.date}
              className={`w-7 h-7 rounded-lg text-[10px] font-medium transition-all flex items-center justify-center flex-shrink-0 ${
                hasNote?.text
                  ? 'bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/30'
                  : point.isAnomaly
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-white/5 text-white/30 border border-white/5 hover:bg-white/10 hover:text-white/60'
              }`}
            >
              {hasNote?.text ? '📝' : '+'}
            </button>
          );
        })}
      </div>

      {/* Note modal */}
      {noteModal && (
        <NoteModal
          day={noteModal}
          metric={label}
          values={rawValues}
          anomalies={anomalies}
          existingNote={notes[`${noteModal.fullDate}_${metricKey}`]}
          onSave={saveNote}
          onDelete={deleteNote}
          onClose={() => setNoteModal(null)}
        />
      )}
    </div>
  );
}