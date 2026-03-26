import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const PILLARS = ["Ernährung", "Training", "Nahrungsergänzung", "Umweltanpassung", "Alltagsbewegung", "Mindset"];
const EMPTY = { client_name: "", problem: "", ergebnis: "", zitat: "", zielgruppe_typ: "", pillar: "", is_active: true };

export default function TestimonialManager({ testimonials, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (t) => { setForm({ ...t }); setEditing(t.id); setShowForm(true); };
  const cancel = () => { setShowForm(false); setEditing(null); };

  const save = async () => {
    if (!form.client_name) return;
    setSaving(true);
    if (editing) {
      await base44.entities.Testimonial.update(editing, form);
    } else {
      await base44.entities.Testimonial.create(form);
    }
    setSaving(false);
    setShowForm(false);
    onRefresh();
  };

  const del = async (id) => {
    if (!confirm("Testimonial löschen?")) return;
    await base44.entities.Testimonial.delete(id);
    onRefresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-black/60">Testimonials ({testimonials.length})</h3>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 bg-[#00416A] text-white rounded-xl text-xs font-bold hover:bg-[#003356] transition">
          <Plus className="w-3.5 h-3.5" /> Neu
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-black/8 p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-black/70">{editing ? "Testimonial bearbeiten" : "Neues Testimonial"}</p>
            <button onClick={cancel}><X className="w-4 h-4 text-black/30" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Name *</label>
              <input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))}
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Zielgruppen-Typ</label>
              <input value={form.zielgruppe_typ} onChange={e => setForm(f => ({ ...f, zielgruppe_typ: e.target.value }))}
                placeholder="z.B. Unternehmer, Läufer"
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Problem</label>
              <input value={form.problem} onChange={e => setForm(f => ({ ...f, problem: e.target.value }))}
                placeholder="z.B. chronische Rückenschmerzen"
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Ergebnis</label>
              <input value={form.ergebnis} onChange={e => setForm(f => ({ ...f, ergebnis: e.target.value }))}
                placeholder="z.B. schmerzfrei in 8 Wochen"
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Direktes Zitat</label>
              <textarea value={form.zitat} onChange={e => setForm(f => ({ ...f, zitat: e.target.value }))}
                rows={2} placeholder='"Ich habe endlich wieder Energie..."'
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Pillar</label>
              <select value={form.pillar} onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))}
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20">
                <option value="">Kein Pillar</option>
                {PILLARS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                <span className="text-sm text-black/60">Aktiv (für Ads verwenden)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={saving || !form.client_name}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00416A] text-white rounded-xl text-xs font-bold hover:bg-[#003356] transition disabled:opacity-40">
              <Check className="w-3.5 h-3.5" /> {saving ? "Speichern..." : "Speichern"}
            </button>
            <button onClick={cancel} className="px-4 py-2 rounded-xl text-xs font-semibold text-black/40 hover:bg-black/5 transition">Abbrechen</button>
          </div>
        </div>
      )}

      {testimonials.length === 0 && !showForm ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-black/5">
          <p className="text-black/25 text-sm">Noch keine Testimonials.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-black/5 px-4 py-3 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-black/80">{t.client_name}</p>
                  {t.zielgruppe_typ && <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/40 font-semibold">{t.zielgruppe_typ}</span>}
                  {t.pillar && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00416A]/10 text-[#00416A] font-semibold">{t.pillar}</span>}
                  {!t.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 font-semibold">Inaktiv</span>}
                </div>
                {(t.problem || t.ergebnis) && (
                  <p className="text-xs text-black/40 truncate">
                    {t.problem && <span>{t.problem}</span>}
                    {t.problem && t.ergebnis && <span className="mx-1 text-black/20">→</span>}
                    {t.ergebnis && <span>{t.ergebnis}</span>}
                  </p>
                )}
                {t.zitat && <p className="text-xs text-black/50 italic mt-0.5 truncate">"{t.zitat}"</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-black/20 hover:text-[#00416A] hover:bg-[#00416A]/5 transition">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => del(t.id)} className="p-1.5 rounded-lg text-black/20 hover:text-red-500 hover:bg-red-50 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}