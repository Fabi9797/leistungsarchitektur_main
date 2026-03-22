import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Area
} from 'recharts';
import { movingAverage, detectAnomalies, formatSleep } from '@/lib/nutrilize-parser';

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  indigo:     '#00416A',
  indigoDark: '#002D4A',
  teal:       '#007B7F',
  gold:       '#C8973A',
  rose:       '#C0616A',
  sky:        '#4A90B8',
  lavender:   '#5B6DAE',
  eggshell:   '#F0EAD6',
  eggshellDk: '#E4D9C0',
  black:      '#1A1A2E',
  gray:       '#6B7280',
  lightGray:  '#F8F7F4',
  white:      '#FFFFFF',
};

const PAGE_W = 794;
const PAGE_H = 1123;
const MARGIN = 50;
const INNER_W = PAGE_W - MARGIN * 2;

// ─── Shared layout primitives ─────────────────────────────────────────────────

function PageWrapper({ children, pageNum, totalPages, report }) {
  return (
    <div style={{
      width: PAGE_W, minHeight: PAGE_H, background: C.white,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      color: C.black, position: 'relative', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Page header strip */}
      <div style={{
        background: C.indigo, height: 6, width: '100%', flexShrink: 0,
      }} />
      {/* Sub-header */}
      <div style={{
        padding: '10px 50px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: `1px solid ${C.eggshellDk}`,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 9, color: C.indigo, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Leistungsarchitektur
        </span>
        <span style={{ fontSize: 9, color: C.gray }}>
          {report?.client_name} · {report?.report_label || report?.report_month}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: `24px ${MARGIN}px 60px` }}>
        {children}
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 50px', borderTop: `1px solid ${C.eggshellDk}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: C.white,
      }}>
        <span style={{ fontSize: 9, color: C.gray }}>
          Monatsbericht {report?.report_label || report?.report_month} · {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
        </span>
        <span style={{ fontSize: 9, color: C.gray }}>Seite {pageNum} / {totalPages}</span>
      </div>
    </div>
  );
}

function SectionTitle({ children, color, size = 12 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 4 }}>
      <div style={{ width: 4, height: 18, borderRadius: 2, background: color || C.indigo, flexShrink: 0 }} />
      <h3 style={{ margin: 0, fontSize: size, fontWeight: 700, color: C.indigo, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {children}
      </h3>
    </div>
  );
}

function MetricCard({ label, value, unit, delta, deltaGood, accent }) {
  return (
    <div style={{
      background: C.lightGray, border: `1px solid ${C.eggshellDk}`,
      borderTop: `3px solid ${accent || C.indigo}`,
      borderRadius: 8, padding: '10px 12px', minWidth: 0,
    }}>
      <div style={{ fontSize: 9, color: C.gray, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color: accent || C.indigo, fontFamily: 'monospace', lineHeight: 1.1 }}>
        {value ?? '–'}
        {unit && <span style={{ fontSize: 9, color: C.gray, fontWeight: 400, marginLeft: 3 }}>{unit}</span>}
      </div>
      {delta !== undefined && delta !== null && (
        <div style={{ fontSize: 9, color: deltaGood ? C.teal : C.rose, marginTop: 3, fontWeight: 700 }}>
          {delta > 0 ? '+' : ''}{typeof delta === 'number' ? delta.toFixed(1) : delta} kg
        </div>
      )}
    </div>
  );
}

