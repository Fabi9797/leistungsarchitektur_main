import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Printer } from "lucide-react";

const split = (val) => val ? val.split(",").map(s => s.trim()).filter(Boolean) : [];

export default function FactSheet832() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      base44.entities.ClientProfile.list().then(all => {
        setClient(all.find(c => c.id === id) || null);
      });
    }
  }, []);

  if (!client) return (
    <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center">
      <p className="text-black/30 text-sm">Lade Kundenprofil…</p>
    </div>
  );

  const date = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @media print {
          body { margin: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .page { box-shadow: none !important; margin: 0 !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      {/* Print bar */}
      <div className="no-print bg-[#00416A] text-white py-3 px-6 flex items-center justify-between sticky top-0 z-50">
        <span className="text-xs font-semibold tracking-widest uppercase opacity-60">Leistungsarchitektur · Fact Sheet</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-1.5 bg-white text-[#00416A] rounded-lg text-xs font-bold hover:bg-[#F0EAD6] transition"
        >
          <Printer className="w-3.5 h-3.5" /> Als PDF speichern
        </button>
      </div>

      <div className="bg-[#F0EAD6] min-h-screen py-8 px-4 print:bg-white print:py-0 print:px-0">
        {/* A4 Page */}
        <div
          className="page bg-white mx-auto shadow-2xl"
          style={{ width: "794px", minHeight: "1123px", padding: "52px 56px" }}
        >
          {/* ── HEADER ── */}
          <div className="flex items-end justify-between pb-7 mb-7" style={{ borderBottom: "2px solid #00416A" }}>
            <div>
              <p style={{ fontSize: "9px", letterSpacing: "0.18em", color: "#00416A99", fontWeight: 700, textTransform: "uppercase", marginBottom: "6px" }}>
                Leistungsarchitektur · Onboarding Fact Sheet
              </p>
              <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#00416A", lineHeight: 1.1, margin: 0 }}>
                {client.name}
              </h1>
              {client.coaching_ziel && (
                <p style={{ fontSize: "13px", color: "#00000066", marginTop: "6px", fontWeight: 400 }}>
                  {client.coaching_ziel}
                </p>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "9px", color: "#00000033", textTransform: "uppercase", letterSpacing: "0.1em" }}>Erstellt am</p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#00000060", marginTop: "2px" }}>{date}</p>
            </div>
          </div>

          {/* ── ROW 1: Person + Hebel ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "16px", marginBottom: "16px" }}>

            {/* Personenübersicht */}
            <Tile label="Personenübersicht">
              <DataRow label="Alter" value={client.alter ? `${client.alter} Jahre` : null} />
              <DataRow label="Größe" value={client.groesse ? `${client.groesse} cm` : null} />
              <DataRow label="Gewicht" value={client.gewicht ? `${client.gewicht} kg` : null} />
              <DataRow label="Körperfett" value={client.koerperfett || null} />
              <DataRow label="Beruf" value={client.beruf || null} />
              <DataRow label="Erfahrung" value={client.trainingserfahrung || null} />
            </Tile>

            {/* 3 Größte Hebel – hervorgehoben */}
            <div style={{
              background: "#00416A",
              borderRadius: "14px",
              padding: "22px 24px",
            }}>
              <p style={{ fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase", marginBottom: "16px" }}>
                Die 3 größten Hebel
              </p>
              {[client.hebel_1, client.hebel_2, client.hebel_3].map((h, i) => h ? (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: i < 2 ? "12px" : 0 }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "50%",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)"
                  }}>{i + 1}</div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "white", margin: 0, lineHeight: 1.4 }}>{h}</p>
                </div>
              ) : null)}
            </div>
          </div>

          {/* ── ROW 2: Training IST + Training SOLL ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <Tile label="Training · IST-Zustand">
              <DataRow label="System" value={client.training_ist_system} />
              <DataRow label="Frequenz" value={client.training_ist_frequenz} />
              {split(client.training_ist_probleme).length > 0 && (
                <BulletBlock label="Probleme" items={split(client.training_ist_probleme)} />
              )}
            </Tile>
            <Tile label="Training · Zielstruktur">
              <DataRow label="System" value={client.training_soll_system} />
              <DataRow label="Frequenz" value={client.training_soll_frequenz} />
              {split(client.training_soll_fokus).length > 0 && (
                <BulletBlock label="Fokus" items={split(client.training_soll_fokus)} accent />
              )}
            </Tile>
          </div>

          {/* ── ROW 3: Ernährung IST + Rahmen ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <Tile label="Ernährung · IST-Zustand">
              <DataRow label="Struktur" value={client.ernaehrung_ist_struktur} />
              {split(client.ernaehrung_ist_probleme).length > 0 && (
                <BulletBlock label="Probleme" items={split(client.ernaehrung_ist_probleme)} />
              )}
            </Tile>
            <Tile label="Ernährungsrahmen">
              <DataRow label="Kalorienziel" value={client.kalorien_ziel ? `${client.kalorien_ziel} kcal` : null} accent />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "10px" }}>
                {[
                  { l: "Protein", v: client.protein_ziel, unit: "g" },
                  { l: "Fett", v: client.fett_ziel, unit: "g" },
                  { l: "Kohlenhydrate", v: client.kohlenhydrate_ziel, unit: "g" },
                ].map(({ l, v, unit }) => (
                  <div key={l} style={{ background: "#F0EAD6", borderRadius: "8px", padding: "8px 10px" }}>
                    <p style={{ fontSize: "9px", color: "#00000050", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>{l}</p>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#00416A", margin: 0 }}>{v ? `${v}${unit}` : "–"}</p>
                  </div>
                ))}
              </div>
              {client.mahlzeiten_struktur && (
                <DataRow label="Mahlzeiten" value={client.mahlzeiten_struktur} />
              )}
            </Tile>
          </div>

          {/* ── ROW 4: Alltag + Zielbild ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
            <Tile label="Alltag & Lifestyle">
              <DataRow label="Schlaf" value={client.schlaf} />
              <DataRow label="Stresslevel" value={client.stresslevel} />
              <DataRow label="Schritte / Tag" value={client.schritte} />
              {split(client.lifestyle_faktoren).length > 0 && (
                <BulletBlock label="Faktoren" items={split(client.lifestyle_faktoren)} />
              )}
            </Tile>
            <Tile label="Zielbild">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "2px" }}>
                {split(client.zielbild).map((z, i) => (
                  <span key={i} style={{
                    background: "#F0EAD6",
                    color: "#00416A",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}>{z}</span>
                ))}
              </div>
            </Tile>
          </div>

          {/* ── FOOTER ── */}
          <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "9px", color: "rgba(0,0,0,0.2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Leistungsarchitektur · Vertraulich</p>
            <p style={{ fontSize: "9px", color: "rgba(0,0,0,0.2)" }}>{date}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function Tile({ label, children }) {
  return (
    <div style={{
      background: "white",
      border: "1px solid rgba(0,0,0,0.07)",
      borderRadius: "14px",
      padding: "20px 22px",
    }}>
      <p style={{ fontSize: "9px", letterSpacing: "0.15em", color: "#00416A80", fontWeight: 700, textTransform: "uppercase", marginBottom: "14px", margin: "0 0 14px 0" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function DataRow({ label, value, accent }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "1px solid rgba(0,0,0,0.045)" }}>
      <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.4)", fontWeight: 400 }}>{label}</span>
      <span style={{ fontSize: "12px", fontWeight: 600, color: accent ? "#00416A" : "black", textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function BulletBlock({ label, items, accent }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <p style={{ fontSize: "9px", color: "rgba(0,0,0,0.35)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>{label}</p>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "7px", marginBottom: "4px" }}>
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: accent ? "#00416A" : "rgba(0,0,0,0.25)", marginTop: "5px", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: accent ? "#00416A" : "rgba(0,0,0,0.6)", fontWeight: accent ? 500 : 400 }}>{item}</span>
        </div>
      ))}
    </div>
  );
}