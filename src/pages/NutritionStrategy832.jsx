import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const parse = (str, fallback = []) => { try { return JSON.parse(str); } catch { return fallback; } };

const C = { indigo: "#00416A", egg: "#F0EAD6", white: "#FFFFFF" };

// ── Shared shell ──────────────────────────────────────────────────
function Slide({ children, dark }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9", fontFamily: "'Inter', sans-serif",
      background: dark ? C.indigo : C.white,
      display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
      padding: "4.5% 6%",
    }}>
      {children}
    </div>
  );
}

function Label({ children, light }) {
  return (
    <p style={{
      fontSize: "0.7vw", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
      color: light ? "rgba(255,255,255,0.4)" : "rgba(0,65,106,0.45)", margin: "0 0 0.8vw"
    }}>{children}</p>
  );
}

function Divider({ light }) {
  return <div style={{ height: "1px", background: light ? "rgba(255,255,255,0.12)" : "rgba(0,65,106,0.1)", margin: "0.8vw 0" }} />;
}

function Tag({ children }) {
  return (
    <span style={{
      display: "inline-block", background: C.egg, color: C.indigo, borderRadius: "4px",
      padding: "0.2vw 0.7vw", fontSize: "0.75vw", fontWeight: 600, marginRight: "0.4vw", marginBottom: "0.4vw"
    }}>{children}</span>
  );
}

