import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Printer } from "lucide-react";

const parse = (str, fallback = []) => { try { return JSON.parse(str); } catch { return fallback; } };
const C = { indigo: "#00416A", egg: "#F0EAD6" };

const s = {
  label: { fontSize: "8px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(0,65,106,0.45)", margin: "0 0 10px" },
  h1: { fontSize: "38px", fontWeight: 800, color: C.indigo, lineHeight: 1.05, margin: 0 },
  h2: { fontSize: "22px", fontWeight: 800, color: C.indigo, lineHeight: 1.1, margin: 0 },
  h3: { fontSize: "13px", fontWeight: 700, color: C.indigo, margin: "0 0 8px" },
  body: { fontSize: "11px", color: "rgba(0,0,0,0.6)", lineHeight: 1.65 },
  small: { fontSize: "9px", color: "rgba(0,0,0,0.4)", fontWeight: 500 },
  divider: { height: "1px", background: "rgba(0,65,106,0.08)", margin: "16px 0", border: "none" },
};

function Page({ children, pageNum }) {
  return (
    <div className="page" style={{
      width: "794px", minHeight: "1123px", background: "white", margin: "0 auto 32px",
      padding: "56px 60px", boxSizing: "border-box", boxShadow: "0 4px 40px rgba(0,0,0,0.12)",
      display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif",
      position: "relative",
    }}>
      {children}
      <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={s.small}>Leistungsarchitektur · Vertraulich</p>
        <p style={s.small}>Seite {pageNum}</p>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <p style={s.label}>{children}</p>;
}

function Tag({ children }) {
  return (
    <span style={{ background: C.egg, color: C.indigo, borderRadius: "4px", padding: "3px 10px", fontSize: "10px", fontWeight: 600, display: "inline-block", marginRight: "6px", marginBottom: "4px" }}>
      {children}
    </span>
  );
}

function BulletList({ items }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "3px" }}>
          <span style={{ color: C.indigo, fontWeight: 700, fontSize: "10px", marginTop: "1px" }}>·</span>
          <p style={{ ...s.body, margin: 0 }}>{item}</p>
        </div>
      ))}
    </div>
  );
}

function MealCard({ variant, index, showIndex }) {
  return (
    <div style={{ border: "1px solid rgba(0,65,106,0.1)", borderRadius: "10px", padding: "18px 20px", background: "white" }}>
      {showIndex && <p style={{ ...s.small, marginBottom: "6px" }}>Option {index + 1}</p>}
      <p style={{ ...s.h3, marginBottom: "12px" }}>{variant.name}</p>
      <hr style={s.divider} />
      {variant.basis && (
        <div style={{ marginBottom: "10px" }}>
          <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Basis</p>
          <BulletList items={variant.basis} />
        </div>
      )}
      {variant.beilagen && (
        <div style={{ marginBottom: "10px" }}>
          <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Beilagen</p>
          <BulletList items={variant.beilagen} />
        </div>
      )}
      {variant.beilage1 && (
        <div style={{ marginBottom: "10px" }}>
          <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Beilage 1</p>
          <BulletList items={variant.beilage1} />
        </div>
      )}
      {variant.beilage2 && (
        <div style={{ marginBottom: "10px" }}>
          <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Beilage 2</p>
          <BulletList items={variant.beilage2} />
        </div>
      )}
      <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(0,65,106,0.07)" }}>
        <Tag>{variant.kcal}</Tag>
        <Tag>{variant.protein}</Tag>
      </div>
    </div>
  );
}

