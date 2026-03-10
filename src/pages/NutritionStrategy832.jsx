import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const parse = (str, fallback = []) => { try { return JSON.parse(str); } catch { return fallback; } };

const INDIGO = "#00416A";
const EGG = "#F0EAD6";

// ── Slide components ──────────────────────────────────────────────

function SlideWrapper({ children }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9", background: EGG,
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      padding: "5% 7%", position: "relative", overflow: "hidden", fontFamily: "'Inter', sans-serif"
    }}>
      {/* subtle texture overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300416A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      {children}
    </div>
  );
}

function SlideTitle({ children, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "6%" }}>
      {sub && <p style={{ fontSize: "1.1vw", fontWeight: 700, color: INDIGO, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5vw", opacity: 0.6 }}>{sub}</p>}
      <h1 style={{ fontSize: "6vw", fontWeight: 900, color: INDIGO, lineHeight: 1, margin: 0, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{children}</h1>
    </div>
  );
}

function Slide1({ data }) {
  return (
    <SlideWrapper>
      <div style={{ textAlign: "center", width: "100%", zIndex: 1 }}>
        <p style={{ fontSize: "1.4vw", fontWeight: 800, color: INDIGO, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5vw", opacity: 0.7 }}>
          {data.client_name}
        </p>
        <h1 style={{ fontSize: "8.5vw", fontWeight: 900, color: INDIGO, lineHeight: 0.95, margin: "0 0 1vw", textTransform: "uppercase", letterSpacing: "-0.02em" }}>
          Ernährungs­strategie
        </h1>
        <p style={{ fontSize: "1.1vw", fontWeight: 700, color: "black", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "5%" }}>
          Version {data.version || "1"}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5vw" }}>
          <p style={{ fontSize: "1.5vw", fontWeight: 700, color: "black" }}>
            <span style={{ color: INDIGO }}>IST:</span> {data.ist_summary || "–"}
          </p>
          <p style={{ fontSize: "1.5vw", fontWeight: 700, color: "black" }}>
            <span style={{ color: INDIGO }}>SOLL:</span> {data.soll_summary || "–"}
          </p>
        </div>
      </div>
      <p style={{ position: "absolute", bottom: "2%", left: "3%", fontSize: "0.8vw", color: "rgba(0,0,0,0.25)", fontWeight: 500 }}>
        Leistungsarchitektur
      </p>
    </SlideWrapper>
  );
}

function Slide2({ data }) {
  const items = parse(data.warum_json, []);
  return (
    <SlideWrapper>
      <div style={{ width: "100%", zIndex: 1 }}>
        <SlideTitle>Warum?</SlideTitle>
        <div style={{ display: "grid", gridTemplateColumns: items.length > 2 ? "1fr 1fr" : "1fr 1fr", gap: "2vw" }}>
          {items.map((item, i) => (
            <div key={i} style={{
              border: `2px solid ${INDIGO}`, borderRadius: "8px", padding: "2vw",
              background: "rgba(240,234,214,0.6)", position: "relative"
            }}>
              <span style={{ position: "absolute", top: "-2.5vw", left: "-0.5vw", fontSize: "4vw", fontWeight: 900, color: INDIGO, lineHeight: 1, opacity: 0.9 }}>
                {i + 1}.
              </span>
              <p style={{ fontSize: "1.2vw", fontWeight: 700, color: INDIGO, marginBottom: "0.5vw" }}>{item.title}</p>
              {item.subtitle && <p style={{ fontSize: "1vw", fontWeight: 600, color: "black", marginBottom: "0.5vw", fontStyle: "italic" }}>"{item.subtitle}"</p>}
              <div style={{ borderTop: `1px dashed ${INDIGO}`, margin: "0.5vw 0", opacity: 0.4 }} />
              <p style={{ fontSize: "1vw", color: "rgba(0,0,0,0.65)", lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <p style={{ position: "absolute", bottom: "2%", left: "3%", fontSize: "0.8vw", color: "rgba(0,0,0,0.25)" }}>Leistungsarchitektur</p>
    </SlideWrapper>
  );
}

function Slide3({ data }) {
  const mahlzeiten = parse(data.mahlzeiten_json, []);
  return (
    <SlideWrapper>
      <div style={{ width: "100%", zIndex: 1 }}>
        <SlideTitle>Wie?</SlideTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "4vw", alignItems: "start" }}>
          {/* Left: Ziele */}
          <div style={{ border: `2px solid ${INDIGO}`, borderRadius: "8px", padding: "2vw", background: "rgba(240,234,214,0.6)" }}>
            <p style={{ fontSize: "1.1vw", fontWeight: 700, color: INDIGO, marginBottom: "1vw", textAlign: "center" }}>Ziel</p>
            <p style={{ fontSize: "1.4vw", fontWeight: 800, color: "black", marginBottom: "0.3vw" }}>• {data.kalorien_ziel || "–"} Kalorien</p>
            {data.kalorien_defizit && <p style={{ fontSize: "1.1vw", color: "rgba(0,0,0,0.6)", marginLeft: "1vw", marginBottom: "0.8vw" }}>→ {data.kalorien_defizit}</p>}
            <p style={{ fontSize: "1.4vw", fontWeight: 800, color: "black", marginBottom: "0.3vw" }}>• {data.protein_ziel || "–"}g Eiweiß</p>
            {data.protein_info && <p style={{ fontSize: "1.1vw", color: "rgba(0,0,0,0.6)", marginLeft: "1vw" }}>→ {data.protein_info}</p>}
          </div>
          {/* Right: Mahlzeiten */}
          <div>
            <p style={{ fontSize: "1.3vw", fontWeight: 700, color: "black", marginBottom: "1.2vw" }}>
              Anhand der aktuellen Ernährungsweise bietet sich folgende Struktur an:
            </p>
            {mahlzeiten.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: "1.5vw", marginBottom: "0.7vw", alignItems: "baseline" }}>
                <span style={{ fontSize: "1.2vw", fontWeight: 800, color: INDIGO, minWidth: "0.8vw" }}>{i + 1}.</span>
                <p style={{ fontSize: "1.2vw", fontWeight: 700, color: "black" }}>
                  {m.name}: <span style={{ color: "rgba(0,0,0,0.7)" }}>{m.kcal}, {m.protein}; {m.zeit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p style={{ position: "absolute", bottom: "2%", left: "3%", fontSize: "0.8vw", color: "rgba(0,0,0,0.25)" }}>Leistungsarchitektur</p>
    </SlideWrapper>
  );
}

