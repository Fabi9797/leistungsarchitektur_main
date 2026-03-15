import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Download, Trash2, Plus, Sparkles, Loader2 } from "lucide-react";
import { TypeBadge, CategoryBadge, StatusBadge } from "./ContentBadge";
import jsPDF from "jspdf";

const VIDEO_DURATIONS = ["15 Sek", "30 Sek", "45 Sek", "60 Sek", "90 Sek"];

const TYPES = ["Reden", "B-Roll", "Slideshow", "Reel", "Story", "Carousel"];
const CATEGORIES = ["Training", "Ernährung", "Supplements", "Steuerung"];
const STATUSES = ["Idee", "In Planung", "Gedreht", "Geschnitten", "Veröffentlicht"];

export default function ContentEditor({ piece, onClose, onSaved }) {
  const [form, setForm] = useState(piece || {
    title: "", type: "Reden", category: "Training", status: "Idee",
    planned_date: "", hook: "", script: "", notes: "", hashtags: "", cta: "", images: []
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    if (form.id) {
      await base44.entities.ContentPiece.update(form.id, form);
    } else {
      await base44.entities.ContentPiece.create(form);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm("Content piece wirklich löschen?")) return;
    await base44.entities.ContentPiece.delete(form.id);
    onSaved();
    onClose();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, images: [...(p.images || []), { url: file_url, caption: "" }] }));
    setUploading(false);
  };

  const removeImage = (idx) => {
    setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const updateCaption = (idx, val) => {
    setForm(p => {
      const imgs = [...p.images];
      imgs[idx] = { ...imgs[idx], caption: val };
      return { ...p, images: imgs };
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(form.title || "Ohne Titel", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`${form.type} · ${form.category} · ${form.status}`, margin, y);
    y += 8;
    if (form.planned_date) {
      doc.text(`Datum: ${form.planned_date}`, margin, y);
      y += 8;
    }
    y += 4;
    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 8;

    if (form.hook) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("HOOK", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const hookLines = doc.splitTextToSize(form.hook, 170);
      doc.text(hookLines, margin, y);
      y += hookLines.length * 6 + 8;
    }

    if (form.script) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("SKRIPT", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(form.script, 170);
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 6;
      });
      y += 6;
    }

    if (form.cta) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CALL-TO-ACTION", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(form.cta, 170), margin, y);
      y += 10;
    }

    if (form.hashtags) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(form.hashtags, margin, y);
    }

    doc.save(`${(form.title || "content").replace(/\s+/g, "_")}.pdf`);
  };

  const isSlideshow = form.type === "Slideshow" || form.type === "Carousel";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-[#00416A] text-base">{form.id ? "Content bearbeiten" : "Neues Content Piece"}</h2>
            {form.type && <TypeBadge type={form.type} />}
            {form.category && <CategoryBadge category={form.category} />}
            {form.status && <StatusBadge status={form.status} />}
          </div>
          <button onClick={onClose} className="p-1 text-black/30 hover:text-black/60"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Basis */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label-xs">Titel</label>
              <input value={form.title} onChange={e => set("title", e.target.value)}
                className="input-field" placeholder="z.B. 3 Fehler beim Muskelaufbau" />
            </div>
            <div>
              <label className="label-xs">Content-Art</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className="input-field">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Kategorie</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="input-field">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Geplantes Datum</label>
              <input type="date" value={form.planned_date || ""} onChange={e => set("planned_date", e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Hook */}
          <div>
            <label className="label-xs">🎣 Hook</label>
            <textarea value={form.hook || ""} onChange={e => set("hook", e.target.value)}
              rows={2} placeholder="Der erste Satz, der die Zuschauer fesselt..."
              className="input-field resize-none" />
          </div>

          {/* Skript oder Bilder */}
          {isSlideshow ? (
            <div>
              <label className="label-xs">🖼 Slides / Bilder</label>
              <div className="space-y-2 mt-1">
                {(form.images || []).map((img, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-black/3 rounded-xl p-3">
                    <img src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    <input value={img.caption || ""} onChange={e => updateCaption(idx, e.target.value)}
                      placeholder="Bildunterschrift / Text auf Slide"
                      className="flex-1 border border-black/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
                    <button onClick={() => removeImage(idx)} className="text-black/20 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 border-2 border-dashed border-black/15 rounded-xl text-sm text-black/40 hover:border-[#00416A]/40 hover:text-[#00416A] transition">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  {uploading ? <span>Uploading...</span> : <><Plus className="w-4 h-4" /> Bild hinzufügen</>}
                </label>
              </div>
            </div>
          ) : (
            <div>
              <label className="label-xs">📝 Skript</label>
              <textarea value={form.script || ""} onChange={e => set("script", e.target.value)}
                rows={8} placeholder="Schreibe dein vollständiges Skript hier..."
                className="input-field resize-none font-mono text-sm" />
            </div>
          )}

          {/* CTA & Hashtags */}
          <div>
            <label className="label-xs">📣 Call-to-Action</label>
            <input value={form.cta || ""} onChange={e => set("cta", e.target.value)}
              placeholder="z.B. Folge mir für mehr Tipps!" className="input-field" />
          </div>
          <div>
            <label className="label-xs"># Hashtags</label>
            <input value={form.hashtags || ""} onChange={e => set("hashtags", e.target.value)}
              placeholder="#fitness #ernährung #coaching" className="input-field" />
          </div>
          <div>
            <label className="label-xs">Notizen</label>
            <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)}
              rows={2} className="input-field resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/8 bg-black/2 sticky bottom-0">
          <div className="flex gap-2">
            {form.id && (
              <button onClick={handleDelete} className="px-3 py-2 text-red-500 hover:text-red-700 text-sm">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {(form.script || form.hook) && (
              <button onClick={downloadPDF}
                className="flex items-center gap-1.5 px-4 py-2 border border-[#00416A]/30 text-[#00416A] rounded-xl text-sm font-medium hover:bg-[#00416A]/5 transition">
                <Download className="w-4 h-4" /> PDF
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-black/10 rounded-xl text-sm text-black/50 hover:bg-white transition">
              Abbrechen
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition disabled:opacity-50">
              {saving ? "Speichern..." : "Speichern"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .label-xs { display: block; font-size: 10px; font-weight: 700; color: rgba(0,0,0,0.4); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .input-field { width: 100%; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; padding: 8px 12px; font-size: 14px; outline: none; }
        .input-field:focus { box-shadow: 0 0 0 2px rgba(0,65,106,0.15); }
      `}</style>
    </div>
  );
}