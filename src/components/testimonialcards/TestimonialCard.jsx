import React, { useState } from "react";

const BRAND_BLUE = "#00416A";
const EGGSHELL = "#F0EAD6";

function Sparkline({ data, color, width = 320, height = 65 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const px = 6;
  const py = 6;
  const pts = data.map((v, i) => ({
    x: px + (i / (data.length - 1)) * (width - px * 2),
    y: height - py - ((v - min) / range) * (height - py * 2),
  }));
  let pathD = "M " + pts[0].x + "," + pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    const cx1 = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * 0.4;
    const cx2 = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * 0.6;
    pathD += " C " + cx1 + "," + pts[i - 1].y + " " + cx2 + "," + pts[i].y + " " + pts[i].x + "," + pts[i].y;
  }
  const last = pts[pts.length - 1];
  const areaD = pathD + " L " + last.x + "," + height + " L " + pts[0].x + "," + height + " Z";
  const gid = "grad_" + color.replace("#", "").replace(/[^a-z0-9]/gi, "");
  return (
    <svg width="100%" viewBox={"0 0 " + width + " " + height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={"url(#" + gid + ")"} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="4" fill={color} stroke="white" strokeWidth="2" />
    </svg>
  );
}

function LiquidBlob({ style }) {
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(60px)",
        opacity: 0.12,
        background: "#7DDDD4",
        ...style,
      }}
    />
  );
}

