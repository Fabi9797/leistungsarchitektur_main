import React, { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LOGO_URL = "https://media.base44.com/images/public/69b064c89953b727c5202e21/a128f5dab_ChatGPTImage19Marz202616_44_51.png";

// Brand colors
const C = {
  indigo: '#00416A',
  teal: '#007B7F',
  gold: '#C8973A',
  rose: '#C0616A',
  sky: '#4A90B8',
  lavender: '#5B6DAE',
  eggshell: '#F0EAD6',
  eggshellDark: '#E8DFC8',
  black: '#1A1A2E',
  gray: '#6B7280',
  lightGray: '#F8F7F4',
};

function MetricBlock({ label, value, unit, delta, deltaGood }) {
  return (
    <div style={{
      background: C.lightGray,
      border: `1px solid ${C.eggshellDark}`,
      borderRadius: 10,
      padding: '12px 14px',
      minWidth: 0,
    }}>
      <div style={{ fontSize: 10, color: C.gray, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.indigo, fontFamily: 'monospace' }}>
        {value ?? '–'}
        {unit && <span style={{ fontSize: 11, color: C.gray, fontWeight: 400, marginLeft: 3 }}>{unit}</span>}
      </div>
      {delta !== undefined && delta !== null && (
        <div style={{ fontSize: 10, color: deltaGood ? C.teal : C.rose, marginTop: 2, fontWeight: 600 }}>
          {delta > 0 ? '+' : ''}{typeof delta === 'number' ? delta.toFixed(1) : delta}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 12, marginTop: 4,
    }}>
      <div style={{ width: 4, height: 18, borderRadius: 2, background: color || C.indigo }} />
      <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.indigo, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
        {children}
      </h3>
    </div>
  );
}

function ComplianceBar({ label, value, color }) {
  const v = Math.min(100, Math.max(0, value || 0));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.gray }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: color || C.indigo, fontFamily: 'monospace' }}>{v}%</span>
      </div>
      <div style={{ height: 6, background: C.eggshellDark, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${v}%`, height: '100%', background: color || C.indigo, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function SubjectiveBar({ label, before, after }) {
  const barW = (v) => `${(v / 10) * 100}%`;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: C.gray }}>{label}</span>
        <span style={{ fontSize: 11, color: C.gray, fontFamily: 'monospace' }}>
          {before ?? '–'} → <span style={{ color: after >= before ? C.teal : C.rose, fontWeight: 700 }}>{after ?? '–'}</span> /10
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ flex: 1, height: 6, background: C.eggshellDark, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: barW(before || 0), height: '100%', background: C.lavender, borderRadius: 3 }} />
        </div>
        <div style={{ flex: 1, height: 6, background: C.eggshellDark, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: barW(after || 0), height: '100%', background: after >= before ? C.teal : C.rose, borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}

export function PdfReportContent({ formData, forExport = false }) {
  const fd = formData || {};
  const weightDelta = fd.gewicht_start && fd.gewicht_end ? (fd.gewicht_end - fd.gewicht_start) : null;

  const metrics = [
    { label: 'Gewicht Start', value: fd.gewicht_start, unit: 'kg' },
    { label: 'Gewicht Ende', value: fd.gewicht_end, unit: 'kg', delta: weightDelta, deltaGood: weightDelta < 0 },
    { label: 'KFA Start', value: fd.kfa_start, unit: '%' },
    { label: 'KFA Ende', value: fd.kfa_end, unit: '%' },
    { label: 'Ø Kalorien', value: fd.kalorien_avg, unit: 'kcal' },
    { label: 'Ø Protein', value: fd.protein_avg, unit: 'g' },
    { label: 'Ø HRV', value: fd.hrv_avg, unit: 'ms' },
    { label: 'Ø Ruhepuls', value: fd.ruhepuls_avg, unit: 'bpm' },
    { label: 'Ø Schlaf', value: fd.schlafdauer_avg, unit: 'h' },
    { label: 'Gesamtbewertung', value: fd.gesamtbewertung, unit: '/ 10' },
  ].filter(m => m.value !== undefined && m.value !== null && m.value !== '');

  const style = forExport ? {
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    background: '#FFFFFF',
    color: C.black,
    width: 794,
    minHeight: 1123,
    padding: 0,
    boxSizing: 'border-box',
  } : {};

  return (
    <div style={style}>
      {/* Cover / Header */}
      <div style={{
        background: C.indigo,
        padding: forExport ? '40px 50px 30px' : '32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
              Leistungsarchitektur
            </div>
            <h1 style={{ margin: 0, fontSize: forExport ? 26 : 22, fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
              Monatsbericht
            </h1>
            <h2 style={{ margin: '4px 0 0', fontSize: forExport ? 20 : 16, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>
              {fd.report_label || fd.report_month || '—'}
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>Klient</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{fd.client_name || '—'}</div>
            {fd.gesamtbewertung && (
              <div style={{
                marginTop: 8, display: 'inline-block',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8, padding: '6px 14px',
              }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'block' }}>Bewertung</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace' }}>{fd.gesamtbewertung}/10</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: forExport ? '32px 50px 40px' : '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Highlight */}
        {fd.highlight_des_monats && (
          <div style={{
            background: `linear-gradient(135deg, ${C.eggshell}, ${C.eggshellDark})`,
            border: `1px solid ${C.eggshellDark}`,
            borderLeft: `4px solid ${C.gold}`,
            borderRadius: 10, padding: '14px 18px',
          }}>
            <div style={{ fontSize: 10, color: C.gold, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              🏆 Highlight des Monats
            </div>
            <p style={{ margin: 0, fontSize: 13, color: C.black, lineHeight: 1.6 }}>{fd.highlight_des_monats}</p>
          </div>
        )}

        {/* Key Metrics Grid */}
        {metrics.length > 0 && (
          <div>
            <SectionTitle color={C.indigo}>Kernmetriken</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {metrics.map((m, i) => (
                <MetricBlock key={i} {...m} />
              ))}
            </div>
          </div>
        )}

        {/* Two-column: Subjektiv + Compliance */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Subjektive Wahrnehmung */}
          {(fd.energie_vorher || fd.energie_nachher || fd.stress_vorher || fd.schlaf_vorher) && (
            <div style={{ background: C.lightGray, borderRadius: 10, padding: '16px 18px', border: `1px solid ${C.eggshellDark}` }}>
              <SectionTitle color={C.lavender}>Subjektive Wahrnehmung</SectionTitle>
              <div style={{ fontSize: 9, color: C.gray, marginBottom: 8, display: 'flex', gap: 12 }}>
                <span>■ Vorher</span><span>■ Nachher</span>
              </div>
              {fd.energie_vorher !== undefined && <SubjectiveBar label="Energie" before={fd.energie_vorher} after={fd.energie_nachher} />}
              {fd.stress_vorher !== undefined && <SubjectiveBar label="Stress" before={fd.stress_vorher} after={fd.stress_nachher} />}
              {fd.schlaf_vorher !== undefined && <SubjectiveBar label="Schlafqualität" before={fd.schlaf_vorher} after={fd.schlaf_nachher} />}
            </div>
          )}

          {/* Compliance */}
          {(fd.training_compliance || fd.ernaehrung_compliance || fd.supplement_compliance) && (
            <div style={{ background: C.lightGray, borderRadius: 10, padding: '16px 18px', border: `1px solid ${C.eggshellDark}` }}>
              <SectionTitle color={C.teal}>Compliance</SectionTitle>
              {fd.training_compliance !== undefined && (
                <ComplianceBar label="Training" value={fd.training_compliance} color={C.indigo} />
              )}
              {fd.ernaehrung_compliance !== undefined && (
                <ComplianceBar label="Ernährung" value={fd.ernaehrung_compliance} color={C.gold} />
              )}
              {fd.supplement_compliance !== undefined && (
                <ComplianceBar label="Supplemente" value={fd.supplement_compliance} color={C.teal} />
              )}
            </div>
          )}
        </div>

        {/* HRV / Ruhepuls Trends */}
        {(fd.hrv_trend || fd.ruhepuls_trend) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {fd.hrv_trend && (
              <div style={{ background: C.lightGray, borderRadius: 10, padding: '14px 18px', border: `1px solid ${C.eggshellDark}` }}>
                <div style={{ fontSize: 10, color: C.gray, marginBottom: 2 }}>HRV Trend</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: fd.hrv_trend === 'Steigend' ? C.teal : fd.hrv_trend === 'Fallend' ? C.rose : C.gray }}>
                  {fd.hrv_trend === 'Steigend' ? '↑' : fd.hrv_trend === 'Fallend' ? '↓' : '→'} {fd.hrv_trend}
                </div>
                {fd.hrv_avg && <div style={{ fontSize: 11, color: C.gray, marginTop: 2, fontFamily: 'monospace' }}>Ø {fd.hrv_avg} ms</div>}
              </div>
            )}
            {fd.ruhepuls_trend && (
              <div style={{ background: C.lightGray, borderRadius: 10, padding: '14px 18px', border: `1px solid ${C.eggshellDark}` }}>
                <div style={{ fontSize: 10, color: C.gray, marginBottom: 2 }}>Ruhepuls Trend</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: fd.ruhepuls_trend === 'Fallend' ? C.teal : fd.ruhepuls_trend === 'Steigend' ? C.rose : C.gray }}>
                  {fd.ruhepuls_trend === 'Steigend' ? '↑' : fd.ruhepuls_trend === 'Fallend' ? '↓' : '→'} {fd.ruhepuls_trend}
                </div>
                {fd.ruhepuls_avg && <div style={{ fontSize: 11, color: C.gray, marginTop: 2, fontFamily: 'monospace' }}>Ø {fd.ruhepuls_avg} bpm</div>}
              </div>
            )}
          </div>
        )}

        {/* Coach Kommentar */}
        {fd.coach_kommentar && (
          <div style={{
            background: C.lightGray,
            border: `1px solid ${C.eggshellDark}`,
            borderLeft: `4px solid ${C.indigo}`,
            borderRadius: 10, padding: '16px 18px',
          }}>
            <SectionTitle color={C.indigo}>Coach-Kommentar</SectionTitle>
            <p style={{ margin: 0, fontSize: 12, color: C.black, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{fd.coach_kommentar}</p>
          </div>
        )}

        {/* Reflexion Kunde */}
        {fd.reflexion_kunde && (
          <div style={{
            background: C.lightGray,
            border: `1px solid ${C.eggshellDark}`,
            borderLeft: `4px solid ${C.lavender}`,
            borderRadius: 10, padding: '16px 18px',
          }}>
            <SectionTitle color={C.lavender}>Reflexion des Klienten</SectionTitle>
            <p style={{ margin: 0, fontSize: 12, color: C.black, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{fd.reflexion_kunde}</p>
          </div>
        )}

        {/* Fokus nächster Monat */}
        {fd.fokus_naechster_monat && (
          <div style={{
            background: `linear-gradient(135deg, #EBF5F5, #E0F0F0)`,
            border: `1px solid ${C.teal}30`,
            borderRadius: 10, padding: '16px 18px',
          }}>
            <SectionTitle color={C.teal}>Fokus nächster Monat</SectionTitle>
            <p style={{ margin: 0, fontSize: 12, color: C.black, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{fd.fokus_naechster_monat}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: `1px solid ${C.eggshellDark}`, paddingTop: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontSize: 10, color: C.gray }}>
            Leistungsarchitektur · Monatsbericht {fd.report_label || fd.report_month}
          </div>
          <div style={{ fontSize: 10, color: C.gray }}>
            {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PdfExportButton({ formData }) {
  const [exporting, setExporting] = useState(false);
  const containerRef = useRef(null);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const el = containerRef.current;
      if (!el) return;

      el.style.display = 'block';
      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
      });

      el.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, Math.max(1123, canvas.height / 2)],
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height / canvas.width) * pageW;

      if (imgH <= pageH) {
        pdf.addImage(imgData, 'PNG', 0, 0, pageW, imgH);
      } else {
        // Multi-page: slice image into pages
        let yOffset = 0;
        let page = 0;
        while (yOffset < canvas.height) {
          if (page > 0) pdf.addPage();
          const sliceH = Math.min(pageH * (canvas.width / pageW), canvas.height - yOffset);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, -yOffset);
          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pageW, sliceH * (pageW / canvas.width));
          yOffset += sliceH;
          page++;
        }
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

      {/* Hidden render target */}
      <div
        ref={containerRef}
        style={{
          display: 'none',
          position: 'fixed',
          top: 0, left: '-9999px',
          zIndex: -1,
          width: 794,
        }}
      >
        <PdfReportContent formData={formData} forExport={true} />
      </div>
    </>
  );
}