function ComplianceBar({ label, value, color }) {
  const v = Math.min(100, Math.max(0, value || 0));
  const good = v >= 70;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: C.black, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: good ? C.teal : C.rose, fontFamily: 'monospace' }}>{v}%</span>
      </div>
      <div style={{ height: 8, background: C.eggshellDk, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${v}%`, height: '100%', background: color || C.indigo, borderRadius: 4 }} />
      </div>
    </div>
  );
}

function SubjBar({ label, before, after }) {
  const pct = v => Math.min(100, (v / 10) * 100);
  const better = after >= before;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: C.black, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, color: C.gray, fontFamily: 'monospace' }}>
          {before ?? '–'} → <span style={{ color: better ? C.teal : C.rose, fontWeight: 800 }}>{after ?? '–'}</span> /10
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        <div style={{ height: 7, background: C.eggshellDk, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${pct(before || 0)}%`, height: '100%', background: C.lavender, borderRadius: 3 }} />
        </div>
        <div style={{ height: 7, background: C.eggshellDk, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${pct(after || 0)}%`, height: '100%', background: better ? C.teal : C.rose, borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ trend, lowerBetter = false }) {
  if (!trend) return null;
  const up = trend === 'Steigend';
  const good = lowerBetter ? !up : up;
  const neutral = trend === 'Stabil';
  return (
    <span style={{
      fontSize: 10, fontWeight: 700,
      color: neutral ? C.gray : good ? C.teal : C.rose,
      background: neutral ? '#F3F4F6' : good ? '#ECFDF5' : '#FEF2F2',
      border: `1px solid ${neutral ? '#E5E7EB' : good ? '#A7F3D0' : '#FECACA'}`,
      borderRadius: 4, padding: '2px 6px',
    }}>
      {trend === 'Steigend' ? '↑' : trend === 'Fallend' ? '↓' : '→'} {trend}
    </span>
  );
}

// ─── Inline SVG chart (drawn manually — no React needed for static capture) ──

function buildChartSVG({ data, color, height = 160, width = INNER_W, target, unit, isSleep, movAvg }) {
  if (!data || data.length === 0) return null;
  const vals = data.map(d => d.value).filter(v => v !== null && v !== undefined);
  if (vals.length === 0) return null;

  const pad = { top: 16, right: 16, bottom: 28, left: 42 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const minV = Math.min(...vals) * 0.97;
  const maxV = Math.max(...vals) * 1.03;
  const range = maxV - minV || 1;

  const toX = i => (i / (data.length - 1)) * chartW;
  const toY = v => chartH - ((v - minV) / range) * chartH;

  // Line path
  const points = data.map((d, i) => {
    if (d.value == null) return null;
    return `${toX(i).toFixed(1)},${toY(d.value).toFixed(1)}`;
  }).filter(Boolean);

  const linePath = `M ${points.join(' L ')}`;

  // Moving average path
  let maPath = '';
  if (movAvg) {
    const maPoints = movAvg.map((v, i) => {
      if (v == null) return null;
      return `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`;
    }).filter(Boolean);
    if (maPoints.length > 1) maPath = `M ${maPoints.join(' L ')}`;
  }

  // Axis labels (x: show ~5 labels)
  const xLabels = [];
  const step = Math.max(1, Math.floor(data.length / 5));
  for (let i = 0; i < data.length; i += step) {
    const d = data[i];
    const label = d.date ? d.date.slice(5) : ''; // MM-DD
    xLabels.push({ x: toX(i), label });
  }

  // Y labels
  const ySteps = 4;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const v = minV + (range / ySteps) * i;
    return { y: toY(v), label: isSleep ? formatSleep(Math.round(v)) : v.toFixed(0) };
  });

  // Target line
  const targetY = target !== undefined ? toY(Math.max(minV, Math.min(maxV, target))) : null;

  const svgLines = [];
  // Grid lines
  for (let i = 0; i <= ySteps; i++) {
    const y = (chartH / ySteps) * i;
    svgLines.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${chartW}" y2="${y.toFixed(1)}" stroke="#E5E7EB" stroke-width="0.8"/>`);
  }

  const yLabelsSvg = yLabels.map(l =>
    `<text x="-6" y="${(l.y + 4).toFixed(1)}" text-anchor="end" font-size="8" fill="#9CA3AF">${l.label}</text>`
  ).join('');

  const xLabelsSvg = xLabels.map(l =>
    `<text x="${l.x.toFixed(1)}" y="${(chartH + 16).toFixed(1)}" text-anchor="middle" font-size="8" fill="#9CA3AF">${l.label}</text>`
  ).join('');

  const targetSvg = targetY !== null
    ? `<line x1="0" y1="${targetY.toFixed(1)}" x2="${chartW}" y2="${targetY.toFixed(1)}" stroke="${C.gold}" stroke-width="1.2" stroke-dasharray="4,3"/>`
    : '';

  const maSvg = maPath
    ? `<path d="${maPath}" fill="none" stroke="${color}99" stroke-width="1.5" stroke-dasharray="none"/>`
    : '';

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" style="background:transparent">
  <g transform="translate(${pad.left},${pad.top})">
    ${svgLines.join('')}
    ${targetSvg}
    ${yLabelsSvg}
    ${xLabelsSvg}
    ${maSvg}
    <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  </g>
