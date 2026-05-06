import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const PHASE_COLORS = {
  1: { bg: "#00416A", light: "#e8f0f7", badge: "#00416A" },
  2: { bg: "#1a6b3c", light: "#e8f5ee", badge: "#1a6b3c" },
  3: { bg: "#7b3fa0", light: "#f3e8f7", badge: "#7b3fa0" },
  4: { bg: "#b45309", light: "#fef3e2", badge: "#b45309" },
};

function WocheCard({ woche, phaseColor }) {
  const [open, setOpen] = useState(false);
  const data = woche;

  const renderList = (items, label) => {
    if (!items || !items.length) return null;
    return (
      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: phaseColor.badge }}>{label}</p>
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-black/70">
              <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: phaseColor.badge }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-black/2 transition"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: phaseColor.badge }}>
            {data.woche}
          </span>
          <div>
            <p className="font-bold text-black text-sm">{data.titel}</p>
            <p className="text-xs text-black/40 mt-0.5">{data.hauptfokus}</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-black/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-black/30 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-black/5" style={{ background: phaseColor.light }}>
          {data.nebenfokus && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Nebenfokus</p>
              <p className="text-xs text-black/60">{data.nebenfokus}</p>
            </div>
          )}

          {renderList(data.aktiv, "Aktiv")}
          {renderList(data.nicht_aktiv, "Nicht aktiv")}
          {renderList(data.noch_nicht, "Noch nicht")}
          {renderList(data.weekly_review, "Weekly Review")}
          {renderList(data.moegliche_anpassungen, "Mögliche Anpassungen")}
          {renderList(data.kpis, "KPIs")}
          {renderList(data.regeln, "Regeln")}

          {data.ziel_woche && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: phaseColor.badge + "18" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: phaseColor.badge }}>Ziel der Woche</p>
              <p className="text-xs text-black/70 italic">{data.ziel_woche}</p>
            </div>
          )}

          {data.merksatz && (
            <div className="mt-3 p-3 rounded-lg border-l-4" style={{ background: "#fff8e1", borderColor: "#f59e0b" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Merksatz</p>
              <p className="text-xs text-black/70 italic">"{data.merksatz}"</p>
            </div>
          )}

          {data.beispiel_regel && (
            <div className="mt-3 p-3 bg-black/5 rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">Beispielregel</p>
              <p className="text-xs text-black/60">{data.beispiel_regel}</p>
            </div>
          )}

          {data.entscheidungslogik && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-2">Entscheidungslogik</p>
              <div className="space-y-1.5">
                {Object.entries(data.entscheidungslogik).map(([k, v]) => (
                  <div key={k} className="text-xs text-black/60 flex gap-2">
                    <span className="text-black/30">→</span> {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.entscheidung && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-2">Entscheidungsoptionen</p>
              <div className="space-y-1.5">
                {Object.entries(data.entscheidung).map(([k, v]) => (
                  <div key={k} className="text-xs text-black/60 flex gap-2">
                    <span className="font-bold uppercase text-black/30">{k.replace("_", " ")}:</span> {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.ziel_nach_phase && (
            <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: phaseColor.badge + "40", background: "white" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: phaseColor.badge }}>Ziel nach dieser Phase</p>
              <p className="text-xs text-black/70">{data.ziel_nach_phase}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CoachingPlan832() {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get("clientId");
  const clientName = params.get("name") || "Kunde";

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    base44.entities.ClientProfile.list().then(all => {
      const client = all.find(c => c.id === clientId);
      if (client?.coaching_plan_json) {
        setPlan(JSON.parse(client.coaching_plan_json));
      }
      setLoading(false);
    });
  }, [clientId]);

  if (loading) return (
    <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#00416A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!plan) return (
    <div className="min-h-screen bg-[#F0EAD6] flex flex-col items-center justify-center gap-3">
      <p className="text-black/40 text-sm">Kein Coaching-Plan gefunden.</p>
      <Link to="/Clients832" className="text-[#00416A] text-sm underline">Zurück zur Übersicht</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0EAD6] pb-16">
      {/* Header */}
      <div className="bg-[#00416A] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to={`/Clients832`} className="text-white/50 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Coaching Plan</p>
            <p className="font-bold text-base">{clientName}</p>
          </div>
        </div>
        <p className="text-white/40 text-xs hidden sm:block">{plan.titel}</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-8">
        {plan.phasen?.map(phase => {
          const colors = PHASE_COLORS[phase.phase] || PHASE_COLORS[1];
          return (
            <div key={phase.phase}>
              {/* Phase Header */}
              <div className="rounded-2xl p-5 mb-4 text-white" style={{ background: colors.bg }}>
                <div className="flex items-center gap-3">
                  <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Phase {phase.phase}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/50 text-xs">Woche {phase.wochen_range}</span>
                </div>
                <h2 className="text-lg font-bold mt-1">{phase.name}</h2>
                <p className="text-white/60 text-xs mt-1">{phase.ziel}</p>
              </div>

              {/* Wochen */}
              <div className="space-y-2">
                {phase.wochen?.map(woche => (
                  <WocheCard key={woche.woche} woche={woche} phaseColor={colors} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Module */}
        {plan.module && (
          <div className="bg-white rounded-2xl p-6 border border-black/8">
            <h3 className="font-bold text-[#00416A] mb-4">Modulare Komponenten</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Pflichtmodule", items: plan.module.pflicht, color: "#00416A" },
                { label: "Früh aktivieren", items: plan.module.frueh_aktivieren, color: "#1a6b3c" },
                { label: "Später aktivieren", items: plan.module.spaeter_aktivieren, color: "#7b3fa0" },
                { label: "Nur bei Bedarf", items: plan.module.nur_bei_bedarf, color: "#b45309" },
              ].map(({ label, items, color }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color }}>{label}</p>
                  <ul className="space-y-1">
                    {items?.map((item, i) => (
                      <li key={i} className="text-xs text-black/60 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}