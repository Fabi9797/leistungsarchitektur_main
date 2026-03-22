import React, { useMemo, useCallback, useState } from 'react';
import { detectAnomalies, cleanAverage, movingAverage, formatSleep } from '@/lib/nutrilize-parser';
import { buildExerciseProgression } from '@/lib/training-parser';
import ChartCard from './ChartCard';
import StatRow from './StatRow';
import MetricLineChart from './MetricLineChart';
import MacroSection from './MacroSection';
import TrainingSection from './TrainingSection';

function complianceDays(data, metricKey, target, anomalies, tolerance = 0) {
  if (!target) return null;
  const total = data.filter((d, i) => !anomalies[i] && d[metricKey] !== null && d[metricKey] !== undefined).length;
  const hit = data.filter((d, i) => {
    if (anomalies[i] || d[metricKey] === null || d[metricKey] === undefined) return false;
    const v = d[metricKey];
    if (tolerance) return v >= target * (1 - tolerance) && v <= target * (1 + tolerance);
    return v >= target;
  }).length;
  return { hit, total };
}

function trendLabel(values) {
  if (values.length < 14) return 'Stabil';
  const valid = values.filter(v => v !== null);
  if (valid.length < 8) return 'Stabil';
  const first = valid.slice(0, Math.min(7, Math.floor(valid.length / 2)));
  const last = valid.slice(-Math.min(7, Math.floor(valid.length / 2)));
  const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
  const avgLast = last.reduce((a, b) => a + b, 0) / last.length;
  if (avgLast > avgFirst * 1.02) return 'Steigend';
  if (avgLast < avgFirst * 0.98) return 'Fallend';
  return 'Stabil';
}