export default function NutritionStrategy832() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      base44.entities.NutritionStrategy.list().then(all => {
        setData(all.find(c => c.id === id) || null);
      });
    }
  }, []);

  if (!data) return (
    <div style={{ minHeight: "100vh", background: C.egg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <p style={{ color: "rgba(0,0,0,0.3)", fontSize: "14px" }}>Laden…</p>
    </div>
  );

  const warum = parse(data.warum_json, []);
  const mahlzeiten = parse(data.mahlzeiten_json, []);
  const morgens = parse(data.morgens_json, []);
  const mittags = parse(data.mittags_json, []);
  const snack = parse(data.snack_json, []);
  const abend = parse(data.abend_json, []);
  const date = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .page { box-shadow: none !important; margin: 0 !important; page-break-after: always; }
          @page { size: A4; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>

      {/* Print bar */}
      <div className="no-print" style={{ background: C.indigo, color: "white", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5 }}>
          Ernährungsstrategie · {data.client_name}
        </span>
        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 16px", background: "white", color: C.indigo, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
          <Printer size={13} /> Als PDF speichern
        </button>
      </div>

      <div style={{ background: "#e8e2d0", padding: "40px 20px" }}>

        {/* ── SEITE 1: Cover + Warum ── */}
        <Page pageNum={1}>
          {/* Header */}
          <div style={{ paddingBottom: "28px", marginBottom: "28px", borderBottom: `2px solid ${C.indigo}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <SectionLabel>Leistungsarchitektur · Ernährungsstrategie</SectionLabel>
                <h1 style={s.h1}>{data.client_name}</h1>
                <p style={{ ...s.body, marginTop: "6px" }}>Version {data.version || "1"}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={s.small}>Erstellt am</p>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginTop: "2px" }}>{date}</p>
              </div>
            </div>

            {/* IST / SOLL */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
              <div style={{ background: "rgba(240,234,214,0.6)", borderRadius: "8px", padding: "14px 16px" }}>
                <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.15em", textTransform: "uppercase" }}>IST-Zustand</p>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.7)" }}>{data.ist_summary}</p>
              </div>
              <div style={{ background: C.indigo, borderRadius: "8px", padding: "14px 16px" }}>
                <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Zielzustand</p>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "white" }}>{data.soll_summary}</p>
              </div>
            </div>
          </div>

          {/* Warum */}
          <SectionLabel>Begründung</SectionLabel>
          <h2 style={{ ...s.h2, marginBottom: "20px" }}>Warum diese Strategie?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {warum.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "16px", alignItems: "start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: C.egg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: C.indigo }}>{i + 1}</span>
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: C.indigo, marginBottom: "3px" }}>
                    {item.title}
                    {item.subtitle && <span style={{ fontWeight: 500, opacity: 0.6 }}> – „{item.subtitle}"</span>}
                  </p>
                  <p style={s.body}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Page>

        {/* ── SEITE 2: Wie / Tagesstruktur ── */}
        <Page pageNum={2}>
          <SectionLabel>Umsetzung</SectionLabel>
          <h2 style={{ ...s.h2, marginBottom: "24px" }}>Tagesstruktur & Ziele</h2>

          {/* Ziele */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: C.egg, borderRadius: "10px", padding: "20px 24px" }}>
              <p style={s.label}>Kalorienziel</p>
              <p style={{ fontSize: "36px", fontWeight: 800, color: C.indigo, lineHeight: 1, margin: "0 0 4px" }}>{data.kalorien_ziel}</p>
              <p style={s.body}>kcal · {data.kalorien_defizit}</p>
            </div>
            <div style={{ background: C.egg, borderRadius: "10px", padding: "20px 24px" }}>
              <p style={s.label}>Proteinziel</p>
              <p style={{ fontSize: "36px", fontWeight: 800, color: C.indigo, lineHeight: 1, margin: "0 0 4px" }}>{data.protein_ziel}g</p>
              <p style={s.body}>Eiweiß täglich · {data.protein_info}</p>
            </div>
          </div>

          <hr style={s.divider} />

          {/* Mahlzeiten-Übersicht */}
          <p style={{ ...s.label, marginBottom: "14px" }}>Mahlzeitenstruktur</p>
          <div style={{ border: "1px solid rgba(0,65,106,0.1)", borderRadius: "10px", overflow: "hidden" }}>
            {mahlzeiten.map((m, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                padding: "12px 20px",
                background: i % 2 === 0 ? "white" : "rgba(240,234,214,0.35)",
                borderBottom: i < mahlzeiten.length - 1 ? "1px solid rgba(0,65,106,0.06)" : "none"
              }}>
                <p style={{ fontSize: "12px", fontWeight: 700, color: C.indigo }}>{m.name}</p>
                <p style={{ ...s.body, fontSize: "11px" }}>{m.kcal} · {m.protein}</p>
                <p style={{ ...s.small, textAlign: "right", fontSize: "10px" }}>{m.zeit}</p>
              </div>
            ))}
          </div>
        </Page>

        {/* ── SEITE 3: Morgens + Snack ── */}
        <Page pageNum={3}>
          <SectionLabel>Mahlzeiten</SectionLabel>
          <h2 style={{ ...s.h2, marginBottom: "20px" }}>Morgens</h2>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(morgens.length, 3)}, 1fr)`, gap: "16px", marginBottom: "32px" }}>
            {morgens.map((v, i) => <MealCard key={i} variant={v} index={i} showIndex={morgens.length > 1} />)}
          </div>

          <hr style={s.divider} />

          <h2 style={{ ...s.h2, marginBottom: "20px" }}>Snack</h2>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(snack.length, 3)}, 1fr)`, gap: "16px" }}>
            {snack.map((v, i) => <MealCard key={i} variant={v} index={i} showIndex={snack.length > 1} />)}
          </div>
        </Page>

        {/* ── SEITE 4: Mittags ── */}
        <Page pageNum={4}>
          <SectionLabel>Mahlzeiten</SectionLabel>
          <h2 style={{ ...s.h2, marginBottom: "20px" }}>Mittags</h2>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(mittags.length, 3)}, 1fr)`, gap: "16px" }}>
            {mittags.map((v, i) => <MealCard key={i} variant={v} index={i} showIndex={mittags.length > 1} />)}
          </div>
        </Page>

        {/* ── SEITE 5: Abendessen ── */}
        <Page pageNum={5}>
          <SectionLabel>Mahlzeiten</SectionLabel>
          <h2 style={{ ...s.h2, marginBottom: "20px" }}>Abendessen</h2>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(abend.length, 3)}, 1fr)`, gap: "16px" }}>
            {abend.map((v, i) => <MealCard key={i} variant={v} index={i} showIndex={abend.length > 1} />)}
          </div>
        </Page>

      </div>
    </>
  );
}