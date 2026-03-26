import React, { useState, useRef } from "react";

const BRAND_BLUE = "#00416A";
const EGGSHELL = "#F0EAD6";

function Sparkline({ data, color = "rgba(255,255,255,0.75)", fill = true, height = 56, strokeWidth = 2 }) {
  if (!data || data.length < 2) return null;
  const w = 300, h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * (h - 8) - 4,
  ]);

  // Bezier path
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = (pts[i - 1][0] + pts[i][0]) / 2;
    const cp2x = cp1x;
    d += ` C ${cp1x},${pts[i - 1][1]} ${cp2x},${pts[i][1]} ${pts[i][0]},${pts[i][1]}`;
  }
  const fillPath = d + ` L ${pts[pts.length - 1][0]},${h} L ${pts[0][0]},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={height} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi,"")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {fill && <path d={fillPath} fill={`url(#sg-${color.replace(/[^a-z0-9]/gi,"")})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LiquidBlob({ style }) {
  return (
    <div style={{
      position: "absolute",
      borderRadius: "50%",
      filter: "blur(60px)",
      opacity: 0.12,
      background: "#7DDDD4",
      ...style,
    }} />
  );
}

const METRIC_COLORS = {
  hrv: "#1D7A70",
  ruhepuls: "#B06A2E",
  schritte: "#3A6D9C",
};
const METRIC_LABELS = {
  hrv: "HRV",
  ruhepuls: "Ruhepuls",
  schritte: "Schritte",
};
const METRIC_UNITS = {
  hrv: "ms",
  ruhepuls: "bpm",
  schritte: "/Tag",
};

function parseArr(json) {
  try { const v = JSON.parse(json || "[]"); return Array.isArray(v) ? v.map(Number).filter(n => !isNaN(n)) : []; }
  catch { return []; }
}

