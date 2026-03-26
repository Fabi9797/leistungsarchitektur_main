import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, RotateCcw, Save, Copy, Check, Pencil, X } from "lucide-react";

const FORMATS = ["Long Form (45-90 Sek.)", "Short Form (15-25 Sek.)", "B-Roll (12 Sek.)", "Instagram Caption"];
const PILLARS = ["Ernährung", "Training", "Nahrungsergänzung", "Umweltanpassung", "Alltagsbewegung", "Mindset"];

const PILLAR_COLORS = {
  "Ernährung": "bg-emerald-100 text-emerald-800",
  "Training": "bg-blue-100 text-blue-800",
  "Nahrungsergänzung": "bg-purple-100 text-purple-800",
  "Umweltanpassung": "bg-cyan-100 text-cyan-800",
  "Alltagsbewegung": "bg-amber-100 text-amber-800",
  "Mindset": "bg-rose-100 text-rose-800",
};

const STATUS_COLORS = {
  "Entwurf": "bg-gray-100 text-gray-600",
  "Freigegeben": "bg-blue-100 text-blue-700",
  "Aktiv": "bg-green-100 text-green-700",
  "Pausiert": "bg-yellow-100 text-yellow-700",
  "Archiviert": "bg-red-100 text-red-600",
};

const SYSTEM_PROMPT = `Du bist der Ad-Texter für Fabian Aichem (@fabian_aichem), einen Performance- und Fitness-Coach mit der Methodik 'Leistungsarchitektur'. 

ZIELGRUPPE: Männer zwischen 30 und 45, die früher sportlich waren, jetzt aber durch anspruchsvolle Karrieren (Unternehmer, Führungskräfte) ihre Fitness vernachlässigt haben. Sie wollen ihre Leistungsfähigkeit zurück – körperlich und mental.

MARKE & TON: Premium, ruhig, kompetent. Wie ein erfahrener Freund, der weiß wovon er redet. Keine Sensationsmache, keine leeren Versprechen. Faktenbasiert, spezifisch, authentisch. Keine Floskeln wie 'Game-Changer' oder 'nächstes Level'. 

POSITIONIERUNG: Fabian vereint 6 Säulen: Ernährung, Training, Nahrungsergänzung, Umweltanpassung, Alltagsbewegung, Mindset & Sparring Partner. Er ist kein reiner Fitness-Coach, sondern baut eine individuelle Leistungsarchitektur.

AD-REGELN (basierend auf dem HC Ad Framework):
- Ziel jeder Ad ist NICHT das Angebot zu verkaufen, sondern NUR den Follow zu generieren
- Struktur: Hook → Qualifikation → Body → CTA
- Hook muss in 1-2 Sekunden greifen
- Qualifikation: Die RICHTIGEN ansprechen, nicht die meisten
- CTA: Klar, direkt, nur EINE Handlung: Folgen
- Meta-konform: Keine unrealistischen Versprechen, keine Vorher-Nachher, keine Zeitangaben bei Transformationen

FORMATE:
- Long Form (45-90 Sek.): HOOK → AUDIENCE CALL-OUT → MORE SPECIFIC → CTA 1 → SOCIAL PROOF → BENEFIT → AUTHORITY → BENEFIT 2 → CTA 2
- Short Form (15-25 Sek.): HOOK → CALL OUT → CTA 1 → SOCIAL PROOF → CTA 2
- B-Roll (12 Sek.): 'Wie ich darauf warte, dass [Zielgruppe] mir endlich folgt... damit [Outcome].' Zwei Texteinblendungen.
- Instagram Caption: Social-Proof-basiert mit 2-3 Klientengeschichten und CTA zum Folgen.

WICHTIG: Antworte NUR mit einem JSON-Objekt (kein Markdown, keine Backticks). Format:
{"hook":"Der Hook-Text","sections":[{"label":"HOOK","text":"..."},{"label":"AUDIENCE CALL-OUT","text":"..."}],"full_text":"Der komplette Text am Stück","meta_check":"Kurze Bestätigung dass die Ad Meta-konform ist"}`;