</svg>`;
}

function InlineSVGChart({ data, color, height = 160, width = INNER_W, target, unit, isSleep }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height, width, background: C.lightGray, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 10, color: C.gray }}>Keine Daten</span>
      </div>
    );
  }
  const vals = data.map(d => d.value);
  const maVals = movingAverage(data.map((_, i) => ({ value: vals[i] })), 'value', 7);
  const svg = buildChartSVG({ data, color, height, width, target, unit, isSleep, movAvg: maVals });
  if (!svg) return null;
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

function MiniLineChart({ dataPoints, color, width = 280, height = 80 }) {
  if (!dataPoints || dataPoints.length < 2) return (
    <div style={{ height, width, background: C.lightGray, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 9, color: C.gray }}>–</span>
    </div>
  );
  const data = dataPoints.map(d => ({ date: d.date, value: d.e1rm }));
  const svg = buildChartSVG({ data, color, height, width, movAvg: null });
  if (!svg) return null;
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

// ─── PAGE 1: Overview ─────────────────────────────────────────────────────────

function Page1({ fd, totalPages }) {
  const weightDelta = fd.gewicht_start && fd.gewicht_end ? (fd.gewicht_end - fd.gewicht_start) : null;

  const metrics = [
    { label: 'Gewicht Start', value: fd.gewicht_start, unit: 'kg', accent: C.indigo },
    { label: 'Gewicht Ende', value: fd.gewicht_end, unit: 'kg', delta: weightDelta, deltaGood: weightDelta < 0, accent: C.indigo },
    { label: 'KFA Start', value: fd.kfa_start, unit: '%', accent: C.gold },
    { label: 'KFA Ende', value: fd.kfa_end, unit: '%', accent: C.gold },
    { label: 'Ø Kalorien', value: fd.kalorien_avg, unit: 'kcal', accent: C.gold },
    { label: 'Ø Protein', value: fd.protein_avg, unit: 'g', accent: C.teal },
    { label: 'Ø HRV', value: fd.hrv_avg, unit: 'ms', accent: C.lavender },
    { label: 'Ø Ruhepuls', value: fd.ruhepuls_avg, unit: 'bpm', accent: C.rose },
    { label: 'Ø Schlaf', value: fd.schlafdauer_avg, unit: 'h', accent: C.sky },
    { label: 'Gesamtbewertung', value: fd.gesamtbewertung, unit: '/ 10', accent: C.indigo },
  ].filter(m => m.value !== undefined && m.value !== null && m.value !== '');

  const hasSubj = fd.energie_vorher || fd.stress_vorher || fd.schlaf_vorher;
  const hasComp = fd.training_compliance || fd.ernaehrung_compliance || fd.supplement_compliance;

  return (
    <PageWrapper pageNum={1} totalPages={totalPages} report={fd}>
      {/* Hero header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.indigo} 0%, ${C.indigoDark} 100%)`,
        borderRadius: 12, padding: '28px 32px', marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
              Leistungsarchitektur · Monatsbericht
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.white, lineHeight: 1.1, marginBottom: 4 }}>
              {fd.report_label || fd.report_month || '—'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: 400 }}>
              {fd.client_name || '—'}
            </div>
          </div>
          {fd.gesamtbewertung && (
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '12px 20px' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Bewertung</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.white, fontFamily: 'monospace', lineHeight: 1 }}>{fd.gesamtbewertung}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>/ 10</div>
            </div>
          )}
        </div>
      </div>

      {/* Highlight */}
      {fd.highlight_des_monats && (
        <div style={{
          background: `linear-gradient(135deg, ${C.eggshell}, ${C.eggshellDk})`,
          border: `1px solid ${C.eggshellDk}`, borderLeft: `4px solid ${C.gold}`,
          borderRadius: 8, padding: '12px 16px', marginBottom: 18,
        }}>
          <div style={{ fontSize: 9, color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>
            🏆 Highlight des Monats
          </div>
          <p style={{ margin: 0, fontSize: 12, color: C.black, lineHeight: 1.7 }}>{fd.highlight_des_monats}</p>
        </div>
      )}

      {/* Kernmetriken */}
      {metrics.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <SectionTitle color={C.indigo}>Kernmetriken</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
          </div>
        </div>
      )}

      {/* Subjektiv + Compliance side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {hasSubj && (
          <div style={{ background: C.lightGray, borderRadius: 10, padding: '16px 18px', border: `1px solid ${C.eggshellDk}` }}>
            <SectionTitle color={C.lavender}>Subjektive Wahrnehmung</SectionTitle>
            <div style={{ fontSize: 8, color: C.gray, marginBottom: 8, display: 'flex', gap: 16 }}>
              <span style={{ color: C.lavender }}>■ Vorher</span>
              <span style={{ color: C.teal }}>■ Nachher</span>
            </div>
            {fd.energie_vorher != null && <SubjBar label="Energie" before={fd.energie_vorher} after={fd.energie_nachher} />}
            {fd.stress_vorher != null && <SubjBar label="Stress" before={fd.stress_vorher} after={fd.stress_nachher} />}
            {fd.schlaf_vorher != null && <SubjBar label="Schlafqualität" before={fd.schlaf_vorher} after={fd.schlaf_nachher} />}
          </div>
        )}
        {hasComp && (
          <div style={{ background: C.lightGray, borderRadius: 10, padding: '16px 18px', border: `1px solid ${C.eggshellDk}` }}>
            <SectionTitle color={C.teal}>Compliance</SectionTitle>
            {fd.training_compliance != null && <ComplianceBar label="Training" value={fd.training_compliance} color={C.indigo} />}
            {fd.ernaehrung_compliance != null && <ComplianceBar label="Ernährung" value={fd.ernaehrung_compliance} color={C.gold} />}
            {fd.supplement_compliance != null && <ComplianceBar label="Supplemente" value={fd.supplement_compliance} color={C.teal} />}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// ─── PAGE 2: Körper & Ernährung ───────────────────────────────────────────────

function Page2({ fd, nutriData, totalPages }) {
  const weightData = nutriData.length > 0
    ? nutriData.filter(d => d.weight > 0).map(d => ({ date: d.date, value: d.weight }))
    : (() => { try { return JSON.parse(fd.gewicht_verlauf_json || '[]'); } catch { return []; } })();

  const calData = nutriData.map(d => ({ date: d.date, value: d.calories })).filter(d => d.value);
  const protData = nutriData.map(d => ({ date: d.date, value: d.protein })).filter(d => d.value);

  const weightDelta = fd.gewicht_start && fd.gewicht_end ? (fd.gewicht_end - fd.gewicht_start) : null;

  return (
    <PageWrapper pageNum={2} totalPages={totalPages} report={fd}>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.indigo, marginBottom: 20 }}>Körper & Ernährung</div>

      {/* Weight chart */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <SectionTitle color={C.indigo}>Gewicht-Trend</SectionTitle>
          <div style={{ display: 'flex', gap: 12, fontSize: 10, color: C.gray }}>
            {fd.gewicht_start && <span>Start: <b style={{ color: C.indigo }}>{fd.gewicht_start} kg</b></span>}
            {fd.gewicht_end && <span>Aktuell: <b style={{ color: C.indigo }}>{fd.gewicht_end} kg</b></span>}
            {weightDelta != null && <span style={{ color: weightDelta < 0 ? C.teal : C.rose, fontWeight: 700 }}>{weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} kg</span>}
          </div>
        </div>
        <div style={{ background: C.lightGray, border: `1px solid ${C.eggshellDk}`, borderRadius: 10, padding: '16px' }}>
          <InlineSVGChart data={weightData} color={C.indigo} height={150} width={INNER_W - 32} unit="kg" />
        </div>
      </div>

      {/* Calories chart */}
      {calData.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <SectionTitle color={C.gold}>Kalorienaufnahme</SectionTitle>
            <div style={{ fontSize: 10, color: C.gray }}>
              {fd.kalorien_avg && <span>Ø <b style={{ color: C.gold }}>{fd.kalorien_avg} kcal</b></span>}
              {fd.kalorien_ziel && <span style={{ marginLeft: 12 }}>Ziel: <b>{fd.kalorien_ziel} kcal</b></span>}
            </div>
          </div>
          <div style={{ background: C.lightGray, border: `1px solid ${C.eggshellDk}`, borderRadius: 10, padding: '16px' }}>
            <InlineSVGChart data={calData} color={C.gold} height={140} width={INNER_W - 32} unit="kcal" target={fd.kalorien_ziel} />
          </div>
        </div>
      )}

      {/* Protein chart */}
      {protData.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <SectionTitle color={C.teal}>Proteinaufnahme</SectionTitle>
            <div style={{ fontSize: 10, color: C.gray }}>
              {fd.protein_avg && <span>Ø <b style={{ color: C.teal }}>{fd.protein_avg} g</b></span>}
              {fd.protein_ziel && <span style={{ marginLeft: 12 }}>Ziel: <b>{fd.protein_ziel} g</b></span>}
            </div>
          </div>
          <div style={{ background: C.lightGray, border: `1px solid ${C.eggshellDk}`, borderRadius: 10, padding: '16px' }}>
            <InlineSVGChart data={protData} color={C.teal} height={130} width={INNER_W - 32} unit="g" target={fd.protein_ziel} />
          </div>
        </div>
      )}
    </PageWrapper>
  );
}

