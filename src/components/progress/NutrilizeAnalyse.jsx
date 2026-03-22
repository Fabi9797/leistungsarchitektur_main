import React, { useState, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ReferenceLine, Legend, Cell
} from 'recharts';
import {
  detectAnomalies, cleanAverage, movingAverage, formatSleep, calculateDummy
} from '@/lib/nutrilize-parser';

const TABS = ['Übersicht', 'Ernährung', 'Körper', 'Aktivität', 'Erholung'];

const COLORS = {
  calories: '#3ecf8e', protein: '#3ecf8e', weight: '#6c5ce7',
  steps: '#f39c12', sleepMinutes: '#74b9ff', hrv: '#a29bfe',
  restingHR: '#fd79a8', fiber: '#00b894', sugar: '#fdcb6e',
  burnedCalories: '#e74c3c', activityDuration: '#00cec9',
  bodyFat: '#6c5ce7', bmi: '#a29bfe',
};

// ─── NoteModal ────────────────────────────────────────────────────────────────
function NoteModal({ day, metricKey, metricLabel, currentValue, notes, onSave, onClose, allData }) {
  const key = `${metricKey}_${day.date}`;
  const existing = notes[key] || {};
  const [text, setText] = useState(existing.note || '');
  const [isDummy, setIsDummy] = useState(existing.isDummy || false);

  const dummyVal = useMemo(() => {
    const idx = allData.findIndex(d => d.date === day.date);
    if (idx === -1) return null;
    const values = allData.map(d => d[metricKey]);
    const anomalies = detectAnomalies(values);
    return calculateDummy(values, idx, anomalies);
  }, [allData, day.date, metricKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white font-semibold text-sm">{metricLabel} · {day.dateLabel}</p>
            <p className="text-white/40 text-xs mt-0.5">
              Wert: {currentValue !== null && currentValue !== undefined ? currentValue.toFixed(1) : '–'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><span>✕</span></button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Notiz hinzufügen..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm resize-none h-24 outline-none focus:border-[#3ecf8e]/50 mb-3"
        />
        {dummyVal !== null && (
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input type="checkbox" checked={isDummy} onChange={e => setIsDummy(e.target.checked)}
              className="w-4 h-4 accent-orange-400" />
            <span className="text-white/60 text-xs">Dummy-Wert ({dummyVal.toFixed(1)}) verwenden</span>
          </label>
        )}
        <div className="flex gap-2">
          <button onClick={() => { onSave(key, null); onClose(); }}
            className="flex-1 py-2 rounded-xl border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 text-xs transition-colors">
            Löschen
          </button>
          <button onClick={() => { onSave(key, { note: text, isDummy, dummyVal }); onClose(); }}
            className="flex-1 py-2 rounded-xl bg-[#3ecf8e] text-black font-semibold text-xs hover:bg-[#2ebd7e] transition-colors">
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MetricChart ──────────────────────────────────────────────────────────────
function MetricChart({ data, metricKey, label, color, unit, target, notes, onNoteChange, isSleep }) {
  const [noteModal, setNoteModal] = useState(null);

  const values = useMemo(() => data.map(d => d[metricKey]), [data, metricKey]);
  const anomalies = useMemo(() => detectAnomalies(values), [values]);
  const mavg = useMemo(() => movingAverage(data, metricKey), [data, metricKey]);
  const avg = useMemo(() => cleanAverage(values, anomalies), [values, anomalies]);

  const chartData = useMemo(() => data.map((d, i) => {
    const noteKey = `${metricKey}_${d.date}`;
    const noteEntry = notes[noteKey];
    const rawVal = noteEntry?.isDummy ? noteEntry.dummyVal : d[metricKey];
    return {
      ...d,
      value: rawVal,
      ma: mavg[i],
      isAnomaly: anomalies[i] && !noteEntry?.isDummy,
      isDummy: noteEntry?.isDummy,
    };
  }), [data, metricKey, notes, anomalies, mavg]);

  const formatVal = (v) => {
    if (v === null || v === undefined) return '–';
    if (isSleep) return formatSleep(Math.round(v));
    return typeof v === 'number' ? v.toFixed(1) : v;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    if (payload.isDummy) return <circle cx={cx} cy={cy} r={4} fill="#f39c12" stroke="#f39c12" strokeWidth={1} />;
    if (payload.isAnomaly) return <circle cx={cx} cy={cy} r={4} fill="#e74c3c" stroke="#e74c3c" strokeWidth={1} />;
    return null;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs">
        <p className="text-white/50 mb-1">{d.dateLabel}</p>
        <p className="text-white font-mono">{label}: <span style={{ color }}>{formatVal(d.value)}{unit ? ` ${unit}` : ''}</span></p>
        {d.ma !== null && <p className="text-white/40">MA7: {formatVal(d.ma)}</p>}
        {d.isDummy && <p className="text-orange-400">⚠ Dummy-Wert</p>}
        {d.isAnomaly && <p className="text-red-400">⚠ Anomalie</p>}
      </div>
    );
  };

  const hasData = values.some(v => v !== null && v !== 0);
  if (!hasData) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          <h4 className="text-white font-semibold text-sm">{label}</h4>
          {avg !== null && (
            <span className="text-white/40 text-xs font-mono">
              Ø {formatVal(avg)}{unit ? ` ${unit}` : ''}
            </span>
          )}
        </div>
        {target && <span className="text-white/30 text-xs font-mono">Ziel: {formatVal(target)}</span>}
      </div>

      <div className="bg-[#0f0f1a] border border-white/5 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="dateLabel" tick={{ fill: '#ffffff30', fontSize: 10 }}
              interval={Math.max(0, Math.floor(chartData.length / 8))} />
            <YAxis tick={{ fill: '#ffffff30', fontSize: 10 }} width={38} />
            <Tooltip content={<CustomTooltip />} />
            {avg !== null && (
              <ReferenceLine y={avg} stroke={color} strokeDasharray="3 3" strokeOpacity={0.3} />
            )}
            {target && (
              <ReferenceLine y={target} stroke="#ffffff30" strokeDasharray="4 4" />
            )}
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2}
              dot={<CustomDot />} activeDot={{ r: 4 }} connectNulls={false} />
            <Line type="monotone" dataKey="ma" stroke={color} strokeWidth={1.5}
              strokeDasharray="5 3" dot={false} strokeOpacity={0.5} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Day buttons */}
      <div className="mt-2 flex flex-wrap gap-1">
        {data.map((d, i) => {
          const noteKey = `${metricKey}_${d.date}`;
          const hasNote = !!notes[noteKey];
          const isAnom = anomalies[i];
          return (
            <button
              key={d.date}
              onClick={() => setNoteModal({ day: d, index: i })}
              title={d.dateLabel}
              className={`w-5 h-5 rounded text-[9px] font-mono transition-all border ${
                hasNote ? 'bg-orange-400/20 border-orange-400/50 text-orange-300' :
                isAnom ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                'bg-white/5 border-white/8 text-white/20 hover:border-white/20'
              }`}
            >
              {hasNote ? '✎' : isAnom ? '!' : ''}
            </button>
          );
        })}
      </div>

      {noteModal && (
        <NoteModal
          day={noteModal.day}
          metricKey={metricKey}
          metricLabel={label}
          currentValue={data[noteModal.index]?.[metricKey]}
          notes={notes}
          allData={data}
          onSave={onNoteChange}
          onClose={() => setNoteModal(null)}
        />
      )}
    </div>
  );
}

// ─── MacroChart ───────────────────────────────────────────────────────────────
function MacroChart({ data }) {
  const chartData = data.map(d => ({
    dateLabel: d.dateLabel,
    Kohlenhydrate: d.carbs,
    Protein: d.protein,
    Fett: d.fat,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs">
        <p className="text-white/50 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.fill }} className="font-mono">{p.name}: {p.value?.toFixed(0)} g</p>
        ))}
      </div>
    );
  };

  return (
    <div className="mb-8">
      <h4 className="text-white font-semibold text-sm mb-3">Makronährstoffe (Tagesverlauf)</h4>
      <div className="bg-[#0f0f1a] border border-white/5 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="dateLabel" tick={{ fill: '#ffffff30', fontSize: 10 }}
              interval={Math.max(0, Math.floor(chartData.length / 8))} />
            <YAxis tick={{ fill: '#ffffff30', fontSize: 10 }} width={38} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#ffffff60' }} />
            <Bar dataKey="Kohlenhydrate" stackId="a" fill="#f39c12" />
            <Bar dataKey="Protein" stackId="a" fill="#3ecf8e" />
            <Bar dataKey="Fett" stackId="a" fill="#e74c5f" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── OverviewTab ───────────────────────────────────────────────────────────────
function OverviewTab({ data, clientProfile }) {
  const metrics = [
    { key: 'calories', label: 'Ø Kalorien', unit: 'kcal', color: '#3ecf8e', target: clientProfile?.kalorien_ziel },
    { key: 'protein', label: 'Ø Protein', unit: 'g', color: '#3ecf8e', target: clientProfile?.protein_ziel },
    { key: 'steps', label: 'Ø Schritte', unit: '', color: '#f39c12', target: clientProfile?.schritte ? parseFloat(clientProfile.schritte) : undefined },
    { key: 'sleepMinutes', label: 'Ø Schlaf', unit: '', color: '#74b9ff', isSleep: true },
    { key: 'hrv', label: 'Ø HRV', unit: 'ms', color: '#a29bfe' },
    { key: 'restingHR', label: 'Ø Ruhepuls', unit: 'bpm', color: '#fd79a8' },
  ];

  const currentWeight = data.filter(d => d.weight > 0).slice(-1)[0]?.weight;
  const firstWeight = data.filter(d => d.weight > 0)[0]?.weight;
  const weightDelta = currentWeight && firstWeight ? (currentWeight - firstWeight) : null;

  const statData = metrics.map(m => {
    const vals = data.map(d => d[m.key]);
    const anomalies = detectAnomalies(vals);
    const clean = cleanAverage(vals, anomalies);
    const raw = vals.filter(v => v !== null && !isNaN(v) && v !== 0);
    const rawAvg = raw.length ? raw.reduce((a, b) => a + b, 0) / raw.length : null;
    const min = raw.length ? Math.min(...raw) : null;
    const max = raw.length ? Math.max(...raw) : null;
    const anomCount = anomalies.filter(Boolean).length;
    return { ...m, clean, rawAvg, min, max, anomCount };
  });

  const fmt = (m, v) => {
    if (v === null || v === undefined) return '–';
    if (m.isSleep) return formatSleep(Math.round(v));
    return v.toFixed(1);
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {/* Weight */}
        <div className="bg-[#0f0f1a] border border-white/8 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1.5">Aktuelles Gewicht</p>
          <p className="text-white font-mono text-lg font-bold" style={{ color: '#6c5ce7' }}>
            {currentWeight ? `${currentWeight.toFixed(1)} kg` : '–'}
          </p>
          {weightDelta !== null && (
            <p className={`text-xs mt-1 font-mono ${weightDelta < 0 ? 'text-[#3ecf8e]' : 'text-red-400'}`}>
              {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg
            </p>
          )}
        </div>
        {/* Days */}
        <div className="bg-[#0f0f1a] border border-white/8 rounded-xl p-4">
          <p className="text-white/40 text-xs mb-1.5">Anzahl Tage</p>
          <p className="text-white font-mono text-lg font-bold">{data.length}</p>
          <p className="text-white/30 text-xs mt-1">{data[0]?.dateLabel} – {data[data.length - 1]?.dateLabel}</p>
        </div>
        {statData.map(m => (
          <div key={m.key} className="bg-[#0f0f1a] border border-white/8 rounded-xl p-4">
            <p className="text-white/40 text-xs mb-1.5">{m.label}</p>
            <p className="text-white font-mono text-lg font-bold" style={{ color: m.color }}>
              {fmt(m, m.clean)}{m.unit ? ` ${m.unit}` : ''}
            </p>
            {m.target && m.clean !== null && (
              <p className={`text-xs mt-1 font-mono ${m.clean >= m.target ? 'text-[#3ecf8e]' : 'text-red-400'}`}>
                Ziel: {m.isSleep ? formatSleep(Math.round(m.target)) : m.target}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Summary table */}
      <div className="bg-[#0f0f1a] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5">
          <h4 className="text-white font-semibold text-sm">Detailübersicht</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {['Metrik', 'Ø roh', 'Ø bereinigt', 'Min', 'Max', 'Anomalien'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-white/30 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statData.map((m, i) => (
                <tr key={m.key} className={`border-b border-white/3 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                      <span className="text-white/60">{m.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-white/50">{fmt(m, m.rawAvg)}</td>
                  <td className="px-4 py-2.5 font-mono text-white font-semibold">{fmt(m, m.clean)}</td>
                  <td className="px-4 py-2.5 font-mono text-white/50">{fmt(m, m.min)}</td>
                  <td className="px-4 py-2.5 font-mono text-white/50">{fmt(m, m.max)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full font-mono ${m.anomCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/30'}`}>
                      {m.anomCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function NutrilizeAnalyse({ data, clientProfile }) {
  const [activeTab, setActiveTab] = useState(0);
  const [notes, setNotes] = useState({});

  const handleNoteChange = useCallback((key, noteData) => {
    setNotes(prev => {
      if (noteData === null) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: noteData };
    });
  }, []);

  const cp = clientProfile || {};
  const chartProps = { data, notes, onNoteChange: handleNoteChange };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-[#0f0f1a] border border-white/8 rounded-xl p-1.5 overflow-x-auto">
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`flex-1 min-w-[70px] px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === i ? 'bg-[#3ecf8e] text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <OverviewTab data={data} clientProfile={cp} />}

      {activeTab === 1 && (
        <div>
          <MetricChart {...chartProps} metricKey="calories" label="Kalorien" color={COLORS.calories} unit="kcal" target={cp.kalorien_ziel} />
          <MetricChart {...chartProps} metricKey="protein" label="Protein" color={COLORS.protein} unit="g" target={cp.protein_ziel} />
          <MacroChart data={data} />
          <MetricChart {...chartProps} metricKey="fiber" label="Ballaststoffe" color={COLORS.fiber} unit="g" />
          <MetricChart {...chartProps} metricKey="sugar" label="Zucker" color={COLORS.sugar} unit="g" />
        </div>
      )}

      {activeTab === 2 && (
        <div>
          <MetricChart {...chartProps} metricKey="weight" label="Körpergewicht" color={COLORS.weight} unit="kg" />
          <MetricChart {...chartProps} metricKey="bodyFat" label="Körperfettanteil" color={COLORS.bodyFat} unit="%" />
          <MetricChart {...chartProps} metricKey="bmi" label="BMI" color={COLORS.bmi} unit="" />
        </div>
      )}

      {activeTab === 3 && (
        <div>
          <MetricChart {...chartProps} metricKey="steps" label="Schritte" color={COLORS.steps} unit="Schr."
            target={cp.schritte ? parseFloat(cp.schritte) : undefined} />
          <MetricChart {...chartProps} metricKey="burnedCalories" label="Verbrannte Kalorien" color={COLORS.burnedCalories} unit="kcal" />
          <MetricChart {...chartProps} metricKey="activityDuration" label="Aktivitätsdauer" color={COLORS.activityDuration} unit="min" />
        </div>
      )}

      {activeTab === 4 && (
        <div>
          <MetricChart {...chartProps} metricKey="sleepMinutes" label="Schlafdauer" color={COLORS.sleepMinutes} unit="h:mm" isSleep />
          <MetricChart {...chartProps} metricKey="hrv" label="HRV" color={COLORS.hrv} unit="ms" />
          <MetricChart {...chartProps} metricKey="restingHR" label="Ruhepuls" color={COLORS.restingHR} unit="bpm" />
        </div>
      )}
    </div>
  );
}