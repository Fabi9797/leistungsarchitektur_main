import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, Check } from "lucide-react";

const PILLARS = ["Ernährung", "Training", "Nahrungsergänzung", "Umweltanpassung", "Alltagsbewegung", "Mindset"];
const ALL_METRICS = ["gewicht", "hrv", "ruhepuls", "schritte"];
const METRIC_LABELS = { gewicht: "Gewicht", hrv: "HRV", ruhepuls: "Ruhepuls", schritte: "Schritte" };

export default function TestimonialForm({ testimonial, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    if (!testimonial) {
      return {
        client_name: "", problem: "", ergebnis: "", zitat: "", zielgruppe_typ: "",
        pillar: "", is_active: true, instagram_handle: "", zeitraum: "", avatar_url: "",
        gewicht_start: "", gewicht_end: "", gewicht_verlauf_json: "",
        hrv_start: "", hrv_end: "", hrv_verlauf_json: "",
        ruhepuls_start: "", ruhepuls_end: "", ruhepuls_verlauf_json: "",
        schritte_start: "", schritte_end: "", schritte_verlauf_json: "",
        sichtbare_metriken: '["gewicht","hrv","ruhepuls","schritte"]',
      };
    }
    return {
      client_name: testimonial.client_name || "",
      problem: testimonial.problem || "",
      ergebnis: testimonial.ergebnis || "",
      zitat: testimonial.zitat || "",
      zielgruppe_typ: testimonial.zielgruppe_typ || "",
      pillar: testimonial.pillar || "",
      is_active: testimonial.is_active ?? true,
      instagram_handle: testimonial.instagram_handle || "",
      zeitraum: testimonial.zeitraum || "",
      avatar_url: testimonial.avatar_url || "",
      gewicht_start: testimonial.gewicht_start || "",
      gewicht_end: testimonial.gewicht_end || "",
      gewicht_verlauf_json: testimonial.gewicht_verlauf_json || "",
      hrv_start: testimonial.hrv_start || "",
      hrv_end: testimonial.hrv_end || "",
      hrv_verlauf_json: testimonial.hrv_verlauf_json || "",
      ruhepuls_start: testimonial.ruhepuls_start || "",
      ruhepuls_end: testimonial.ruhepuls_end || "",
      ruhepuls_verlauf_json: testimonial.ruhepuls_verlauf_json || "",
      schritte_start: testimonial.schritte_start || "",
      schritte_end: testimonial.schritte_end || "",
      schritte_verlauf_json: testimonial.schritte_verlauf_json || "",
      sichtbare_metriken: testimonial.sichtbare_metriken || '["gewicht","hrv","ruhepuls","schritte"]',
    };
  });

  const [csvText, setCsvText] = useState("");
  const [saving, setSaving] = useState(false);
  
  let sichtbar = [];
  try {
    sichtbar = JSON.parse(form.sichtbare_metriken);
  } catch {
    sichtbar = ["gewicht", "hrv", "ruhepuls", "schritte"];
  }

  const updateForm = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleMetric = (metric) => {
    const updated = sichtbar.includes(metric)
      ? sichtbar.filter(m => m !== metric)
      : [...sichtbar, metric];
    updateForm("sichtbare_metriken", JSON.stringify(updated));
  };

  const parseCSVData = (text) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const headerIdx = lines.findIndex(l => {
      const lower = l.toLowerCase();
      return lower.includes("gewicht") || lower.includes("hrv") || lower.includes("ruhepuls") || lower.includes("schritt");
    });
    if (headerIdx === -1) return null;

    const headers = lines[headerIdx].split(/[;\t,]/).map(h => h.trim().toLowerCase());
    const colIdx = {
      gewicht: headers.findIndex(h => h.includes("gewicht") || h.includes("weight") || h.includes("körpergewicht")),
      hrv: headers.findIndex(h => h.includes("hrv") || h.includes("herzfrequenz")),
      ruhepuls: headers.findIndex(h => h.includes("ruhepuls") || h.includes("resting") || h.includes("puls")),
      schritte: headers.findIndex(h => h.includes("schritt") || h.includes("step")),
    };

    const result = { gewicht: [], hrv: [], ruhepuls: [], schritte: [] };

    for (let i = headerIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^kw[:\s]/i.test(line) || line.includes("∅:") || line.includes("Ø:")) continue;
      const cols = line.split(/[;\t,]/);

      Object.entries(colIdx).forEach(([key, idx]) => {
        if (idx >= 0 && cols[idx]) {
          const val = parseFloat(cols[idx].replace(",", ".").replace(/[^\d.-]/g, ""));
          if (!isNaN(val) && val > 0) result[key].push(val);
        }
      });
    }

    return result;
  };

  const handleCSVImport = () => {
    const parsed = parseCSVData(csvText);
    if (!parsed) {
      alert("Keine verwertbaren Daten gefunden.");
      return;
    }

    const updates = {};
    Object.entries(parsed).forEach(([key, arr]) => {
      if (arr.length === 0) return;
      const jsonStr = JSON.stringify(arr.map(v => Math.round(v * 10) / 10));
      if (key === "gewicht") {
        updates.gewicht_verlauf_json = jsonStr;
        updates.gewicht_start = arr[0];
        updates.gewicht_end = arr[arr.length - 1];
      } else if (key === "hrv") {
        updates.hrv_verlauf_json = jsonStr;
        updates.hrv_start = arr[0];
        updates.hrv_end = arr[arr.length - 1];
      } else if (key === "ruhepuls") {
        updates.ruhepuls_verlauf_json = jsonStr;
        updates.ruhepuls_start = arr[0];
        updates.ruhepuls_end = arr[arr.length - 1];
      } else if (key === "schritte") {
        updates.schritte_verlauf_json = jsonStr;
        updates.schritte_start = arr[0];
        updates.schritte_end = arr[arr.length - 1];
      }
    });
    setForm(prev => ({ ...prev, ...updates }));
    alert("Import erfolgreich!");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText(ev.target.result);
    reader.readAsText(file, "UTF-8");
  };

  const save = async () => {
    if (!form.client_name.trim()) {
      alert("Name erforderlich");
      return;
    }
    setSaving(true);

    // Validiere JSON Arrays
    const validateJSON = (str) => {
      if (!str) return null;
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) return str;
        return null;
      } catch {
        return null;
      }
    };

    const data = {
      client_name: form.client_name,
      problem: form.problem,
      ergebnis: form.ergebnis,
      zitat: form.zitat,
      zielgruppe_typ: form.zielgruppe_typ,
      pillar: form.pillar || null,
      is_active: form.is_active,
      instagram_handle: form.instagram_handle,
      zeitraum: form.zeitraum,
      avatar_url: form.avatar_url,
      sichtbare_metriken: form.sichtbare_metriken || '["gewicht","hrv","ruhepuls","schritte"]',
      gewicht_start: form.gewicht_start && form.gewicht_start.trim() ? parseFloat(form.gewicht_start) : null,
      gewicht_end: form.gewicht_end && form.gewicht_end.trim() ? parseFloat(form.gewicht_end) : null,
      gewicht_verlauf_json: validateJSON(form.gewicht_verlauf_json),
      hrv_start: form.hrv_start && form.hrv_start.trim() ? parseFloat(form.hrv_start) : null,
      hrv_end: form.hrv_end && form.hrv_end.trim() ? parseFloat(form.hrv_end) : null,
      hrv_verlauf_json: validateJSON(form.hrv_verlauf_json),
      ruhepuls_start: form.ruhepuls_start && form.ruhepuls_start.trim() ? parseFloat(form.ruhepuls_start) : null,
      ruhepuls_end: form.ruhepuls_end && form.ruhepuls_end.trim() ? parseFloat(form.ruhepuls_end) : null,
      ruhepuls_verlauf_json: validateJSON(form.ruhepuls_verlauf_json),
      schritte_start: form.schritte_start && form.schritte_start.trim() ? parseFloat(form.schritte_start) : null,
      schritte_end: form.schritte_end && form.schritte_end.trim() ? parseFloat(form.schritte_end) : null,
      schritte_verlauf_json: validateJSON(form.schritte_verlauf_json),
    };

    try {
      if (testimonial?.id) {
        await base44.entities.Testimonial.update(testimonial.id, data);
      } else {
        await base44.entities.Testimonial.create(data);
      }
      setSaving(false);
      onSaved?.();
      onClose?.();
    } catch (err) {
      setSaving(false);
      console.error("Save error:", err);
      alert(`Fehler: ${err.message || "Speichern fehlgeschlagen"}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F0EAD6] rounded-2xl w-full max-w-2xl shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <h2 className="text-base font-bold text-[#00416A]">
            {testimonial?.id ? "Testimonial bearbeiten" : "Neues Testimonial"}
          </h2>
          <button onClick={onClose}><X className="w-5 h-5 text-black/30" /></button>
        </div>

        <div className="px-6 py-5 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basis */}
          <div>
            <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-3">Basis-Infos</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Name *</label>
                <input type="text" placeholder="z.B. Frederick" value={form.client_name} onChange={e => updateForm("client_name", e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Instagram Handle</label>
                <input type="text" placeholder="@name" value={form.instagram_handle} onChange={e => updateForm("instagram_handle", e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Zeitraum</label>
                <input type="text" placeholder="z.B. 12 Wochen" value={form.zeitraum} onChange={e => updateForm("zeitraum", e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Zielgruppen-Typ</label>
                <input type="text" placeholder="Unternehmer, Läufer..." value={form.zielgruppe_typ} onChange={e => updateForm("zielgruppe_typ", e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Pillar</label>
                <select value={form.pillar} onChange={e => updateForm("pillar", e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white">
                  <option value="">–</option>
                  {PILLARS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Profilbild URL</label>
                <input type="text" placeholder="https://..." value={form.avatar_url} onChange={e => updateForm("avatar_url", e.target.value)}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Problem</label>
                <textarea value={form.problem} onChange={e => updateForm("problem", e.target.value)} rows={2}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white"
                  placeholder="z.B. chronische Rückenschmerzen, 15kg Übergewicht..." />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Ergebnis</label>
                <textarea value={form.ergebnis} onChange={e => updateForm("ergebnis", e.target.value)} rows={2}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white"
                  placeholder="z.B. schmerzfrei in 8 Wochen..." />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Direktes Zitat</label>
                <textarea value={form.zitat} onChange={e => updateForm("zitat", e.target.value)} rows={2}
                  className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white"
                  placeholder='"Ich habe endlich wieder Energie..."' />
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <input type="checkbox" checked={form.is_active} onChange={e => updateForm("is_active", e.target.checked)} id="is_active" className="rounded" />
                <label htmlFor="is_active" className="text-sm text-black/60 cursor-pointer">Aktiv (für Ads verwenden)</label>
              </div>
            </div>
          </div>

          {/* Sichtbare Metriken */}
          <div>
            <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-3">Sichtbare Metriken auf der Card</p>
            <div className="flex gap-2 flex-wrap">
              {ALL_METRICS.map(m => (
                <button key={m} onClick={() => toggleMetric(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${sichtbar.includes(m) ? "bg-[#00416A] text-white border-[#00416A]" : "bg-white text-black/40 border-black/10"}`}>
                  {METRIC_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* CSV Import */}
          <div className="bg-white rounded-2xl border border-black/8 p-4">
            <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-3">Daten importieren</p>
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 px-3 py-2 bg-[#00416A]/10 text-[#00416A] rounded-xl text-xs font-bold cursor-pointer hover:bg-[#00416A]/15 transition">
                <Upload className="w-3.5 h-3.5" />
                CSV/Excel hochladen
                <input type="file" accept=".csv,.txt,.xlsx" onChange={handleFileUpload} className="hidden" />
              </label>
              <span className="text-xs text-black/30">oder Text unten einfügen</span>
            </div>
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              rows={4}
              placeholder={"Datum;Körpergewicht (kg);HRV (ms);Ruhepuls (bpm);Schrittanzahl\n01.01.2025;88.5;45;72;6500\n..."}
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
            />
            <button onClick={handleCSVImport}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-xs font-bold hover:bg-[#003356] transition">
              <Upload className="w-3.5 h-3.5" />
              Daten importieren & parsen
            </button>
          </div>

          {/* Metriken manuell */}
          <div>
            <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mb-3">Metriken (manuell / nach Import)</p>
            <div className="space-y-4">
              {[
                { key: "gewicht", label: "Gewicht (kg)" },
                { key: "hrv", label: "HRV (ms)" },
                { key: "ruhepuls", label: "Ruhepuls (bpm)" },
                { key: "schritte", label: "Schritte (/Tag)" },
              ].map(({ key, label }) => (
                <div key={key} className="bg-white rounded-xl border border-black/8 p-3">
                  <p className="text-[10px] font-bold text-black/40 uppercase mb-2">{label}</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Start</label>
                      <input type="number" value={form[`${key}_start`]} onChange={e => updateForm(`${key}_start`, e.target.value)}
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Ende</label>
                      <input type="number" value={form[`${key}_end`]} onChange={e => updateForm(`${key}_end`, e.target.value)}
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-black/35 uppercase tracking-wider block mb-1">Verlauf (JSON-Array)</label>
                    <textarea value={form[`${key}_verlauf_json`]} onChange={e => updateForm(`${key}_verlauf_json`, e.target.value)} rows={2}
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white"
                      placeholder="[88.5, 87.2, ...]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-black/8 flex gap-3">
          <button onClick={save} disabled={saving || !form.client_name}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00416A] text-white rounded-xl text-sm font-bold hover:bg-[#003356] transition disabled:opacity-40">
            <Check className="w-4 h-4" />{saving ? "Speichern..." : "Speichern"}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black/40 hover:bg-black/5 transition">Abbrechen</button>
        </div>
      </div>
    </div>
  );
}