export default function TestimonialCard({ testimonial, cardRef }) {
  const [activeMetric, setActiveMetric] = useState(null);
  const t = testimonial;

  // Parse JSON arrays safely
  const parseJson = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  };

  const gewichtData = parseJson(t.gewicht_verlauf_json);
  const hrvData = parseJson(t.hrv_verlauf_json);
  const ruhepulsData = parseJson(t.ruhepuls_verlauf_json);
  const schritteData = parseJson(t.schritte_verlauf_json);
  const sichtbar = parseJson(t.sichtbare_metriken) || ["gewicht", "hrv", "ruhepuls", "schritte"];

  const hasGewicht = t.gewicht_start && t.gewicht_end;
  const gewichtDelta = hasGewicht ? t.gewicht_end - t.gewicht_start : 0;

  const metriken = {
    hrv: {
      label: "HRV",
      unit: "ms",
      start: t.hrv_start,
      end: t.hrv_end,
      data: hrvData,
      color: "#1D7A70",
      positive: true,
    },
    ruhepuls: {
      label: "Ruhepuls",
      unit: "bpm",
      start: t.ruhepuls_start,
      end: t.ruhepuls_end,
      data: ruhepulsData,
      color: "#B06A2E",
      positive: false,
    },
    schritte: {
      label: "Schritte",
      unit: "/Tag",
      start: t.schritte_start,
      end: t.schritte_end,
      data: schritteData,
      color: "#3A6D9C",
      positive: true,
    },
  };

  // Filter to only show metrics that have data AND are in sichtbare_metriken
  const visibleSecondary = Object.entries(metriken).filter(
    ([key, m]) => sichtbar.includes(key) && m.start != null && m.end != null
  );

  const activeM = activeMetric && metriken[activeMetric];

  const initials = (t.client_name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const formatValue = (value, key) => {
    if (key === "schritte" && value) {
      return (value / 1000).toFixed(1) + "k";
    }
    return value?.toFixed(0) || "–";
  };

  const getDelta = (start, end, positive = true) => {
    if (start == null || end == null) return null;
    const delta = end - start;
    const absVal = Math.abs(delta).toFixed(0);
    const arrow = positive ? (delta > 0 ? "↑" : "↓") : delta < 0 ? "↑" : "↓";
    return { value: absVal, arrow, positive: delta > 0 };
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
        padding: "clamp(20px, 6vw, 28px)",
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: t.avatar_url ? `url(${t.avatar_url}) center/cover` : BRAND_BLUE,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: EGGSHELL,
            fontSize: 18,
            fontWeight: 700,
            backgroundImage: t.avatar_url ? `url(${t.avatar_url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!t.avatar_url && initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#141414" }}>
              {t.client_name}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#fff",
                background: BRAND_BLUE,
                borderRadius: 5,
                padding: "2px 6px",
                letterSpacing: "0.08em",
              }}
            >
              FALLBEISPIEL
            </span>
          </div>
          {t.instagram_handle && (
            <div style={{ fontSize: 12, fontWeight: 500, color: "#555", marginTop: 1 }}>
              {t.instagram_handle}
            </div>
          )}
        </div>
        {t.zeitraum && (
          <div style={{ fontSize: 15, fontWeight: 700, color: BRAND_BLUE, flexShrink: 0 }}>
            {t.zeitraum}
          </div>
        )}
      </div>

      {/* B) HERO GEWICHT BLOCK */}
      {hasGewicht && sichtbar.includes("gewicht") && (
        <div
          style={{
            background: BRAND_BLUE,
            borderRadius: 18,
            padding: "20px 20px 0",
            marginBottom: 20,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <LiquidBlob style={{ width: 120, height: 120, top: -30, right: -20 }} />
          <LiquidBlob style={{ width: 80, height: 80, bottom: 10, left: 20 }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              position: "relative",
              zIndex: 1,
              marginBottom: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.12em",
                  marginBottom: 4,
                }}
              >
                GEWICHTSVERLAUF
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                  {t.gewicht_end?.toFixed(1) || "–"}
                </span>
                <span style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>kg</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {t.gewicht_start && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
                  Start: {t.gewicht_start?.toFixed(1)} kg
                </div>
              )}
              {gewichtDelta !== 0 && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "4px 10px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 26, fontWeight: 800, color: "#7DDDD4", lineHeight: 1 }}>
                    {Math.abs(gewichtDelta).toFixed(1)} kg
                  </span>
                  <span style={{ fontSize: 18, color: "#7DDDD4" }}>
                    {gewichtDelta < 0 ? "↓" : "↑"}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <Sparkline data={gewichtData} color="rgba(255,255,255,0.75)" width={380} height={60} />
          </div>
        </div>
      )}

      {/* C) ZITAT */}
      {t.zitat && (
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 3, background: BRAND_BLUE, borderRadius: 2, flexShrink: 0 }} />
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 17,
              fontWeight: 600,
              fontStyle: "italic",
              color: "#2E2E2E",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            „{t.zitat}"
          </p>
        </div>
      )}

      {/* D) VORHER/NACHHER */}
      {(t.problem || t.ergebnis) && (
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #E2DABE",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#B06A2E",
                letterSpacing: "0.1em",
                marginBottom: 3,
              }}
            >
              VORHER
            </div>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 1.4 }}>
              {t.problem || "–"}
            </div>
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: EGGSHELL,
              border: "1.5px solid #E2DABE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: BRAND_BLUE,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            →
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#1D7A70",
                letterSpacing: "0.1em",
                marginBottom: 3,
              }}
            >
              NACHHER
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#141414", lineHeight: 1.4 }}>
              {t.ergebnis || "–"}
            </div>
          </div>
        </div>
      )}

      {/* E) SEKUNDÄRE METRIKEN */}
      {visibleSecondary.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#888",
              letterSpacing: "0.12em",
              marginBottom: 8,
            }}
          >
            WEITERE METRIKEN
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {visibleSecondary.map(([key, m]) => {
              const isActive = activeMetric === key;
              const delta = getDelta(m.start, m.end, m.positive);
              return (
                <button
                  key={key}
                  onClick={() => setActiveMetric(isActive ? null : key)}
                  style={{
                    background: "#fff",
                    border: `${isActive ? 2 : 1}px solid ${isActive ? m.color : "#E2DABE"}`,
                    borderRadius: 10,
                    padding: "8px 14px",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: isActive ? `0 2px 8px ${m.color}22` : "none",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 10, color: "#888", fontWeight: 600, marginBottom: 2 }}>
                    {m.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: isActive ? m.color : "#141414" }}>
                      {formatValue(m.end, key)}
                    </span>
                    <span style={{ fontSize: 10, color: "#888" }}>{m.unit}</span>
                    {delta && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: m.color, marginLeft: 2 }}>
                        {delta.arrow}
                        {delta.value}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* F) SEKUNDÄRER CHART */}
      {activeM && activeM.data && activeM.data.length > 1 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #E2DABE",
            padding: "12px 14px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: "#888", marginBottom: 6 }}>
            {activeM.label} – Verlauf
          </div>
          <Sparkline data={activeM.data} color={activeM.color} width={380} height={55} />
        </div>
      )}

      {/* G) FOOTER */}
      <div
        style={{
          borderTop: "1px solid #E2DABE",
          paddingTop: 12,
          marginTop: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
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