import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, Mic, Check, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import AboutSectionAdmin from "@/components/admin/AboutSectionAdmin";

const EMPTY_TESTIMONIAL = {
  client_name: "",
  tagline: "",
  stats: "",
  zitat: "",
  foto_url: "",
  instagram_handle: "",
  audio_url: "",
  sort_order: 99,
  is_active: true,
};

export default function TestimonialAdmin832() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [uploading, setUploading] = useState({});
  const [localData, setLocalData] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [newData, setNewData] = useState(EMPTY_TESTIMONIAL);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    const list = await base44.entities.Testimonial.list("sort_order");
    setTestimonials(list);
    const local = {};
    list.forEach(t => { local[t.id] = { ...t }; });
    setLocalData(local);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const update = (id, field, value) => {
    setLocalData(d => ({ ...d, [id]: { ...d[id], [field]: value } }));
  };

  const save = async (id) => {
    setSaving(s => ({ ...s, [id]: true }));
    await base44.entities.Testimonial.update(id, localData[id]);
    setSaving(s => ({ ...s, [id]: false }));
    setSaved(s => ({ ...s, [id]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2000);
  };

  const toggleActive = async (t) => {
    const newVal = !t.is_active;
    await base44.entities.Testimonial.update(t.id, { is_active: newVal });
    setTestimonials(list => list.map(x => x.id === t.id ? { ...x, is_active: newVal } : x));
    setLocalData(d => ({ ...d, [t.id]: { ...d[t.id], is_active: newVal } }));
  };

  const deleteTestimonial = async (id) => {
    if (!confirm("Testimonial wirklich löschen?")) return;
    await base44.entities.Testimonial.delete(id);
    setTestimonials(list => list.filter(t => t.id !== id));
  };

  const uploadAudio = async (id, file) => {
    if (!file) return;
    setUploading(u => ({ ...u, [id]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update(id, "audio_url", file_url);
    await base44.entities.Testimonial.update(id, { audio_url: file_url });
    setUploading(u => ({ ...u, [id]: false }));
    setSaved(s => ({ ...s, [`audio_${id}`]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [`audio_${id}`]: false })), 2000);
  };

  const uploadFoto = async (id, file) => {
    if (!file) return;
    setUploading(u => ({ ...u, [`foto_${id}`]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update(id, "foto_url", file_url);
    await base44.entities.Testimonial.update(id, { foto_url: file_url });
    setUploading(u => ({ ...u, [`foto_${id}`]: false }));
    setSaved(s => ({ ...s, [`foto_${id}`]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [`foto_${id}`]: false })), 2000);
  };

  const createNew = async () => {
    if (!newData.client_name.trim()) return;
    setCreating(true);
    await base44.entities.Testimonial.create(newData);
    setCreating(false);
    setShowNew(false);
    setNewData(EMPTY_TESTIMONIAL);
    load();
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-white animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">Testimonials</h1>
            <p className="text-white/40 text-sm">Alle Inhalte der Startseiten-Testimonials verwalten.</p>
          </div>
          <button
            onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Neu
          </button>
        </div>

        {/* New Testimonial Form */}
        {showNew && (
          <div className="mb-6 bg-[#1a1a1a] rounded-2xl p-6 border border-amber-400/30">
            <h2 className="text-white font-bold mb-4">Neues Testimonial</h2>
            <div className="space-y-3">
              <Field label="Name *" value={newData.client_name} onChange={v => setNewData(d => ({ ...d, client_name: v }))} />
              <Field label="Tagline" value={newData.tagline} onChange={v => setNewData(d => ({ ...d, tagline: v }))} />
              <Field label="Stats (z.B. -14 kg · 10 Wochen)" value={newData.stats} onChange={v => setNewData(d => ({ ...d, stats: v }))} />
              <Field label="Zitat" value={newData.zitat} onChange={v => setNewData(d => ({ ...d, zitat: v }))} textarea />
              <Field label="Foto URL" value={newData.foto_url} onChange={v => setNewData(d => ({ ...d, foto_url: v }))} />
              <Field label="Instagram Link" value={newData.instagram_handle} onChange={v => setNewData(d => ({ ...d, instagram_handle: v }))} />
              <Field label="Reihenfolge" value={String(newData.sort_order)} onChange={v => setNewData(d => ({ ...d, sort_order: Number(v) }))} type="number" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={createNew} disabled={creating || !newData.client_name.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black rounded-lg text-sm font-semibold disabled:opacity-40 transition-colors">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Erstellen
              </button>
              <button onClick={() => setShowNew(false)} className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Über Mich Sektion */}
        <div className="mb-8">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Über Mich – Startseite</p>
          <AboutSectionAdmin />
        </div>

        <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Athleten-Testimonials</p>
        {/* Testimonial Cards */}
        <div className="space-y-4">
          {testimonials.map(t => {
            const d = localData[t.id] || t;
            const isOpen = expanded[t.id];
            return (
              <div key={t.id} className={`bg-[#1a1a1a] rounded-2xl border ${t.is_active ? "border-white/5" : "border-white/5 opacity-60"}`}>
                {/* Header */}
                <div className="flex items-center gap-4 p-5">
                  {d.foto_url ? (
                    <img src={d.foto_url} className="w-12 h-12 rounded-full object-cover flex-shrink-0" alt={d.client_name} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-white/30 text-lg font-bold">
                      {d.client_name?.[0] || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{d.client_name || "Unbenannt"}</p>
                    <p className="text-white/40 text-xs truncate">{d.stats || "Keine Stats"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {saved[t.id] && <span className="text-green-400 text-xs flex items-center gap-1"><Check className="w-3 h-3" />Gespeichert</span>}
                    <button onClick={() => toggleActive(t)} title={t.is_active ? "Ausblenden" : "Anzeigen"}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                      {t.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deleteTestimonial(t.id)} title="Löschen"
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggle(t.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Edit Area */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Name" value={d.client_name || ""} onChange={v => update(t.id, "client_name", v)} />
                      <Field label="Reihenfolge" value={String(d.sort_order ?? 99)} onChange={v => update(t.id, "sort_order", Number(v))} type="number" />
                      <Field label="Stats (z.B. -14 kg · 10 Wochen)" value={d.stats || ""} onChange={v => update(t.id, "stats", v)} />
                      <Field label="Tagline" value={d.tagline || ""} onChange={v => update(t.id, "tagline", v)} />
                    </div>
                    <Field label="Zitat" value={d.zitat || ""} onChange={v => update(t.id, "zitat", v)} textarea />
                    <Field label="Instagram Link (URL)" value={d.instagram_handle || ""} onChange={v => update(t.id, "instagram_handle", v)} />

                    {/* Foto Upload */}
                    <div>
                      <p className="text-white/40 text-xs mb-2 font-medium">Foto (Startseite)</p>
                      <div className="flex gap-2 items-center">
                        <Field label="" value={d.foto_url || ""} onChange={v => update(t.id, "foto_url", v)} placeholder="https://... oder Datei hochladen" />
                        <label className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed cursor-pointer text-xs font-medium transition-colors
                          ${uploading[`foto_${t.id}`] ? "border-amber-400/30 text-amber-400/50" : "border-white/20 text-white/40 hover:border-amber-400/40 hover:text-amber-400"}`}>
                          {uploading[`foto_${t.id}`] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          {saved[`foto_${t.id}`] ? <Check className="w-3 h-3 text-green-400" /> : "Upload"}
                          <input type="file" accept="image/*" className="hidden" disabled={uploading[`foto_${t.id}`]}
                            onChange={e => uploadFoto(t.id, e.target.files[0])} />
                        </label>
                      </div>
                    </div>

                    {/* Audio Upload */}
                    <div>
                      <p className="text-white/40 text-xs mb-2 font-medium">Audio (Kundenstimme)</p>
                      {d.audio_url && (
                        <audio controls src={d.audio_url} className="w-full mb-2 rounded-lg" style={{ height: 36 }} />
                      )}
                      <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-sm font-medium
                        ${uploading[t.id] ? "border-amber-400/30 text-amber-400/50" : "border-white/10 text-white/40 hover:border-amber-400/40 hover:text-amber-400"}`}>
                        {uploading[t.id] ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird hochgeladen...</>
                          : saved[`audio_${t.id}`] ? <><Check className="w-4 h-4 text-green-400" /> Gespeichert</>
                          : <><Mic className="w-4 h-4" /> MP3 hochladen</>}
                        <input type="file" accept="audio/*" className="hidden" disabled={uploading[t.id]}
                          onChange={e => uploadAudio(t.id, e.target.files[0])} />
                      </label>
                    </div>

                    <button onClick={() => save(t.id)} disabled={saving[t.id]}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-black rounded-xl text-sm font-semibold transition-colors disabled:opacity-40">
                      {saving[t.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Änderungen speichern
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea, type = "text", placeholder }) {
  const cls = "w-full bg-[#0f0f0f] text-white text-sm border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-amber-400/50 placeholder-white/20 resize-none";
  return (
    <div className="flex-1">
      {label && <p className="text-white/40 text-xs mb-1 font-medium">{label}</p>}
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} rows={3} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}