function MealSlide({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <SlideWrapper>
      <div style={{ width: "100%", zIndex: 1 }}>
        <div style={{ marginBottom: "4%", display: "flex", alignItems: "baseline", gap: "1vw" }}>
          <h1 style={{ fontSize: "6vw", fontWeight: 900, color: INDIGO, textTransform: "uppercase", lineHeight: 1, margin: 0 }}>WAS?</h1>
          <span style={{ fontSize: "3vw", fontWeight: 900, color: "black", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: "2vw" }}>
          {items.map((v, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              {items.length > 1 && <p style={{ fontSize: "1.1vw", fontWeight: 700, color: "black", textAlign: "center", marginBottom: "0.8vw" }}>Variante {i + 1}</p>}
              <div style={{ border: `2px solid ${INDIGO}`, borderRadius: "8px", padding: "1.8vw", background: "rgba(240,234,214,0.6)", flex: 1 }}>
                <p style={{ fontSize: "1.3vw", fontWeight: 800, color: INDIGO, marginBottom: "1vw" }}>{v.name}</p>
                {v.basis && <MealSection label="Basis" items={v.basis} />}
                {v.beilagen && <MealSection label="Beilagen" items={v.beilagen} />}
                {v.beilage1 && <MealSection label="Beilage 1" items={v.beilage1} />}
                {v.beilage2 && <MealSection label="Beilage 2" items={v.beilage2} />}
              </div>
              <p style={{ fontSize: "1.3vw", fontWeight: 800, color: "black", textAlign: "center", marginTop: "0.8vw" }}>
                {v.kcal} <span style={{ color: INDIGO }}>{v.protein}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <p style={{ position: "absolute", bottom: "2%", left: "3%", fontSize: "0.8vw", color: "rgba(0,0,0,0.25)" }}>Leistungsarchitektur</p>
    </SlideWrapper>
  );
}

function MealSection({ label, items }) {
  return (
    <div style={{ marginBottom: "0.8vw" }}>
      <p style={{ fontSize: "0.9vw", fontWeight: 700, color: "black", marginBottom: "0.3vw" }}>{label}:</p>
      {items.map((item, i) => (
        <p key={i} style={{ fontSize: "0.85vw", color: "rgba(0,0,0,0.65)", marginLeft: "0.5vw", lineHeight: 1.5 }}>· {item}</p>
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function NutritionStrategy832() {
  const [data, setData] = useState(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      base44.entities.NutritionStrategy.list().then(all => {
        setData(all.find(c => c.id === id) || null);
      });
    }
  }, []);

  if (!data) return (
    <div style={{ minHeight: "100vh", background: EGG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(0,0,0,0.3)", fontFamily: "Inter, sans-serif" }}>Lade Strategie…</p>
    </div>
  );

  const slides = [
    <Slide1 data={data} />,
    <Slide2 data={data} />,
    <Slide3 data={data} />,
    <MealSlide title="Morgens" items={parse(data.morgens_json, [])} />,
    <MealSlide title="Mittags" items={parse(data.mittags_json, [])} />,
    <MealSlide title="Snack" items={parse(data.snack_json, [])} />,
    <MealSlide title="Abendessen" items={parse(data.abend_json, [])} />,
  ].filter(Boolean);

  const total = slides.length;

  return (
    <div style={{ minHeight: "100vh", background: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Slide */}
      <div style={{ width: "90vw", maxWidth: "1200px", boxShadow: "0 25px 80px rgba(0,0,0,0.6)" }}>
        {slides[slide]}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px", marginTop: "24px" }}>
        <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: slide === 0 ? "rgba(255,255,255,0.1)" : "white", border: "none", cursor: slide === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: slide === 0 ? 0.3 : 1 }}>
          <ChevronLeft style={{ color: INDIGO }} size={20} />
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? "24px" : "8px", height: "8px", borderRadius: "4px",
              background: i === slide ? "white" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer",
              transition: "all 0.3s ease", padding: 0
            }} />
          ))}
        </div>

        <button onClick={() => setSlide(s => Math.min(total - 1, s + 1))} disabled={slide === total - 1}
          style={{ width: "44px", height: "44px", borderRadius: "50%", background: slide === total - 1 ? "rgba(255,255,255,0.1)" : "white", border: "none", cursor: slide === total - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: slide === total - 1 ? 0.3 : 1 }}>
          <ChevronRight style={{ color: INDIGO }} size={20} />
        </button>
      </div>

      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginTop: "12px" }}>
        {slide + 1} / {total}
      </p>
    </div>
  );
}