export default function AdGenerator({ onSaved }) {
  const [form, setForm] = useState({ format: "", zielgruppe: "", pillar: "", context: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [editingSections, setEditingSections] = useState({});
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hookVariants, setHookVariants] = useState([]);
  const [hookLoading, setHookLoading] = useState(false);

  const buildUserPrompt = (testimonials = []) => {
    let prompt = `Format: ${form.format}\nZielgruppen-Segment: ${form.zielgruppe}\nThemen-Pillar: ${form.pillar}`;
    if (form.context) prompt += `\nZusätzlicher Kontext: ${form.context}`;
    if (testimonials.length > 0) {
      prompt += `\n\nPassende Testimonials als Social Proof:\n`;
      testimonials.slice(0, 3).forEach(t => {
        prompt += `- ${t.client_name}: Problem: ${t.problem || "–"} → Ergebnis: ${t.ergebnis || "–"}`;
        if (t.zitat) prompt += ` Zitat: "${t.zitat}"`;
        prompt += "\n";
      });
    }
    return prompt;
  };

  const generate = async () => {
    if (!form.format || !form.zielgruppe || !form.pillar) return;
    setLoading(true);
    setResult(null);
    setHookVariants([]);
    try {
      let testimonials = [];
      try {
        testimonials = await base44.entities.Testimonial.filter({ is_active: true });
        testimonials = testimonials.filter(t => t.pillar === form.pillar || t.zielgruppe_typ);
      } catch (e) {}

      const response = await base44.functions.invoke("generateAdScript", {
        system_prompt: SYSTEM_PROMPT,
        user_prompt: buildUserPrompt(testimonials),
      });

      const raw = response.data?.text || "";
      const parsed = JSON.parse(raw);
      setResult({ ...parsed, format: form.format, pillar: form.pillar });
      setEditingSections({});
    } catch (e) {
      alert("Fehler beim Generieren: " + e.message);
    }
    setLoading(false);
  };

  const regenerate = () => generate();

  const varyHooks = async () => {
    if (!result) return;
    setHookLoading(true);
    try {
      const response = await base44.functions.invoke("generateAdScript", {
        system_prompt: "Du bist Ad-Texter für @fabian_aichem. Generiere 3 alternative Hooks für diese Instagram Ad. Antworte NUR mit JSON: {\"hooks\": [\"Hook 1\", \"Hook 2\", \"Hook 3\"]}",
        user_prompt: `Format: ${form.format}\nZielgruppe: ${form.zielgruppe}\nPillar: ${form.pillar}\nBestehender Hook: ${result.hook}\nGeneriere 3 starke Alternativen.`,
      });
      const raw = response.data?.text || "";
      const parsed = JSON.parse(raw);
      setHookVariants(parsed.hooks || []);
    } catch (e) {
      alert("Fehler: " + e.message);
    }
    setHookLoading(false);
  };

  const saveAd = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const sections = result.sections.map(s =>
        editingSections[s.label] !== undefined ? { ...s, text: editingSections[s.label] } : s
      );
      const fullText = editingSections.__full_text !== undefined ? editingSections.__full_text : result.full_text;
      await base44.entities.AdScript.create({
        title: `${form.pillar} – ${form.zielgruppe.slice(0, 40)}`,
        format: form.format,
        zielgruppe_segment: form.zielgruppe,
        themen_pillar: form.pillar,
        hook: result.hook,
        body_text: fullText,
        structured_json: JSON.stringify(sections),
        status: "Entwurf",
      });
      onSaved && onSaved();
      alert("Ad gespeichert ✓");
    } catch (e) {
      alert("Fehler beim Speichern: " + e.message);
    }
    setSaving(false);
  };

  const copyFull = () => {
    const text = editingSections.__full_text !== undefined ? editingSections.__full_text : result?.full_text;
    navigator.clipboard.writeText(text || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSectionText = (s) =>
    editingSections[s.label] !== undefined ? editingSections[s.label] : s.text;

  return (
    <div>
      {/* Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5 mb-6">
        <h2 className="text-base font-bold text-[#00416A] mb-5">Ad Generator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1.5">Format *</label>
            <select
              value={form.format}
              onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
            >
              <option value="">Format wählen...</option>
              {FORMATS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1.5">Themen-Pillar *</label>
            <select
              value={form.pillar}
              onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
            >
              <option value="">Pillar wählen...</option>
              {PILLARS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1.5">Zielgruppen-Segment *</label>
            <input
              value={form.zielgruppe}
              onChange={e => setForm(f => ({ ...f, zielgruppe: e.target.value }))}
              placeholder="z.B. Unternehmer mit chronischen Rückenschmerzen"
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1.5">Zusätzlicher Kontext (optional)</label>
            <textarea
              value={form.context}
              onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
              placeholder="Spezifische Insights, aktuelle Kampagne, besondere Botschaft..."
              rows={2}
              className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
            />
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !form.format || !form.zielgruppe || !form.pillar}
          className="flex items-center gap-2 px-6 py-3 bg-[#00416A] text-white rounded-xl text-sm font-bold hover:bg-[#003356] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" />
          {loading ? "Generiere..." : "Ad generieren"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mb-6">
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/5 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#00416A]/10 text-[#00416A]">{result.format}</span>
            {result.pillar && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PILLAR_COLORS[result.pillar] || "bg-gray-100 text-gray-600"}`}>{result.pillar}</span>
            )}
            <div className="ml-auto flex gap-2">
              <button onClick={regenerate} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black/50 hover:text-black/80 hover:bg-black/5 rounded-lg transition">
                <RotateCcw className="w-3.5 h-3.5" /> Neu
              </button>
              <button onClick={varyHooks} disabled={hookLoading} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black/50 hover:text-black/80 hover:bg-black/5 rounded-lg transition">
                <Sparkles className="w-3.5 h-3.5" /> {hookLoading ? "..." : "Hook variieren"}
              </button>
              <button onClick={saveAd} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00416A] text-white text-xs font-bold rounded-lg hover:bg-[#003356] transition disabled:opacity-50">
                <Save className="w-3.5 h-3.5" /> {saving ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>

          {/* Sections */}
          <div className="p-6 space-y-3">
            {result.sections.map(s => (
              <div key={s.label} className="rounded-xl bg-black/[0.03] p-4 group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">{s.label}</span>
                  <button
                    onClick={() => {
                      if (editingSections[s.label] !== undefined) {
                        const newEdits = { ...editingSections };
                        delete newEdits[s.label];
                        setEditingSections(newEdits);
                      } else {
                        setEditingSections(e => ({ ...e, [s.label]: getSectionText(s) }));
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-black/8 transition text-black/30"
                  >
                    {editingSections[s.label] !== undefined ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {editingSections[s.label] !== undefined ? (
                  <textarea
                    value={editingSections[s.label]}
                    onChange={e => setEditingSections(ed => ({ ...ed, [s.label]: e.target.value }))}
                    rows={3}
                    className="w-full text-sm text-black/80 bg-white rounded-lg border border-black/10 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
                  />
                ) : (
                  <p className="text-sm text-black/75 leading-relaxed whitespace-pre-wrap">{getSectionText(s)}</p>
                )}
              </div>
            ))}
          </div>

          {/* Meta check */}
          {result.meta_check && (
            <div className="mx-6 mb-4 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2">
              <span className="text-emerald-500 text-xs mt-0.5">✓</span>
              <p className="text-xs text-emerald-700">{result.meta_check}</p>
            </div>
          )}

          {/* Full text copy */}
          <div className="px-6 pb-6">
            <div className="rounded-xl bg-black/[0.03] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">Vollständiger Text</span>
                <button onClick={copyFull} className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-black/40 hover:text-black/70 hover:bg-black/8 rounded-lg transition">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Kopiert!" : "Kopieren"}
                </button>
              </div>
              <p className="text-xs text-black/60 leading-relaxed whitespace-pre-wrap">{result.full_text}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hook variants */}
      {hookVariants.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-6">
          <h3 className="text-xs font-bold text-black/40 uppercase tracking-widest mb-3">Alternative Hooks</h3>
          <div className="space-y-2">
            {hookVariants.map((h, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-black/[0.03] group">
                <span className="text-[10px] font-black text-black/20 mt-0.5 flex-shrink-0">0{i + 1}</span>
                <p className="text-sm text-black/75 flex-1">{h}</p>
                <button
                  onClick={() => {
                    setResult(r => ({ ...r, hook: h, sections: r.sections.map(s => s.label === "HOOK" ? { ...s, text: h } : s) }));
                    setHookVariants([]);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-[#00416A] px-2 py-1 rounded-lg hover:bg-[#00416A]/10 transition flex-shrink-0"
                >
                  Übernehmen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}