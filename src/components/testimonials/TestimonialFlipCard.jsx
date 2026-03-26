import React, { useState, useRef } from "react";
import { Play, Pause, Mic } from "lucide-react";

const BRAND_BLUE = "#00416A";
const EGGSHELL = "#F0EAD6";

function Sparkline({ data, color, width = 360, height = 50 }) {
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

function AudioPlayer({ label, url }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const toggle = (e) => {
    e.stopPropagation();
    if (playing) { audioRef.current?.pause(); } else { audioRef.current?.play(); }
    setPlaying(!playing);
  };

  return (
    <div className="mt-3 bg-[#F0EAD6] rounded-lg p-3 flex items-center gap-3">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
        style={{ background: BRAND_BLUE }}
      >
        {playing ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[#00416A] text-xs font-bold mb-1">{label}</p>
        <div className="relative h-1 bg-[#00416A]/20 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = ratio * duration;
            setProgress(ratio * duration);
          }}
        >
          <div className="absolute left-0 top-0 h-full bg-[#00416A] rounded-full transition-all"
            style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }} />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[#00416A]/40 text-xs">{fmt(progress)}</span>
          <span className="text-[#00416A]/40 text-xs">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialFlipCard({ testimonial }) {
  const [flipped, setFlipped] = useState(false);
  const [activeMetric, setActiveMetric] = useState(null);

  const t = testimonial;

  const parseJson = (str) => {
    try { return JSON.parse(str); } catch (e) { return null; }
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
    <>
      <style>{`
        .flip-container {
          perspective: 1200px;
          height: 620px;
        }
        .flip-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.7s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        .flip-inner.flipped {
          transform: rotateY(180deg);
        }
        .flip-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
        }
        .flip-back {
          transform: rotateY(180deg);
        }
      `}</style>
      <div className="flip-container rounded-2xl shadow-lg">
        <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
          {/* FRONT */}
          <div className="flip-face bg-white rounded-2xl overflow-hidden">
            {/* Photo Hero */}
            <div className="relative h-1/2 overflow-hidden">
              {t.photo_url ? (
                <img
                  src={t.photo_url}
                  alt={t.client_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-300" />
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {t.gewicht_delta_label && t.zeitraum ? `${t.gewicht_delta_label} · ${t.zeitraum}` : t.zeitraum}
                </p>
                <h3 className="text-2xl font-bold mt-1">{t.client_name}</h3>
                {t.tagline && (
                  <p className="text-sm font-normal mt-2" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {t.tagline}
                  </p>
                )}
              </div>
            </div>

            {/* Quote & Audio & Button */}
            <div className="flex-1 p-6 flex flex-col">
              {t.zitat && (
                <p className="text-sm italic font-normal text-[#2E2E2E] leading-relaxed mb-3">
                  „{t.zitat}"
                </p>
              )}

              {t.audio_url && t.audio_label && (
                <div onClick={(e) => e.stopPropagation()}>
                  <AudioPlayer label={t.audio_label} url={t.audio_url} />
                </div>
              )}

              <div className="flex-1" />

              <button
                onClick={() => setFlipped(true)}
                className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: "rgba(0,65,106,0.04)",
                  border: "1px solid rgba(0,65,106,0.12)",
                  color: BRAND_BLUE,
                }}
              >
                Ergebnisse im Detail ↻
              </button>
            </div>
          </div>

          {/* BACK */}
          <div className="flip-face flip-back bg-white rounded-2xl overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                    style={{ background: BRAND_BLUE }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{t.client_name}</span>
                      <span className="text-xs font-bold text-white px-2 py-0.5 rounded" style={{ background: BRAND_BLUE }}>
                        FALLBEISPIEL
                      </span>
                    </div>
                    {t.instagram_handle && (
                      <p className="text-xs text-gray-500 mt-0.5">{t.instagram_handle}</p>
                    )}
                  </div>
                  {t.zeitraum && (
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: BRAND_BLUE }}>
                      {t.zeitraum}
                    </span>
                  )}
                </div>

                {/* Gewicht Hero */}
                {hasGewicht && sichtbar.includes("gewicht") && (
                  <div className="rounded-2xl p-4 mb-6" style={{ background: BRAND_BLUE }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.55)" }}>
                          GEWICHTSVERLAUF
                        </p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-4xl font-bold text-white">
                            {t.gewicht_end?.toFixed(1) || "–"}
                          </span>
                          <span className="text-sm text-white/55">kg</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/50 mb-2">Start: {t.gewicht_start?.toFixed(1)} kg</p>
                        {gewichtDelta !== 0 && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl" style={{ background: "rgba(255,255,255,0.12)" }}>
                            <span className="text-xl font-bold text-[#7DDDD4]">
                              {Math.abs(gewichtDelta).toFixed(1)} kg
                            </span>
                            <span className="text-lg text-[#7DDDD4]">
                              {gewichtDelta < 0 ? "↓" : "↑"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Sparkline data={gewichtData} color="rgba(255,255,255,0.75)" width={360} height={50} />
                  </div>
                )}

                {/* Quote */}
                {t.zitat && (
                  <div className="flex gap-3 mb-4">
                    <div className="w-1 bg-[#00416A] rounded flex-shrink-0" />
                    <p className="text-sm italic font-semibold text-[#2E2E2E] leading-relaxed">
                      „{t.zitat}"
                    </p>
                  </div>
                )}

                {/* Vorher/Nachher */}
                {(t.problem || t.ergebnis) && (
                  <div className="bg-white border border-[#E2DABE] rounded-xl p-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#B06A2E" }}>
                          VORHER
                        </p>
                        <p className="text-xs text-gray-600 mt-1 leading-tight">{t.problem || "–"}</p>
                      </div>
                      <div className="text-center">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center mx-auto text-sm font-bold"
                          style={{ background: EGGSHELL, color: BRAND_BLUE }}
                        >
                          →
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#1D7A70" }}>
                          NACHHER
                        </p>
                        <p className="text-xs font-semibold text-[#141414] mt-1 leading-tight">{t.ergebnis || "–"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Weitere Metriken */}
                {visibleSecondary.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                      WEITERE METRIKEN
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {visibleSecondary.map(([key, m]) => {
                        const isActive = activeMetric === key;
                        const delta = getDelta(m.start, m.end, m.positive);
                        return (
                          <button
                            key={key}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMetric(isActive ? null : key);
                            }}
                            className="bg-white border rounded-lg px-3 py-2 text-xs transition-all"
                            style={{
                              borderColor: isActive ? m.color : "#E2DABE",
                              borderWidth: isActive ? 2 : 1,
                              boxShadow: isActive ? `0 2px 8px ${m.color}22` : "none",
                            }}
                          >
                            <p className="text-xs text-gray-500 font-semibold">{m.label}</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold" style={{ color: isActive ? m.color : "#141414" }}>
                                {formatValue(m.end, key)}
                              </span>
                              <span className="text-xs text-gray-500">{m.unit}</span>
                              {delta && (
                                <span className="text-xs font-bold ml-1" style={{ color: m.color }}>
                                  {delta.arrow}{delta.value}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Secondary Chart */}
                {activeM && activeM.data && activeM.data.length > 1 && (
                  <div className="bg-white border border-[#E2DABE] rounded-lg p-3 mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">{activeM.label} – Verlauf</p>
                    <Sparkline data={activeM.data} color={activeM.color} width={360} height={45} />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[#E2DABE] p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: BRAND_BLUE }} />
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    LEISTUNGSARCHITEKTUR
                  </span>
                </div>
                <button
                  onClick={() => setFlipped(false)}
                  className="text-sm font-bold"
                  style={{ color: BRAND_BLUE }}
                >
                  ↻ Zurück
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}