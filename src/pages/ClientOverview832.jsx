import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Printer } from "lucide-react";

export default function ClientOverview832() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      base44.entities.ClientProfile.list().then(all => {
        setClient(all.find(c => c.id === id) || null);
      });
    }
  }, []);

  if (!client) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0EAD6]">
      <p className="text-black/40">Lade Kundenprofil...</p>
    </div>
  );

  const Tile = ({ title, children, className = "" }) => (
    <div className={`bg-white border border-black/8 rounded-xl p-4 ${className}`}>
      <p className="text-[9px] font-bold text-[#00416A]/50 tracking-[0.15em] uppercase mb-2">{title}</p>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-1 border-b border-black/5 last:border-0">
      <span className="text-[11px] text-black/50">{label}</span>
      <span className="text-xs font-semibold text-black ml-3 text-right">{value || "–"}</span>
    </div>
  );

  return (
    <div className="bg-[#F0EAD6] print:bg-white">
      {/* Print Button */}
      <div className="print:hidden flex justify-end p-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition"
        >
          <Printer className="w-4 h-4" /> Drucken / PDF
        </button>
      </div>

      {/* Outer container: centers and scales the sheet */}
      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 48, overflow: "hidden" }}>
        <div style={{
          width: 1123,
          height: 794,
          transformOrigin: "top center",
          transform: `scale(${Math.min(1, (window.innerWidth - 32) / 1123)})`,
          flexShrink: 0,
        }}>
      <div
        className="bg-white shadow-2xl print:shadow-none"
        style={{ width: 1123, height: 794, padding: 36, display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5 pb-4 border-b-2 border-[#00416A]">
          <div>
            <p className="text-[9px] font-bold text-[#00416A]/40 tracking-[0.2em] uppercase mb-0.5">Leistungsarchitektur · Kundenprofil</p>
            <h1 className="text-3xl font-bold text-[#00416A]">{client.name}</h1>
            <p className="text-xs text-black/40 mt-0.5">
              {client.alter ? `${client.alter} Jahre` : ""}
              {client.groesse ? ` · ${client.groesse} cm` : ""}
              {client.gewicht ? ` · ${client.gewicht} kg` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-black/30 uppercase tracking-wider">Onboarding</p>
            <p className="text-xs font-semibold text-black/50 mt-0.5">{new Date().toLocaleDateString("de-DE")}</p>
          </div>
        </div>

        {/* Main content: 4 columns */}
        <div className="flex gap-4 flex-1 min-h-0">

          {/* Col 1: Ziel + Hebel */}
          <div className="flex flex-col gap-3" style={{ width: "22%" }}>
            <Tile title="Hauptziel">
              <p className="text-sm font-bold text-[#00416A]">{client.coaching_ziel || "–"}</p>
            </Tile>
            <Tile title="3 größte Hebel" className="flex-1">
              <div className="space-y-2">
                {[client.hebel_1, client.hebel_2, client.hebel_3].map((h, i) => h ? (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#00416A] text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-xs font-medium text-black leading-snug">{h}</span>
                  </div>
                ) : null)}
              </div>
            </Tile>
          </div>

          {/* Col 2: Training */}
          <div className="flex flex-col gap-3" style={{ width: "26%" }}>
            <Tile title="Training · IST-Zustand">
              <Row label="System" value={client.training_ist_system} />
              <Row label="Frequenz" value={client.training_ist_frequenz} />
              {client.training_ist_probleme && (
                <div className="mt-2">
                  <p className="text-[9px] text-black/30 uppercase tracking-wider mb-1">Probleme</p>
                  <p className="text-[11px] text-black/60 leading-snug">{client.training_ist_probleme}</p>
                </div>
              )}
            </Tile>
            <Tile title="Training · SOLL-Zustand" className="flex-1">
              <Row label="System" value={client.training_soll_system} />
              <Row label="Frequenz" value={client.training_soll_frequenz} />
              {client.training_soll_fokus && (
                <div className="mt-2">
                  <p className="text-[9px] text-black/30 uppercase tracking-wider mb-1">Fokus</p>
                  <p className="text-[11px] text-black/60 leading-snug">{client.training_soll_fokus}</p>
                </div>
              )}
            </Tile>
          </div>

          {/* Col 3: Ernährung */}
          <div className="flex flex-col gap-3" style={{ width: "26%" }}>
            <Tile title="Ernährung · IST-Zustand">
              <Row label="Struktur" value={client.ernaehrung_ist_struktur} />
              {client.ernaehrung_ist_probleme && (
                <div className="mt-2">
                  <p className="text-[9px] text-black/30 uppercase tracking-wider mb-1">Probleme</p>
                  <p className="text-[11px] text-black/60 leading-snug">{client.ernaehrung_ist_probleme}</p>
                </div>
              )}
            </Tile>
            <Tile title="Ernährung · Zielwerte" className="flex-1">
              <Row label="Kalorien" value={client.kalorien_ziel ? `${client.kalorien_ziel} kcal` : null} />
              <Row label="Protein" value={client.protein_ziel ? `${client.protein_ziel} g` : null} />
              <Row label="Kohlenhydrate" value={client.kohlenhydrate_ziel ? `${client.kohlenhydrate_ziel} g` : null} />
              <Row label="Fett" value={client.fett_ziel ? `${client.fett_ziel} g` : null} />
              <Row label="Mahlzeiten" value={client.mahlzeiten_struktur} />
            </Tile>
          </div>

          {/* Col 4: Lifestyle + Kontakt */}
          <div className="flex flex-col gap-3" style={{ width: "26%" }}>
            <Tile title="Lifestyle">
              <Row label="Schlaf" value={client.schlaf} />
              <Row label="Stresslevel" value={client.stresslevel} />
              <Row label="Schritte/Tag" value={client.schritte} />
              <Row label="Beruf" value={client.beruf} />
              {client.lifestyle_faktoren && (
                <div className="mt-2">
                  <p className="text-[9px] text-black/30 uppercase tracking-wider mb-1">Weitere Faktoren</p>
                  <p className="text-[11px] text-black/60 leading-snug">{client.lifestyle_faktoren}</p>
                </div>
              )}
            </Tile>
            <Tile title="Kontakt & Infos" className="flex-1">
              <Row label="E-Mail" value={client.email} />
              <Row label="Telefon" value={client.telefon} />
              <Row label="Instagram" value={client.instagram} />
              <Row label="Trainingserf." value={client.trainingserfahrung} />
            </Tile>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-black/10 flex justify-between items-center">
          <p className="text-[9px] text-black/25 tracking-wider uppercase">Leistungsarchitektur · Internes Dokument</p>
          <p className="text-[9px] text-black/25">{new Date().toLocaleDateString("de-DE")}</p>
        </div>
      </div>
        </div>
      </div>

      {/* Print-only version (no scale wrapper needed) */}
      <div className="hidden print:block">
        <div
          style={{ width: "297mm", height: "210mm", padding: "18mm", display: "flex", flexDirection: "column", overflow: "hidden", background: "white" }}
        >
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          @page { size: A4 landscape; margin: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}