// ─── PAGE 3: Recovery & Bewegung ─────────────────────────────────────────────

function Page3({ fd, nutriData, totalPages }) {
  const hrvData = nutriData.length > 0
    ? nutriData.map(d => ({ date: d.date, value: d.hrv })).filter(d => d.value)
    : (() => { try { return JSON.parse(fd.hrv_verlauf_json || '[]'); } catch { return []; } })();

  const rhrData = nutriData.length > 0
    ? nutriData.map(d => ({ date: d.date, value: d.restingHR })).filter(d => d.value)
    : (() => { try { return JSON.parse(fd.ruhepuls_verlauf_json || '[]'); } catch { return []; } })();

  const sleepData = nutriData.map(d => ({ date: d.date, value: d.sleepMinutes })).filter(d => d.value);
  const stepsData = nutriData.map(d => ({ date: d.date, value: d.steps })).filter(d => d.value);
  const stepsTarget = fd.schritte ? parseFloat(String(fd.schritte).replace(/\D/g, '')) || null : null;

  return (
    <PageWrapper pageNum={3} totalPages={totalPages} report={fd}>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.indigo, marginBottom: 20 }}>Recovery & Bewegung</div>

      {/* HRV */}
      {(hrvData.length > 0) && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <SectionTitle color={C.lavender}>HRV-Trend</SectionTitle>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 10, color: C.gray }}>
              {fd.hrv_avg && <span>Ø <b style={{ color: C.lavender }}>{fd.hrv_avg} ms</b></span>}
              <TrendBadge trend={fd.hrv_trend} />
            </div>
          </div>
          <div style={{ background: C.lightGray, border: `1px solid ${C.eggshellDk}`, borderRadius: 10, padding: '16px' }}>
            <InlineSVGChart data={hrvData} color={C.lavender} height={130} width={INNER_W - 32} unit="ms" />
          </div>
        </div>
      )}

      {/* Ruhepuls */}
      {(rhrData.length > 0) && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <SectionTitle color={C.rose}>Ruhepuls-Trend</SectionTitle>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 10, color: C.gray }}>
              {fd.ruhepuls_avg && <span>Ø <b style={{ color: C.rose }}>{fd.ruhepuls_avg} bpm</b></span>}
              <TrendBadge trend={fd.ruhepuls_trend} lowerBetter />
            </div>
          </div>
          <div style={{ background: C.lightGray, border: `1px solid ${C.eggshellDk}`, borderRadius: 10, padding: '16px' }}>
            <InlineSVGChart data={rhrData} color={C.rose} height={130} width={INNER_W - 32} unit="bpm" />
          </div>
        </div>
      )}

      {/* Sleep + Steps side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {sleepData.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <SectionTitle color={C.sky}>Schlaf</SectionTitle>
              {fd.schlafdauer_avg && <span style={{ fontSize: 10, color: C.gray }}>Ø <b style={{ color: C.sky }}>{fd.schlafdauer_avg}h</b></span>}
            </div>
            <div style={{ background: C.lightGray, border: `1px solid ${C.eggshellDk}`, borderRadius: 10, padding: '12px' }}>
              <InlineSVGChart data={sleepData} color={C.sky} height={120} width={(INNER_W / 2) - 32} isSleep target={480} />
            </div>
          </div>
        )}
        {stepsData.length > 0 && (
          <div>
            <SectionTitle color={C.teal}>Schritte</SectionTitle>
            <div style={{ background: C.lightGray, border: `1px solid ${C.eggshellDk}`, borderRadius: 10, padding: '12px' }}>
              <InlineSVGChart data={stepsData} color={C.teal} height={120} width={(INNER_W / 2) - 32} target={stepsTarget} />
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

// ─── PAGE 4: Training ─────────────────────────────────────────────────────────

function Page4({ fd, trainingSessions, exerciseProgressions, totalPages }) {
  const sessions = trainingSessions || [];
  const gkCount = sessions.filter(s => s.type?.match(/GK/i)).length;
  const lissCount = sessions.filter(s => s.type?.match(/LISS/i)).length;
  const top6 = (exerciseProgressions || []).slice(0, 6);
  const EX_COLORS = [C.indigo, C.gold, C.teal, C.lavender, C.rose, C.sky];

  return (
    <PageWrapper pageNum={4} totalPages={totalPages} report={fd}>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.indigo, marginBottom: 20 }}>Trainingsprogression</div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Gesamt Einheiten', value: sessions.length, color: C.indigo },
          { label: 'GK-Einheiten', value: gkCount, color: C.lavender },
          { label: 'LISS-Einheiten', value: lissCount, color: C.sky },
        ].map((s, i) => (
          <div key={i} style={{ background: C.lightGray, borderRadius: 10, padding: '16px 20px', border: `1px solid ${C.eggshellDk}`, borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 9, color: C.gray, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Exercise cards */}
      {top6.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {top6.map((ex, i) => {
            const color = EX_COLORS[i % EX_COLORS.length];
            const pctGood = ex.progressPct >= 0;
            const cardW = (INNER_W / 2) - 22;
            return (
              <div key={ex.name} style={{
                background: C.lightGray, border: `1px solid ${C.eggshellDk}`,
                borderTop: `3px solid ${color}`, borderRadius: 10, padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.indigo, maxWidth: '70%', lineHeight: 1.3 }}>{ex.name}</div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: pctGood ? C.teal : C.rose, fontFamily: 'monospace' }}>
                    {pctGood ? '+' : ''}{ex.progressPct.toFixed(1)}%
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 9, color: C.gray, marginBottom: 8 }}>
                  <span>Start: <b style={{ color: C.black, fontFamily: 'monospace' }}>{ex.dataPoints[0]?.e1rm?.toFixed(1)} kg</b></span>
                  <span>Aktuell: <b style={{ color: C.black, fontFamily: 'monospace' }}>{ex.dataPoints[ex.dataPoints.length - 1]?.e1rm?.toFixed(1)} kg</b></span>
                </div>
                <MiniLineChart dataPoints={ex.dataPoints} color={color} width={cardW - 32} height={70} />
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 40, color: C.gray, fontSize: 12 }}>
          Keine Trainings-Progressionsdaten vorhanden
        </div>
      )}
    </PageWrapper>
  );
}