export default function ReportAnalysis({ nutriData, trainingSessions, clientProfile, notes, onNoteChange }) {
  const cp = clientProfile || {};

  // ── Derived metrics ────────────────────────────────────────────────────────
  const withMemo = (key) => {
    const vals = nutriData.map(d => d[key]);
    const anomalies = detectAnomalies(vals);
    const avg = cleanAverage(vals, anomalies);
    const valid = vals.filter((v, i) => !anomalies[i] && v !== null && !isNaN(v));
    return { vals, anomalies, avg, min: valid.length ? Math.min(...valid) : null, max: valid.length ? Math.max(...valid) : null };
  };

  const weight = useMemo(() => withMemo('weight'), [nutriData]);
  const calories = useMemo(() => withMemo('calories'), [nutriData]);
  const protein = useMemo(() => withMemo('protein'), [nutriData]);
  const steps = useMemo(() => withMemo('steps'), [nutriData]);
  const hrv = useMemo(() => withMemo('hrv'), [nutriData]);
  const rhr = useMemo(() => withMemo('restingHR'), [nutriData]);
  const sleep = useMemo(() => withMemo('sleepMinutes'), [nutriData]);

  const weightFirst = nutriData.find(d => d.weight > 0)?.weight;
  const weightLast = [...nutriData].reverse().find(d => d.weight > 0)?.weight;
  const weightDelta = weightFirst && weightLast ? (weightLast - weightFirst) : null;

  const calTarget = cp.kalorien_ziel;
  const protTarget = cp.protein_ziel;
  const stepsTarget = cp.schritte ? parseFloat(String(cp.schritte).replace(/\D/g, '')) || null : null;
  const sleepTargetH = 8; // default 8 hours in minutes = 480
  const sleepTargetMin = 480;

  const calCompliance = useMemo(() => complianceDays(nutriData, 'calories', calTarget, calories.anomalies, 0.1), [nutriData, calTarget, calories.anomalies]);
  const protCompliance = useMemo(() => complianceDays(nutriData, 'protein', protTarget, protein.anomalies), [nutriData, protTarget, protein.anomalies]);
  const stepsCompliance = useMemo(() => complianceDays(nutriData, 'steps', stepsTarget, steps.anomalies), [nutriData, stepsTarget, steps.anomalies]);
  const sleepCompliance = useMemo(() => complianceDays(nutriData, 'sleepMinutes', sleepTargetMin, sleep.anomalies), [nutriData, sleep.anomalies]);

  const hrvTrend = useMemo(() => trendLabel(hrv.vals), [hrv.vals]);
  const rhrTrend = useMemo(() => trendLabel(rhr.vals), [rhr.vals]);

  const exerciseProgressions = useMemo(() => trainingSessions ? buildExerciseProgression(trainingSessions) : [], [trainingSessions]);

  const chartProps = (key, label) => ({
    data: nutriData, metricKey: key, label, notes, onNoteChange,
  });

  const fmtDelta = (d) => {
    if (d === null) return null;
    return { value: `${d > 0 ? '+' : ''}${d.toFixed(1)} kg`, subColor: d < 0 ? 'text-[#007B7F]' : 'text-[#C0616A]' };
  };
  const deltaInfo = fmtDelta(weightDelta);
  const trendIcon = (t, lowerBetter = false) => {
    if (t === 'Stabil') return { icon: '→', color: '#00000050' };
    const up = t === 'Steigend';
    const good = lowerBetter ? !up : up;
    return { icon: up ? '↑' : '↓', color: good ? '#007B7F' : '#C0616A' };
  };

  return (
    <div>
      {/* 1: Gewicht */}
      <ChartCard title="Gewicht-Trend" badge={weight.avg ? `Ø ${weight.avg.toFixed(1)} kg` : undefined}>
        <StatRow stats={[
          { label: 'Start', value: weightFirst ? `${weightFirst.toFixed(1)} kg` : '–', color: '#00416A' },
          { label: 'Aktuell', value: weightLast ? `${weightLast.toFixed(1)} kg` : '–', color: '#00416A' },
          { label: 'Delta', value: deltaInfo?.value || '–', subColor: deltaInfo?.subColor },
          { label: 'Ø bereinigt', value: weight.avg ? `${weight.avg.toFixed(1)} kg` : '–', color: '#00416A' },
        ]} />
        <MetricLineChart {...chartProps('weight', 'Gewicht')} color="#00416A" unit="kg"
          secondaryKey="bodyFat" secondaryColor="#C8973A" secondaryLabel="KFA %" />
      </ChartCard>

      {/* 2: Kalorien */}
      <ChartCard title="Kalorienaufnahme" badge={calCompliance ? `${calCompliance.hit}/${calCompliance.total} Tage im Ziel` : undefined}>
        <StatRow stats={[
          { label: 'Ø Kalorien (bereinigt)', value: calories.avg ? `${Math.round(calories.avg)} kcal` : '–', color: '#C8973A' },
          { label: 'Kalorienziel', value: calTarget ? `${calTarget} kcal` : '–', color: '#00000050' },
          { label: 'Min', value: calories.min ? `${Math.round(calories.min)} kcal` : '–' },
          { label: 'Max', value: calories.max ? `${Math.round(calories.max)} kcal` : '–' },
        ]} />
        {calCompliance && (
          <div className={`text-sm font-mono mb-3 px-3 py-2 rounded-xl border ${
            calCompliance.hit / calCompliance.total > 0.7
              ? 'bg-[#007B7F]/10 border-[#007B7F]/20 text-[#007B7F]'
              : 'bg-[#C0616A]/10 border-[#C0616A]/20 text-[#C0616A]'
          }`}>
            {calCompliance.hit} von {calCompliance.total} Tagen im Zielkorridor (±10%)
          </div>
        )}
        <MetricLineChart {...chartProps('calories', 'Kalorien')} color="#3ecf8e" unit="kcal" target={calTarget} />
      </ChartCard>

      {/* 3: Makros */}
      <MacroSection data={nutriData} proteinTarget={protTarget} notes={notes} onNoteChange={onNoteChange} />

      {/* 4: Schritte */}
      <ChartCard title="Schritte / Alltagsbewegung" badge={stepsCompliance ? `${stepsCompliance.hit}/${stepsCompliance.total} Tage Ziel erreicht` : undefined}>
        <StatRow stats={[
          { label: 'Ø Schritte (bereinigt)', value: steps.avg ? `${Math.round(steps.avg).toLocaleString()}` : '–', color: '#f39c12' },
          { label: 'Schritte-Ziel', value: stepsTarget ? stepsTarget.toLocaleString() : '–', color: '#ffffff50' },
          { label: 'Min', value: steps.min ? Math.round(steps.min).toLocaleString() : '–' },
          { label: 'Max', value: steps.max ? Math.round(steps.max).toLocaleString() : '–' },
        ]} />
        <MetricLineChart {...chartProps('steps', 'Schritte')} color="#f39c12" target={stepsTarget} />
      </ChartCard>

      {/* 5: HRV */}
      <ChartCard title="HRV-Trend" badge={(() => { const ti = trendIcon(hrvTrend); return `${ti.icon} ${hrvTrend}`; })()}>
        <StatRow stats={[
          { label: 'Ø HRV (bereinigt)', value: hrv.avg ? `${hrv.avg.toFixed(0)} ms` : '–', color: '#a29bfe' },
          { label: 'Trend', value: hrvTrend, color: trendIcon(hrvTrend).color },
          { label: 'Min', value: hrv.min ? `${hrv.min.toFixed(0)} ms` : '–' },
          { label: 'Max', value: hrv.max ? `${hrv.max.toFixed(0)} ms` : '–' },
        ]} />
        <MetricLineChart {...chartProps('hrv', 'HRV')} color="#a29bfe" unit="ms" />
      </ChartCard>

      {/* 6: Ruhepuls */}
      <ChartCard title="Ruhepuls-Trend" badge={(() => { const ti = trendIcon(rhrTrend, true); return `${ti.icon} ${rhrTrend}`; })()}>
        <StatRow stats={[
          { label: 'Ø Ruhepuls (bereinigt)', value: rhr.avg ? `${rhr.avg.toFixed(0)} bpm` : '–', color: '#fd79a8' },
          { label: 'Trend', value: rhrTrend, color: trendIcon(rhrTrend, true).color },
          { label: 'Min', value: rhr.min ? `${rhr.min.toFixed(0)} bpm` : '–' },
          { label: 'Max', value: rhr.max ? `${rhr.max.toFixed(0)} bpm` : '–' },
        ]} />
        <MetricLineChart {...chartProps('restingHR', 'Ruhepuls')} color="#fd79a8" unit="bpm" />
      </ChartCard>

      {/* 7: Schlaf */}
      <ChartCard title="Schlafdauer" badge={sleepCompliance ? `${sleepCompliance.hit}/${sleepCompliance.total} Tage ≥8h` : undefined}>
        <StatRow stats={[
          { label: 'Ø Schlaf (bereinigt)', value: sleep.avg ? formatSleep(Math.round(sleep.avg)) : '–', color: '#74b9ff' },
          { label: 'Schlafziel', value: '8:00 h', color: '#ffffff50' },
          { label: 'Min', value: sleep.min ? formatSleep(Math.round(sleep.min)) : '–' },
          { label: 'Max', value: sleep.max ? formatSleep(Math.round(sleep.max)) : '–' },
        ]} />
        <MetricLineChart {...chartProps('sleepMinutes', 'Schlaf')} color="#74b9ff" unit="h:mm" isSleep target={sleepTargetMin} />
      </ChartCard>

      {/* 8: Training */}
      {trainingSessions && trainingSessions.length > 0 && (
        <TrainingSection sessions={trainingSessions} exerciseProgressions={exerciseProgressions} />
      )}
    </div>
  );
}