import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Target, Dumbbell, Apple, FlaskConical, TrendingUp } from "lucide-react";

const pillars = [
  { icon: Dumbbell, label: "Training", num: "01" },
  { icon: Apple, label: "Ernährung", num: "02" },
  { icon: FlaskConical, label: "Nahrungsergänzung", num: "03" },
];

function TempleStatic() {
  return (
    <div style={{ width: 480, fontFamily: "Inter, sans-serif" }} className="select-none">
      {/* DACH – SVG Dreieck */}
      <div style={{ position: "relative", lineHeight: 0 }}>
        <svg width="480" height="60" viewBox="0 0 480 60" style={{ display: "block" }}>
          <polygon points="48,60 240,0 432,60" fill="#00416A" />
        </svg>
        {/* Apex icon */}
        <div style={{
          position: "absolute", bottom: -18, left: "50%", transform: "translateX(-50%)",
          width: 44, height: 44, background: "#F0EAD6", borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", border: "2px solid white", zIndex: 10
        }}>
          <TrendingUp style={{ width: 20, height: 20, color: "#00416A" }} />
        </div>
      </div>

      {/* Architrav */}
      <div style={{ background: "#00416A", padding: "28px 16px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 }}>Das Ergebnis</p>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: "4px 0 2px" }}>Dein neues Ich</h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>Dauerhafte Form · Nachhaltige Gewohnheiten · Kontrolle</p>
      </div>

      {/* SÄULEN */}
      <div style={{ display: "flex", background: "#EDE8D8", borderLeft: "1px solid rgba(0,0,0,0.1)", borderRight: "1px solid rgba(0,0,0,0.1)" }}>
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={p.label} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              borderRight: i < pillars.length - 1 ? "1px solid rgba(0,0,0,0.1)" : "none"
            }}>
              {/* Capital */}
              <div style={{ width: "100%", height: 10, background: "rgba(0,65,106,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)" }} />

              {/* Shaft */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 8px", gap: 8, minHeight: 160 }}>
                {/* Fluting */}
                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(4)].map((_, j) => <div key={j} style={{ width: 1, height: 32, background: "rgba(0,65,106,0.12)", borderRadius: 1 }} />)}
                </div>

                <div style={{
                  width: 44, height: 44, background: "white", borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.05)"
                }}>
                  <Icon style={{ width: 20, height: 20, color: "#00416A" }} />
                </div>

                <div style={{ textAlign: "center", padding: "0 4px" }}>
                  <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(0,65,106,0.35)", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>{p.num}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "black", margin: "2px 0 0", lineHeight: 1.3 }}>{p.label}</p>
                </div>

                <div style={{ display: "flex", gap: 2 }}>
                  {[...Array(4)].map((_, j) => <div key={j} style={{ width: 1, height: 32, background: "rgba(0,65,106,0.12)", borderRadius: 1 }} />)}
                </div>
              </div>

              {/* Base */}
              <div style={{ width: "100%", height: 10, background: "rgba(0,65,106,0.08)", borderTop: "1px solid rgba(0,0,0,0.08)" }} />
            </div>
          );
        })}
      </div>

      {/* Stufen */}
      <div style={{ height: 4, background: "rgba(0,0,0,0.55)" }} />
      <div style={{ height: 4, background: "rgba(0,0,0,0.75)" }} />

      {/* FUNDAMENT */}
      <div style={{ background: "#111111", padding: "28px 32px", textAlign: "center" }}>
        <div style={{
          width: 44, height: 44, background: "rgba(255,255,255,0.1)", borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 10px"
        }}>
          <Target style={{ width: 20, height: 20, color: "#F0EAD6" }} />
        </div>
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}>Fundament</p>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: "white", margin: "4px 0 6px" }}>Hebelanalyse & Steuerung</h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 280, margin: "0 auto 16px", lineHeight: 1.6 }}>
          Die Basis, auf der alles aufbaut. Wir identifizieren, was bei dir wirklich zählt.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["Analyse", "Daten", "Steuerung"].map((label) => (
            <div key={label} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.1em" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ExportGraphic() {
  const ref = useRef(null);

  const handleDownload = async () => {
    const canvas = await html2canvas(ref.current, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = "leistungsarchitektur.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center gap-8 p-8">
      <div ref={ref} style={{ display: "inline-block", borderRadius: 16, overflow: "hidden" }}>
        <TempleStatic />
      </div>
      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-[#00416A] text-white rounded-xl font-semibold hover:bg-[#003356] transition"
      >
        Als PNG herunterladen
      </button>
    </div>
  );
}