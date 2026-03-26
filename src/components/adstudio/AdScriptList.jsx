import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, ChevronDown, Eye } from "lucide-react";

const STATUSES = ["Entwurf", "Freigegeben", "Aktiv", "Pausiert", "Archiviert"];
const STATUS_COLORS = {
  "Entwurf": "bg-gray-100 text-gray-600",
  "Freigegeben": "bg-blue-100 text-blue-700",
  "Aktiv": "bg-green-100 text-green-700",
  "Pausiert": "bg-yellow-100 text-yellow-700",
  "Archiviert": "bg-red-100 text-red-600",
};
const PILLAR_COLORS = {
  "Ernährung": "bg-emerald-100 text-emerald-800",
  "Training": "bg-blue-100 text-blue-800",
  "Nahrungsergänzung": "bg-purple-100 text-purple-800",
  "Umweltanpassung": "bg-cyan-100 text-cyan-800",
  "Alltagsbewegung": "bg-amber-100 text-amber-800",
  "Mindset": "bg-rose-100 text-rose-800",
};

export default function AdScriptList({ ads, onRefresh }) {
  const [expanded, setExpanded] = useState(null);

  const updateStatus = async (id, status) => {
    await base44.entities.AdScript.update(id, { status });
    onRefresh();
  };

  const deleteAd = async (id) => {
    if (!confirm("Ad löschen?")) return;
    await base44.entities.AdScript.delete(id);
    onRefresh();
  };

  if (ads.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-black/5">
        <p className="text-black/25 text-sm">Noch keine Ads gespeichert.</p>
        <p className="text-black/20 text-xs mt-1">Generiere deine erste Ad oben.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ads.map(ad => {
        const sections = (() => {
          try { return JSON.parse(ad.structured_json || "[]"); } catch { return []; }
        })();
        const isOpen = expanded === ad.id;

        return (
          <div key={ad.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            {/* Row */}
            <div className="flex items-center gap-3 px-5 py-4">
              <button onClick={() => setExpanded(isOpen ? null : ad.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                <Eye className="w-3.5 h-3.5 text-black/20 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black/80 truncate">{ad.title}</p>
                  {ad.zielgruppe_segment && (
                    <p className="text-[10px] text-black/35 truncate mt-0.5">{ad.zielgruppe_segment}</p>
                  )}
                </div>
              </button>

              <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-black/5 text-black/50 whitespace-nowrap">{ad.format?.split(" ")[0]} {ad.format?.split(" ")[1]}</span>
                {ad.themen_pillar && (
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${PILLAR_COLORS[ad.themen_pillar] || "bg-gray-100 text-gray-600"}`}>{ad.themen_pillar}</span>
                )}
                <span className="text-[10px] text-black/25 whitespace-nowrap">{ad.created_date ? new Date(ad.created_date).toLocaleDateString("de-DE") : new Date(ad.created_at || Date.now()).toLocaleDateString("de-DE")}</span>
              </div>

              {/* Status dropdown */}
              <div className="relative flex-shrink-0">
                <select
                  value={ad.status || "Entwurf"}
                  onChange={e => updateStatus(ad.id, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className={`appearance-none text-[10px] font-bold px-2.5 py-1 rounded-full border-none cursor-pointer pr-5 ${STATUS_COLORS[ad.status] || STATUS_COLORS["Entwurf"]}`}
                >
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <button onClick={() => deleteAd(ad.id)} className="p-1.5 rounded-lg text-black/20 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setExpanded(isOpen ? null : ad.id)} className="p-1.5 rounded-lg text-black/20 hover:bg-black/5 transition flex-shrink-0">
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div className="border-t border-black/5 px-5 py-5 bg-black/[0.01]">
                {sections.length > 0 ? (
                  <div className="space-y-3">
                    {sections.map(s => (
                      <div key={s.label} className="rounded-xl bg-white border border-black/5 p-4">
                        <p className="text-[9px] font-black text-black/25 uppercase tracking-widest mb-1.5">{s.label}</p>
                        <p className="text-sm text-black/70 leading-relaxed whitespace-pre-wrap">{s.text}</p>
                      </div>
                    ))}
                  </div>
                ) : ad.body_text ? (
                  <p className="text-sm text-black/60 leading-relaxed whitespace-pre-wrap">{ad.body_text}</p>
                ) : (
                  <p className="text-sm text-black/30">Kein Inhalt vorhanden.</p>
                )}
                {ad.notes && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Notizen</p>
                    <p className="text-xs text-amber-800">{ad.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}