export default function TestimonialCard({ testimonial, cardRef }) {
  const sichtbar = parseArr(testimonial.sichtbare_metriken || '["gewicht","hrv","ruhepuls","schritte"]');
  const gewichtData = parseArr(testimonial.gewicht_verlauf_json);
  const [activeMetric, setActiveMetric] = useState(() => {
    const hasData = ["hrv","ruhepuls","schritte"].filter(m =>
      sichtbar.includes(m) && (testimonial[`${m}_start`] || testimonial[`${m}_end`])
    );
    return hasData.length > 0 ? hasData[0] : null;
  });

  const initials = (testimonial.client_name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  const gewDelta = testimonial.gewicht_start && testimonial.gewicht_end
    ? (testimonial.gewicht_end - testimonial.gewicht_start).toFixed(1)
    : null;

  const secondaryMetrics = ["hrv","ruhepuls","schritte"].filter(m =>
    sichtbar.includes(m) && (testimonial[`${m}_start`] || testimonial[`${m}_end`])
  );

  const getMetricData = (m) => parseArr(testimonial[`${m}_verlauf_json`]);
  const getMetricDelta = (m) => {
    if (testimonial[`${m}_start`] && testimonial[`${m}_end`]) {
      const d = testimonial[`${m}_end`] - testimonial[`${m}_start`];
      return d > 0 ? `+${d.toFixed(0)}` : d.toFixed(0);
    }
    return null;
  };

  return (
    <div
      ref={cardRef}
      style={{
        fontFamily: "'Inter', sans-serif",
        background: EGGSHELL,
        border: "1px solid #E2DABE",
        borderRadius: 24,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06), 0 12px 48px rgba(0,65,106,0.08)",
        padding: "28px 28px 24px",
        width: 440,
        minWidth: 440,
        maxWidth: 440,
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {/* Avatar */}
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          background: testimonial.avatar_url ? `url(${testimonial.avatar_url}) center/cover` : BRAND_BLUE,
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: EGGSHELL, fontSize: 18, fontWeight: 700,
          backgroundImage: testimonial.avatar_url ? `url(${testimonial.avatar_url})` : undefined,
          backgroundSize: "cover", backgroundPosition: "center",
        }}>
          {!testimonial.avatar_url && initials}
        </div>
        {/* Name + handle */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#141414" }}>{testimonial.client_name}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, color: "#fff",
              background: BRAND_BLUE, borderRadius: 5,
              padding: "2px 6px", letterSpacing: "0.08em",
            }}>FALLBEISPIEL</span>
          </div>
          {testimonial.instagram_handle && (
            <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginTop: 1 }}>
              {testimonial.instagram_handle}
            </div>
          )}
        </div>
        {/* Zeitraum */}
        {testimonial.zeitraum && (
          <div style={{ fontSize: 15, fontWeight: 700, color: BRAND_BLUE, flexShrink: 0 }}>
            {testimonial.zeitraum}
          </div>
        )}
      </div>

      {/* Hero block – Gewichtsverlauf */}
      {sichtbar.includes("gewicht") && (testimonial.gewicht_end || gewichtData.length > 0) && (
        <div style={{
          background: BRAND_BLUE, borderRadius: 18,
          padding: "20px 20px 0", marginBottom: 16,
          position: "relative", overflow: "hidden",
        }}>
          <LiquidBlob style={{ width: 120, height: 120, top: -30, right: -20 }} />
          <LiquidBlob style={{ width: 80, height: 80, bottom: 10, left: 20 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em", marginBottom: 4 }}>
                GEWICHTSVERLAUF
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                  {testimonial.gewicht_end?.toFixed(1) || "–"}
                </span>
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>kg</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {testimonial.gewicht_start && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
                  Start: {testimonial.gewicht_start?.toFixed(1)} kg
                </div>
              )}
              {gewDelta !== null && (
                <div style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 10, padding: "4px 10px",
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: "#7DDDD4", lineHeight: 1 }}>
                    {gewDelta} kg
                  </span>
                  <span style={{ fontSize: 18, color: "#7DDDD4" }}>
                    {parseFloat(gewDelta) < 0 ? "↓" : "↑"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 12, position: "relative", zIndex: 1 }}>
            <Sparkline data={gewichtData.length > 1 ? gewichtData : [testimonial.gewicht_start, testimonial.gewicht_end].filter(Boolean)} height={56} />
          </div>
        </div>
      )}

      {/* Zitat */}
      {testimonial.zitat && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 3, background: BRAND_BLUE, borderRadius: 2, flexShrink: 0 }} />
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 17, fontWeight: 600, fontStyle: "italic",
            color: "#2E2E2E", lineHeight: 1.5, margin: 0,
          }}>
            „{testimonial.zitat}"
          </p>
        </div>
      )}

      {/* Vorher → Nachher */}
      {(testimonial.problem || testimonial.ergebnis) && (
        <div style={{
          background: "#fff", borderRadius: 14,
          border: "1px solid #E2DABE", padding: "14px 16px",
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 16,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#B06A2E", letterSpacing: "0.1em", marginBottom: 3 }}>VORHER</div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.4 }}>{testimonial.problem || "–"}</div>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: EGGSHELL, border: "1.5px solid #E2DABE",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: BRAND_BLUE, fontWeight: 700, flexShrink: 0,
          }}>→</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#1D7A70", letterSpacing: "0.1em", marginBottom: 3 }}>NACHHER</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#141414", lineHeight: 1.4 }}>{testimonial.ergebnis || "–"}</div>
          </div>
        </div>
      )}

      {/* Sekundäre Metriken */}
      {secondaryMetrics.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.12em", marginBottom: 8 }}>WEITERE METRIKEN</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {secondaryMetrics.map(m => {
              const isActive = activeMetric === m;
              const color = METRIC_COLORS[m];
              const delta = getMetricDelta(m);
              const endVal = testimonial[`${m}_end`];
              return (
                <button
                  key={m}
                  onClick={() => setActiveMetric(isActive ? null : m)}
                  style={{
                    background: "#fff",
                    border: `${isActive ? 2 : 1}px solid ${isActive ? color : "#E2DABE"}`,
                    borderRadius: 10, padding: "8px 14px",
                    cursor: "pointer", textAlign: "left",
                    boxShadow: isActive ? `0 2px 8px ${color}22` : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 10, color: "#888", fontWeight: 600, marginBottom: 2 }}>{METRIC_LABELS[m]}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: isActive ? color : "#141414" }}>
                      {endVal?.toFixed(0) || "–"}
                    </span>
                    <span style={{ fontSize: 10, color: "#888" }}>{METRIC_UNITS[m]}</span>
                    {delta && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: color, marginLeft: 2 }}>
                        {parseFloat(delta) > 0 ? "↑" : "↓"}{Math.abs(parseFloat(delta))}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sekundärer Chart */}
      {activeMetric && getMetricData(activeMetric).length > 1 && (
        <div style={{
          background: "#fff", borderRadius: 12,
          border: "1px solid #E2DABE", padding: "12px 14px",
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#888", marginBottom: 6 }}>
            {METRIC_LABELS[activeMetric]} – Verlauf
          </div>
          <Sparkline data={getMetricData(activeMetric)} color={METRIC_COLORS[activeMetric]} fill={true} height={44} strokeWidth={1.5} />
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: "1px solid #E2DABE",
        paddingTop: 12, marginTop: 4,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND_BLUE }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.18em" }}>
            LEISTUNGSARCHITEKTUR
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: BRAND_BLUE }}>@fabian_aichem</span>
      </div>
    </div>
  );
}