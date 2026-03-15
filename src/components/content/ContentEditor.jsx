import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, Download, Trash2, Plus, Sparkles, Loader2, Wand2 } from "lucide-react";
import { TypeBadge, CategoryBadge, StatusBadge } from "./ContentBadge";
import SlideshowEditor from "./SlideshowEditor";
import jsPDF from "jspdf";

const VIDEO_DURATIONS = ["15 Sek", "30 Sek", "45 Sek", "60 Sek", "90 Sek"];
const TYPES = ["Reden", "B-Roll", "Slideshow", "Reel", "Story", "Carousel"];
const CATEGORIES = ["Training", "Ernährung", "Supplements", "Steuerung"];
const STATUSES = ["Idee", "In Planung", "Gedreht", "Geschnitten", "Veröffentlicht"];

export default function ContentEditor({ piece, onClose, onSaved }) {
  const [form, setForm] = useState(piece || {
    title: "", type: "Reden", category: "Training", status: "Idee",
    planned_date: "", hook: "", script: "", notes: "", hashtags: "", cta: "", images: [],
    video_duration: "60 Sek"
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingHooks, setGeneratingHooks] = useState(false);
  const [generatingSlides, setGeneratingSlides] = useState(false);
  const [hookSuggestions, setHookSuggestions] = useState([]);

  // Selection-based refinement state
  const [selection, setSelection] = useState(null); // { text, start, end }
  const [refinePopup, setRefinePopup] = useState(null); // { x, y }
  const [refinePrompt, setRefinePrompt] = useState("");
  const [refining, setRefining] = useState(false);
  const scriptRef = useRef(null);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  // Fetch last 10 scripts for style context
  const getRecentScripts = async () => {
    const allPieces = await base44.entities.ContentPiece.list("-created_date", 20);
    return allPieces
      .filter(p => p.script && p.script.trim().length > 50 && p.id !== form.id)
      .slice(0, 10)
      .map(p => p.script);
  };

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
    if (form.planned_date) { doc.text(`Datum: ${form.planned_date}`, margin, y); y += 8; }
    y += 4;
    doc.setDrawColor(200);
    doc.line(margin, y, 190, y);
    y += 8;

    if (form.hook) {
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(0);
      doc.text("HOOK", margin, y); y += 7;
      doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      const hookLines = doc.splitTextToSize(form.hook, 170);
      doc.text(hookLines, margin, y); y += hookLines.length * 6 + 8;
    }

    if (form.script) {
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(0);
      doc.text("SKRIPT", margin, y); y += 7;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      const lines = doc.splitTextToSize(form.script, 170);
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = margin; }
        doc.text(line, margin, y); y += 6;
      });
      y += 6;
    }

    if (form.cta) {
      doc.setFontSize(12); doc.setFont("helvetica", "bold");
      doc.text("CALL-TO-ACTION", margin, y); y += 7;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      doc.text(doc.splitTextToSize(form.cta, 170), margin, y); y += 10;
    }

    if (form.hashtags) {
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text(form.hashtags, margin, y);
    }

    doc.save(`${(form.title || "content").replace(/\s+/g, "_")}.pdf`);
  };

  const generateHookSuggestions = async () => {
    setGeneratingHooks(true);
    setHookSuggestions([]);
    const prompt = `Du bist ein Experte für Instagram-Kurzvideos. Generiere 3 alternative Hook-Formulierungen für folgendes Thema.

AKTUELLER HOOK: "${form.hook || "(noch kein Hook)"}"
THEMA / INFOS: "${form.topic_info || "(keine weiteren Infos)"}"
CONTENT-ART: ${form.type}
KATEGORIE: ${form.category}

HOOK-LEITFADEN (strikt einhalten):
- Starte NIEMALS mit "Ich"
- Erzeuge sofort Widerspruch, Reibung oder Neugier
- Sprich den Zuschauer direkt an ("du") oder stelle eine provokante Behauptung auf
- Max. 1-2 kurze Sätze
- Jeder Hook soll einen anderen Ansatz nutzen: z.B. Provokation, Frage, Fehler aufdecken, überraschendes Fact

Antworte mit genau 3 Hooks, einer pro Zeile, ohne Nummerierung oder Erklärung.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
    const lines = result.split("\n").map(l => l.trim()).filter(l => l.length > 5).slice(0, 3);
    setHookSuggestions(lines);
    setGeneratingHooks(false);
  };

  const generateScript = async () => {
    if (!form.hook && !form.topic_info) return;
    setGeneratingScript(true);

    const durationSeconds = parseInt((form.video_duration || "60 Sek").replace(" Sek", ""));
    const targetWords = Math.round((durationSeconds / 60) * 130);
    const recentScripts = await getRecentScripts();

    const styleContext = recentScripts.length > 0
      ? `\n\nSTIL-REFERENZ (letzte ${recentScripts.length} Skripte – übernimm den Sprachstil, Tonalität und Rhythmus):\n${recentScripts.map((s, i) => `--- Skript ${i + 1} ---\n${s}`).join("\n\n")}`
      : "";

    const prompt = `Du bist ein Experte für Instagram-Kurzvideos und schreibst Skripte nach einem präzisen Framework.

HOOK (bereits festgelegt): "${form.hook || "(kein Hook angegeben)"}"
THEMA / WEITERE INFOS: "${form.topic_info || "(keine weiteren Infos)"}"
CONTENT-ART: ${form.type}
KATEGORIE: ${form.category}
VIDEOLÄNGE: ${form.video_duration} (ca. ${targetWords} Wörter)

FRAMEWORK das du STRIKT befolgen musst:

1. STRUKTUR (Aber/Deshalb-Methode):
   - Hook (0-3 Sek): Nutze den vorgegebenen Hook exakt. Starte NICHT mit "Ich".
   - Aber (3-10 Sek): Konflikt/Fehler sichtbar machen
   - Deshalb (10-20 Sek): Konsequenz/Lösung liefern
   - Neues Aber (20-35 Sek): Einwand vorwegnehmen
   - Finales Deshalb (35-50 Sek): Auflösung, Rahmen schließen
   - CTA (letzte 5-10 Sek): Konkrete Handlungsaufforderung

2. RHETORIK: Kontraste, direkte "du"-Ansprache, rhetorische Fragen, Einwände antizipieren, bildhafte Vergleiche, Triaden, wechselnder Satzrhythmus.

3. TONALITÄT: Klar, ruhig, authentisch, sicher. Keine Übertreibungen.

4. LÄNGE: Exakt ~${targetWords} Wörter.${styleContext}

Schreibe NUR das fertige Skript. Kein Kommentar drumherum. Zeilenumbrüche für Sprechpausen.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
    set("script", result);
    setGeneratingScript(false);
  };

  // Handle text selection in the script textarea
  const handleScriptMouseUp = () => {
    const textarea = scriptRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.substring(start, end).trim();

    if (text.length > 3) {
      const rect = textarea.getBoundingClientRect();
      // Position popup near the selection
      setSelection({ text, start, end });
      setRefinePopup({ x: rect.left + rect.width / 2, y: rect.top + 10 });
      setRefinePrompt("");
    } else {
      setSelection(null);
      setRefinePopup(null);
    }
  };

  const handleRefine = async () => {
    if (!selection || !refinePrompt.trim()) return;
    setRefining(true);

    const recentScripts = await getRecentScripts();
    const styleContext = recentScripts.length > 0
      ? `\n\nSTIL-REFERENZ (letzte ${recentScripts.length} Skripte – halte diesen Sprachstil bei):\n${recentScripts.map((s, i) => `--- Skript ${i + 1} ---\n${s}`).join("\n\n")}`
      : "";

    const prompt = `Du überarbeitest eine markierte Textpassage aus einem Instagram-Kurzvideos-Skript.

VOLLSTÄNDIGES SKRIPT (Kontext):
${form.script}

MARKIERTE PASSAGE die überarbeitet werden soll:
"${selection.text}"

ANWEISUNG DES NUTZERS: ${refinePrompt}

WICHTIG: Gib NUR den überarbeiteten Text für die markierte Passage zurück. Kein Kommentar, keine Erklärung. Gleiche Länge wie das Original anstreben.${styleContext}`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });

    // Replace the selected passage in the script
    const newScript = form.script.substring(0, selection.start) + result.trim() + form.script.substring(selection.end);
    set("script", newScript);

    setRefining(false);
    setSelection(null);
    setRefinePopup(null);
    setRefinePrompt("");
  };

  const generateSlides = async () => {
    if (!form.hook && !form.topic_info) return;
    setGeneratingSlides(true);

    const prompt = `Du bist ein Experte für virale Instagram-Karussell-Slideshows. Erstelle eine textbasierte Slideshow nach folgendem Framework.

HOOK (Slide 1): "${form.hook || "(kein Hook)"}"
THEMA / WEITERE INFOS: "${form.topic_info || "(keine weiteren Infos)"}"
KATEGORIE: ${form.category}

FRAMEWORK für eine virale Slideshow (strikt einhalten):

Slide 1 – HOOK: Nutze den Hook exakt so wie angegeben. Wenn er eine Aussage wie "Morgen geht's los!" enthält, schreibe sie mit ~~Durchstreichung~~ (z.B. "~~Morgen geht's los!~~") und füge darunter eine kurze provokante Gegenfrage oder Aussage hinzu. Max 2 Zeilen.

Slide 2 – PROBLEM ENTLARVEN: Benenne das Kernproblem direkt und emotional. 2-3 kurze Sätze.

Slide 3 – DIE KOSTEN: 3-4 konkrete negative Folgen als Aufzählung. Jede Zeile mit einem ❌ davor.

Slide 4 – PSYCHOLOGIE / WARUM: Schafft Empathie und Verständnis. 2-3 Sätze. Kein Vorwurf.

Slide 5 – DIE LÖSUNG: Konkrete, einfache Handlung. Ein Schlüsselwort in GROSSBUCHSTABEN. Max 3 Sätze.

Slide 6 – MINDSET / MOMENTUM: Eine kraftvolle Aussage oder Zitat-Stil. 1-2 Sätze.

Slide 7 – TRANSFORMATION: Das Wunschbild malen. 3-4 Stichworte oder kurze Sätze, die das positive Ergebnis beschreiben.

Slide 8 – CTA: Direkte Frage ans Publikum für Kommentare ODER Aufforderung zu speichern/teilen. Kurz und klar. + Hinweis auf "Link in Bio" falls passend.

WICHTIG:
- Jeder Slide-Text kommt auf eine eigene Zeile, getrennt durch "---SLIDE---"
- Kein Kommentar, keine Nummerierung, nur der reine Slide-Text
- Kurz und lesbar: max 40 Wörter pro Slide
- Direkte "du"-Ansprache
- Starte NIEMALS einen Slide mit "Ich"`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt, model: "claude_sonnet_4_6" });
    const slides = result.split("---SLIDE---").map(s => s.trim()).filter(s => s.length > 2);
    set("slideshow_slides", slides);
    setGeneratingSlides(false);
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

          {/* Hook + Topic Info + Duration */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label-xs">🎣 Hook</label>
              <button type="button" onClick={generateHookSuggestions} disabled={generatingHooks}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition disabled:opacity-60">
                {generatingHooks ? <><Loader2 className="w-3 h-3 animate-spin" /> ...</> : <><Sparkles className="w-3 h-3" /> 3 Ideen</>}
              </button>
            </div>
            <textarea value={form.hook || ""} onChange={e => set("hook", e.target.value)}
              rows={2} placeholder="Der erste Satz, der die Zuschauer fesselt..."
              className="input-field resize-none" />
            {hookSuggestions.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {hookSuggestions.map((h, i) => (
                  <button key={i} type="button" onClick={() => { set("hook", h); setHookSuggestions([]); }}
                    className="w-full text-left px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 hover:bg-amber-100 transition">
                    <span className="text-amber-400 font-bold mr-2">{i + 1}.</span>{h}
                  </button>
                ))}
                <button onClick={() => setHookSuggestions([])} className="text-xs text-black/30 hover:text-black/50">Schließen</button>
              </div>
            )}
          </div>
          <div>
            <label className="label-xs">💡 Weitere Infos zum Thema</label>
            <textarea value={form.topic_info || ""} onChange={e => set("topic_info", e.target.value)}
              rows={3} placeholder="Fakten, Argumente, Kernbotschaft, was du vermitteln willst..."
              className="input-field resize-none" />
          </div>
          <div>
            <label className="label-xs">⏱ Videolänge</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {VIDEO_DURATIONS.map(d => (
                <button key={d} type="button" onClick={() => set("video_duration", d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${form.video_duration === d ? "bg-[#00416A] text-white border-[#00416A]" : "bg-white text-black/50 border-black/10 hover:border-[#00416A]/40"}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Skript oder Slideshow */}
          {isSlideshow ? (
            <SlideshowEditor
              form={form}
              set={set}
              generatingSlides={generatingSlides}
              onGenerate={generateSlides}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label-xs">
                  📝 Skript
                  {form.script && <span className="ml-2 text-black/30 normal-case font-normal">· Text markieren zum Überarbeiten</span>}
                </label>
                {(form.hook || form.topic_info) && (
                  <button type="button" onClick={generateScript} disabled={generatingScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition disabled:opacity-60">
                    {generatingScript ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generiert...</> : <><Sparkles className="w-3.5 h-3.5" /> Mit Claude schreiben</>}
                  </button>
                )}
              </div>

              {/* Refine popup */}
              {refinePopup && selection && (
                <div className="mb-2 bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="text-xs text-purple-700 font-semibold mb-1.5">
                    ✏️ Markiert: <span className="font-normal italic">„{selection.text.length > 60 ? selection.text.substring(0, 60) + "…" : selection.text}"</span>
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={refinePrompt}
                      onChange={e => setRefinePrompt(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleRefine()}
                      placeholder="Was soll Claude ändern? z.B. 'mehr Spannung', 'kürzer', 'direkter'"
                      autoFocus
                      className="flex-1 border border-purple-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                    <button onClick={handleRefine} disabled={refining || !refinePrompt.trim()}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition disabled:opacity-50">
                      {refining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => { setSelection(null); setRefinePopup(null); }}
                      className="px-2 py-1.5 text-purple-400 hover:text-purple-600 text-xs">✕</button>
                  </div>
                </div>
              )}

              <textarea
                ref={scriptRef}
                value={form.script || ""}
                onChange={e => set("script", e.target.value)}
                onMouseUp={handleScriptMouseUp}
                onKeyUp={handleScriptMouseUp}
                rows={10}
                placeholder="Skript hier eingeben oder oben mit Claude generieren lassen..."
                className="input-field resize-none font-mono text-sm"
              />
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