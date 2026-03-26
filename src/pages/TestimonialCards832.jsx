import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Eye, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import TestimonialCardModal from "../components/testimonialcards/TestimonialCardModal";
import TestimonialForm from "../components/testimonialcards/TestimonialForm";

const PILLAR_COLORS = {
  "Ernährung": "bg-emerald-100 text-emerald-800",
  "Training": "bg-blue-100 text-blue-800",
  "Nahrungsergänzung": "bg-purple-100 text-purple-800",
  "Umweltanpassung": "bg-cyan-100 text-cyan-800",
  "Alltagsbewegung": "bg-amber-100 text-amber-800",
  "Mindset": "bg-rose-100 text-rose-800",
};

export default function TestimonialCards832() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewCard, setViewCard] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await base44.entities.Testimonial.list("-created_date");
    setTestimonials(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Aktualisiere viewCard wenn sich testimonials ändern
  useEffect(() => {
    if (viewCard) {
      const updated = testimonials.find(t => t.id === viewCard.id);
      if (updated) setViewCard(updated);
    }
  }, [testimonials]);

  const del = async (id) => {
    if (!confirm("Testimonial löschen?")) return;
    await base44.entities.Testimonial.delete(id);
    load();
  };

  const openNew = () => { setEditItem(null); setShowForm(true); };
  const openEdit = (t) => { setEditItem(t); setShowForm(true); };

  return (
    <div className="min-h-screen bg-[#F0EAD6] p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#00416A]">Testimonial Cards</h1>
            <p className="text-xs text-black/40 mt-1 uppercase tracking-widest">Visuelle Karten · Download</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00416A] text-white rounded-xl text-sm font-bold hover:bg-[#003356] transition">
            <Plus className="w-4 h-4" /> Neues Testimonial
          </button>
        </div>

        {loading ? (
          <p className="text-center py-16 text-black/25 text-sm">Laden...</p>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-2xl border border-black/5">
            <p className="text-black/30 text-base font-semibold mb-2">Noch keine Testimonials</p>
            <p className="text-black/20 text-sm mb-6">Erstelle dein erstes Testimonial um eine Card zu generieren.</p>
            <button onClick={openNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00416A] text-white rounded-xl text-sm font-bold hover:bg-[#003356] transition mx-auto">
              <Plus className="w-4 h-4" /> Testimonial anlegen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map(t => {
              const gewDelta = t.gewicht_start && t.gewicht_end
                ? (t.gewicht_end - t.gewicht_start).toFixed(1)
                : null;
              const initials = (t.client_name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

              return (
                <div key={t.id} className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Card top */}
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#00416A] flex items-center justify-center text-[#F0EAD6] text-sm font-bold flex-shrink-0"
                        style={t.avatar_url ? { backgroundImage: `url(${t.avatar_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
                        {!t.avatar_url && initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black/80 truncate">{t.client_name}</p>
                        {t.instagram_handle && <p className="text-xs text-black/35 truncate">{t.instagram_handle}</p>}
                      </div>
                      {t.is_active
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" title="Aktiv" />
                        : <XCircle className="w-4 h-4 text-black/20 flex-shrink-0" title="Inaktiv" />
                      }
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {t.zeitraum && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00416A]/10 text-[#00416A]">{t.zeitraum}</span>
                      )}
                      {t.pillar && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PILLAR_COLORS[t.pillar] || "bg-gray-100 text-gray-600"}`}>{t.pillar}</span>
                      )}
                      {t.zielgruppe_typ && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 text-black/40">{t.zielgruppe_typ}</span>
                      )}
                    </div>

                    {gewDelta !== null && (
                      <div className="flex items-center gap-2 mb-3 p-2.5 bg-[#00416A] rounded-xl">
                        <span className="text-xs text-white/60 font-semibold">Gewicht</span>
                        <span className="text-white font-bold text-sm">{t.gewicht_start?.toFixed(1)} → {t.gewicht_end?.toFixed(1)} kg</span>
                        <span className="ml-auto text-[#7DDDD4] font-black text-sm">{gewDelta} kg</span>
                      </div>
                    )}

                    {t.problem && (
                      <p className="text-xs text-black/40 line-clamp-2 leading-relaxed">{t.problem}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-black/5 flex">
                    <button onClick={() => setViewCard(t)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-[#00416A] hover:bg-[#00416A]/5 transition">
                      <Eye className="w-3.5 h-3.5" /> Card anzeigen
                    </button>
                    <div className="w-px bg-black/5" />
                    <button onClick={() => openEdit(t)}
                      className="px-4 py-3 text-black/30 hover:text-black/60 hover:bg-black/5 transition">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px bg-black/5" />
                    <button onClick={() => del(t.id)}
                      className="px-4 py-3 text-black/20 hover:text-red-500 hover:bg-red-50 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {viewCard && (
        <TestimonialCardModal testimonial={viewCard} onClose={() => setViewCard(null)} />
      )}
      {showForm && (
        <TestimonialForm
          key={editItem?.id || "new"}
          testimonial={editItem}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); setTimeout(() => load(), 100); }}
        />
      )}
    </div>
  );
}