// ── Slide 1: Cover ────────────────────────────────────────────────
function Slide1({ data }) {
  return (
    <Slide dark>
      {/* top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "auto" }}>
        <Label light>Leistungsarchitektur</Label>
        <p style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Version {data.version || "1"}</p>
      </div>

      {/* center content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p style={{ fontSize: "1vw", fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1vw" }}>
          {data.client_name}
        </p>
        <h1 style={{ fontSize: "5.5vw", fontWeight: 800, color: C.white, lineHeight: 1.05, margin: "0 0 3vw", maxWidth: "70%" }}>
          Ernährungs­strategie
        </h1>
        <Divider light />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5vw", marginTop: "1.5vw" }}>
          <div>
            <p style={{ fontSize: "0.65vw", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "0.4vw" }}>IST</p>
            <p style={{ fontSize: "1vw", fontWeight: 500, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{data.ist_summary}</p>
          </div>
          <div>
            <p style={{ fontSize: "0.65vw", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "0.4vw" }}>SOLL</p>
            <p style={{ fontSize: "1vw", fontWeight: 500, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>{data.soll_summary}</p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

// ── Slide 2: Warum ────────────────────────────────────────────────
function Slide2({ data }) {
  const items = parse(data.warum_json, []);
  return (
    <Slide>
      <Label>Begründung</Label>
      <h2 style={{ fontSize: "3.2vw", fontWeight: 800, color: C.indigo, margin: "0 0 3vw", lineHeight: 1 }}>Warum diese Strategie?</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2vw", flex: 1 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: "2.2vw", height: "2.2vw", borderRadius: "50%", background: C.egg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1vw" }}>
              <span style={{ fontSize: "0.9vw", fontWeight: 800, color: C.indigo }}>{i + 1}</span>
            </div>
            <p style={{ fontSize: "1.1vw", fontWeight: 700, color: C.indigo, marginBottom: "0.5vw", lineHeight: 1.3 }}>{item.title}</p>
            {item.subtitle && (
              <p style={{ fontSize: "0.8vw", fontWeight: 600, color: C.indigo, opacity: 0.5, marginBottom: "0.5vw", fontStyle: "italic" }}>„{item.subtitle}"</p>
            )}
            <Divider />
            <p style={{ fontSize: "0.85vw", color: "rgba(0,0,0,0.55)", lineHeight: 1.65, marginTop: "0.3vw" }}>{item.text}</p>
          </div>
        ))}
      </div>
    </Slide>
  );
}

// ── Slide 3: Wie ─────────────────────────────────────────────────
function Slide3({ data }) {
  const mahlzeiten = parse(data.mahlzeiten_json, []);
  return (
    <Slide>
      <Label>Struktur</Label>
      <h2 style={{ fontSize: "3.2vw", fontWeight: 800, color: C.indigo, margin: "0 0 3vw", lineHeight: 1 }}>Die Tagesstruktur</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "4vw", flex: 1 }}>
        {/* Ziele */}
        <div>
          <p style={{ fontSize: "0.7vw", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(0,65,106,0.4)", marginBottom: "1vw" }}>Tagesziele</p>
          <div style={{ background: C.egg, borderRadius: "12px", padding: "1.5vw" }}>
            <p style={{ fontSize: "2.2vw", fontWeight: 800, color: C.indigo, lineHeight: 1 }}>{data.kalorien_ziel}</p>
            <p style={{ fontSize: "0.8vw", color: "rgba(0,0,0,0.45)", fontWeight: 500, marginBottom: "1.2vw" }}>kcal · {data.kalorien_defizit}</p>
            <Divider />
            <p style={{ fontSize: "2.2vw", fontWeight: 800, color: C.indigo, lineHeight: 1, marginTop: "1.2vw" }}>{data.protein_ziel}g</p>
            <p style={{ fontSize: "0.8vw", color: "rgba(0,0,0,0.45)", fontWeight: 500 }}>Eiweiß · {data.protein_info}</p>
          </div>
        </div>
        {/* Mahlzeiten */}
        <div>
          <p style={{ fontSize: "0.7vw", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(0,65,106,0.4)", marginBottom: "1vw" }}>Mahlzeiten</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8vw" }}>
            {mahlzeiten.map((m, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "0.5fr 1fr 1fr", alignItems: "center", padding: "0.8vw 1.2vw", background: i === 0 ? C.egg : "transparent", border: i !== 0 ? "1px solid rgba(0,65,106,0.08)" : "none", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.9vw", fontWeight: 700, color: C.indigo }}>{m.name}</p>
                <p style={{ fontSize: "0.8vw", color: "rgba(0,0,0,0.5)" }}>{m.kcal} · {m.protein}</p>
                <p style={{ fontSize: "0.75vw", color: "rgba(0,65,106,0.5)", textAlign: "right" }}>{m.zeit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

// ── Meal Slide ────────────────────────────────────────────────────
function MealSlide({ mealTitle, items }) {
  if (!items || items.length === 0) return null;
  return (
    <Slide>
      <Label>Mahlzeit</Label>
      <h2 style={{ fontSize: "3.2vw", fontWeight: 800, color: C.indigo, margin: "0 0 2.5vw", lineHeight: 1 }}>{mealTitle}</h2>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: "2vw", flex: 1 }}>
        {items.map((v, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", background: C.egg, borderRadius: "12px", padding: "1.8vw", position: "relative", overflow: "hidden" }}>
            {items.length > 1 && (
              <p style={{ fontSize: "0.65vw", fontWeight: 700, color: "rgba(0,65,106,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.5vw" }}>
                Option {i + 1}
              </p>
            )}
            <p style={{ fontSize: "1.2vw", fontWeight: 800, color: C.indigo, marginBottom: "1vw", lineHeight: 1.2 }}>{v.name}</p>
            <Divider />
            <div style={{ flex: 1, marginTop: "0.8vw" }}>
              {v.basis && <BulletGroup label="Basis" items={v.basis} />}
              {v.beilagen && <BulletGroup label="Beilagen" items={v.beilagen} />}
              {v.beilage1 && <BulletGroup label="Beilage 1" items={v.beilage1} />}
              {v.beilage2 && <BulletGroup label="Beilage 2" items={v.beilage2} />}
            </div>
            <div style={{ marginTop: "1.2vw", display: "flex", gap: "0.5vw", flexWrap: "wrap" }}>
              <Tag>{v.kcal}</Tag>
              <Tag>{v.protein}</Tag>
            </div>
          </div>
        ))}
      </div>
    </Slide>
  );
}

function BulletGroup({ label, items }) {
  return (
    <div style={{ marginBottom: "0.8vw" }}>
      <p style={{ fontSize: "0.65vw", fontWeight: 700, color: "rgba(0,65,106,0.45)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3vw" }}>{label}</p>
      {items.map((item, i) => (
        <p key={i} style={{ fontSize: "0.8vw", color: "rgba(0,0,0,0.6)", lineHeight: 1.6, paddingLeft: "0.5vw", borderLeft: "2px solid rgba(0,65,106,0.15)" }}>{item}</p>
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

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") setSlide(s => Math.min(s + 1, 6));
      if (e.key === "ArrowLeft") setSlide(s => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif", fontSize: "14px" }}>Laden…</p>
    </div>
  );

  const slides = [
    <Slide1 data={data} />,
    <Slide2 data={data} />,
    <Slide3 data={data} />,
    <MealSlide mealTitle="Morgens" items={parse(data.morgens_json, [])} />,
    <MealSlide mealTitle="Mittags" items={parse(data.mittags_json, [])} />,
    <MealSlide mealTitle="Snack" items={parse(data.snack_json, [])} />,
    <MealSlide mealTitle="Abendessen" items={parse(data.abend_json, [])} />,
  ];
  const total = slides.length;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* Slide container */}
      <div style={{ width: "min(92vw, 1280px)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)", borderRadius: "4px", overflow: "hidden" }}>
        {slides[slide]}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "28px" }}>
        <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}
          style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", cursor: slide === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: slide === 0 ? 0.25 : 1, transition: "opacity 0.2s" }}>
          <ChevronLeft style={{ color: "white" }} size={16} />
        </button>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? "20px" : "6px", height: "6px", borderRadius: "3px",
              background: i === slide ? C.egg : "rgba(255,255,255,0.2)",
              border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0
            }} />
          ))}
        </div>

        <button onClick={() => setSlide(s => Math.min(total - 1, s + 1))} disabled={slide === total - 1}
          style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", cursor: slide === total - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: slide === total - 1 ? 0.25 : 1, transition: "opacity 0.2s" }}>
          <ChevronRight style={{ color: "white" }} size={16} />
        </button>
      </div>

      <p style={{ color: "rgba(255,255,255,0.18)", fontSize: "11px", marginTop: "10px", letterSpacing: "0.1em" }}>
        {slide + 1} / {total} · Pfeiltasten zum Navigieren
      </p>
    </div>
  );
}