// ─── PAGE 5: Coach Zusammenfassung ────────────────────────────────────────────

function Page5({ fd, totalPages }) {
  return (
    <PageWrapper pageNum={5} totalPages={totalPages} report={fd}>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.indigo, marginBottom: 20 }}>Coach Zusammenfassung</div>

      {fd.coach_kommentar && (
        <div style={{
          background: C.lightGray, border: `1px solid ${C.eggshellDk}`,
          borderLeft: `5px solid ${C.indigo}`,
          borderRadius: 10, padding: '20px 22px', marginBottom: 20,
        }}>
          <SectionTitle color={C.indigo}>Coach-Kommentar</SectionTitle>
          <p style={{ margin: 0, fontSize: 12, color: C.black, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{fd.coach_kommentar}</p>
        </div>
      )}

      {fd.reflexion_kunde && (
        <div style={{
          background: C.lightGray, border: `1px solid ${C.eggshellDk}`,
          borderLeft: `5px solid ${C.lavender}`,
          borderRadius: 10, padding: '20px 22px', marginBottom: 20,
        }}>
          <SectionTitle color={C.lavender}>Reflexion des Klienten</SectionTitle>
          <p style={{ margin: 0, fontSize: 12, color: C.black, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{fd.reflexion_kunde}</p>
        </div>
      )}

      {fd.fokus_naechster_monat && (
        <div style={{
          background: `linear-gradient(135deg, #EAF7F7, #D8F0F0)`,
          border: `1px solid ${C.teal}40`,
          borderLeft: `5px solid ${C.teal}`,
          borderRadius: 10, padding: '20px 22px',
        }}>
          <SectionTitle color={C.teal}>Fokus nächster Monat</SectionTitle>
          <p style={{ margin: 0, fontSize: 12, color: C.black, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{fd.fokus_naechster_monat}</p>
        </div>
      )}

      {!fd.coach_kommentar && !fd.reflexion_kunde && !fd.fokus_naechster_monat && (
        <div style={{ textAlign: 'center', padding: 60, color: C.gray, fontSize: 12 }}>
          Keine Coach-Einträge vorhanden
        </div>
      )}
    </PageWrapper>
  );
}

// ─── Full Report (all pages stacked for html2canvas) ─────────────────────────

function FullReport({ formData, nutriData, trainingSessions, exerciseProgressions }) {
  const fd = formData || {};

  const hasBody = nutriData.length > 0 || fd.gewicht_verlauf_json;
  const hasRecovery = nutriData.length > 0 || fd.hrv_verlauf_json || fd.ruhepuls_verlauf_json;
  const hasTraining = trainingSessions?.length > 0;

  let pages = 1;
  if (hasBody) pages++;
  if (hasRecovery) pages++;
  if (hasTraining) pages++;
  pages++; // coach summary always last

  let pageNum = 1;
  const totalPages = pages;

  return (
    <div style={{ width: PAGE_W, fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      <Page1 fd={fd} totalPages={totalPages} />
      {hasBody && <Page2 fd={fd} nutriData={nutriData} totalPages={totalPages} />}
      {hasRecovery && <Page3 fd={fd} nutriData={nutriData} totalPages={totalPages} />}
      {hasTraining && <Page4 fd={fd} trainingSessions={trainingSessions} exerciseProgressions={exerciseProgressions} totalPages={totalPages} />}
      <Page5 fd={fd} totalPages={totalPages} />
    </div>
  );
}

// ─── Export Button ────────────────────────────────────────────────────────────

export default function PdfExportButton({ formData, nutriData = [], trainingSessions = [], exerciseProgressions = [] }) {
  const [exporting, setExporting] = useState(false);
  const containerRef = useRef(null);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const el = containerRef.current;
      if (!el) return;

      el.style.display = 'block';
      // Wait for SVGs and layout to render
      await new Promise(r => setTimeout(r, 400));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        allowTaint: true,
      });

      el.style.display = 'none';

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfW = pdf.internal.pageSize.getWidth();   // 595.28 pt
      const pdfH = pdf.internal.pageSize.getHeight();  // 841.89 pt

      // Canvas is stacked pages each 794px wide, PAGE_H px tall (at 2x scale)
      const canvasPageH = PAGE_H * 2; // at scale=2
      const canvasW = canvas.width;
      const totalCanvasH = canvas.height;
      const numPages = Math.ceil(totalCanvasH / canvasPageH);

      for (let i = 0; i < numPages; i++) {
        if (i > 0) pdf.addPage();

        const srcY = i * canvasPageH;
        const srcH = Math.min(canvasPageH, totalCanvasH - srcY);

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvasW;
        sliceCanvas.height = srcH;
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, -srcY);

        const imgData = sliceCanvas.toDataURL('image/png');
        const imgH = (srcH / canvasW) * pdfW;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, imgH);
      }

      const fileName = `Monatsbericht_${formData?.client_name || 'Klient'}_${formData?.report_month || 'Export'}.pdf`;
      pdf.save(fileName);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#00416A]/20 text-[#00416A] rounded-lg text-sm font-semibold hover:bg-[#00416A]/5 transition-all disabled:opacity-50"
      >
        {exporting
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Exportiere...</>
          : <><Download className="w-4 h-4" /> PDF Export</>
        }
      </button>

      {/* Hidden render container */}
      <div
        ref={containerRef}
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: '-9999px',
          zIndex: -1,
          width: PAGE_W,
          background: '#fff',
        }}
      >
        <FullReport
          formData={formData}
          nutriData={nutriData}
          trainingSessions={trainingSessions}
          exerciseProgressions={exerciseProgressions}
        />
      </div>
    </>
  );
}