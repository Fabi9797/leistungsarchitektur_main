import React, { useState, useEffect } from "react";
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
    <div className={`bg-white border border-black/8 rounded-2xl p-5 ${className}`}>
      <p className="text-[10px] font-bold text-[#00416A]/50 tracking-[0.15em] uppercase mb-3">{title}</p>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-baseline py-1.5 border-b border-black/5 last:border-0">
      <span className="text-xs text-black/50">{label}</span>
      <span className="text-sm font-semibold text-black ml-4 text-right">{value || "–"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0EAD6] print:bg-white">
      {/* Print Button – hidden when printing */}
      <div className="print:hidden flex justify-end p-4 max-w-[794px] mx-auto">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition"
        >
          <Printer className="w-4 h-4" /> Drucken / PDF
        </button>
      </div>

      {/* A4 Sheet */}
      <div
        className="mx-auto bg-white shadow-xl print:shadow-none"
        style={{ width: "794px", minHeight: "1123px", padding: "48px" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-[#00416A]">
          <div>
            <p className="text-[10px] font-bold text-[#00416A]/40 tracking-[0.2em] uppercase mb-1">Leistungsarchitektur · Kundenprofil</p>
            <h1 className="text-4xl font-bold text-[#00416A]">{client.name}</h1>
            <p className="text-sm text-black/40 mt-1">
              {client.alter ? `${client.alter} Jahre` : ""}
              {client.groesse ? ` · ${client.groesse} cm` : ""}
              {client.gewicht ? ` · ${client.gewicht} kg` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-black/30 uppercase tracking-wider">Onboarding</p>
            <p className="text-sm font-semibold text-black/50 mt-1">{new Date().toLocaleDateString("de-DE")}</p>
          </div>
        </div>

        {/* Row 1: Ziel + Hebel */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Tile title="Hauptziel">
            <p className="text-base font-bold text-[#00416A]">{client.ziel || "–"}</p>
          </Tile>
          <Tile title="3 größte Hebel" className="col-span-2">
            <div className="space-y-2">
              {[client.hebel_1, client.hebel_2, client.hebel_3].map((h, i) => h ? (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#00416A] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <span className="text-sm font-medium text-black">{h}</span>
                </div>
              ) : null)}
            </div>
          </Tile>
        </div>

        {/* Row 2: Training */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Tile title="Training · IST-Zustand">
            <Row label="Programmstruktur" value={client.training_ist} />
            <Row label="Frequenz" value={client.training_frequenz_ist} />
          </Tile>
          <Tile title="Training · SOLL-Zustand">
            <Row label="Oberkörper (OK)" value={client.training_soll_ok} />
            <Row label="Unterkörper (UK)" value={client.training_soll_uk} />
            <Row label="Ganzkörper (GK)" value={client.training_soll_gk} />
            <Row label="Frequenz" value={client.training_frequenz_soll} />
          </Tile>
        </div>

        {/* Row 3: Ernährung */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Tile title="Ernährung · IST-Zustand">
            <p className="text-sm text-black/70 leading-relaxed">{client.ernaehrung_ist || "–"}</p>
          </Tile>
          <Tile title="Ernährung · Zielwerte">
            <Row label="Kalorien" value={client.kalorien_ziel ? `${client.kalorien_ziel} kcal` : null} />
            <Row label="Protein" value={client.protein_ziel ? `${client.protein_ziel} g` : null} />
            <Row label="Kohlenhydrate" value={client.kohlenhydrate_ziel ? `${client.kohlenhydrate_ziel} g` : null} />
            <Row label="Fett" value={client.fett_ziel ? `${client.fett_ziel} g` : null} />
          </Tile>
        </div>

        {/* Notizen */}
        {client.notizen && (
          <Tile title="Notizen & Besonderheiten">
            <p className="text-sm text-black/60 leading-relaxed whitespace-pre-line">{client.notizen}</p>
          </Tile>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-black/10 flex justify-between items-center">
          <p className="text-[10px] text-black/25 tracking-wider uppercase">Leistungsarchitektur · Internes Dokument</p>
          <p className="text-[10px] text-black/25">{new Date().toLocaleDateString("de-DE")}</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}