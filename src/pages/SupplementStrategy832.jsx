import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Printer, Edit2, Save, Plus, Trash2, ExternalLink, Sparkles, Loader2, ImageIcon } from "lucide-react";
import { createPageUrl } from "@/utils";

const C = { indigo: "#00416A", eggshell: "#F0EAD6", white: "#FFFFFF" };

const TIMING_KEYS = ["morgens", "mittags", "abends", "zur_nacht"];
const TIMING_LABELS = { morgens: "Morgens", mittags: "Mittags", abends: "Abends", zur_nacht: "Zur Nacht" };
const TIMING_COLORS = {
  morgens: { bg: "#FFF8E1", text: "#B45309" },
  mittags: { bg: "#E8F5E9", text: "#2E7D32" },
  abends: { bg: "#E3F2FD", text: "#1565C0" },
  zur_nacht: { bg: "#EDE7F6", text: "#4527A0" },
};

function EditableCell({ value, onChange, placeholder = "" }) {
  return (
    <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", border: "1px solid rgba(0,65,106,0.2)", borderRadius: "6px", padding: "4px 7px", fontSize: "11px", fontFamily: "inherit", background: "rgba(0,65,106,0.03)", outline: "none" }} />
  );
}

// ───────── TAGESPLAN ─────────
function DailySchedule({ supplements }) {
  const SLOTS = [
    { key: "morgens", label: "☀️ Morgens", ...TIMING_COLORS.morgens },
    { key: "mittags", label: "🌤 Mittags", ...TIMING_COLORS.mittags },
    { key: "abends", label: "🌆 Abends", ...TIMING_COLORS.abends },
    { key: "zur_nacht", label: "🌙 Zur Nacht", ...TIMING_COLORS.zur_nacht },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
      {SLOTS.map(slot => {
        const items = supplements.filter(s => s[slot.key]);
        return (
          <div key={slot.key} style={{ background: slot.bg, borderRadius: "12px", padding: "12px 14px", minHeight: "90px" }}>
            <p style={{ fontSize: "10px", fontWeight: 800, color: slot.text, margin: "0 0 8px", letterSpacing: "0.05em" }}>{slot.label}</p>
            {items.length === 0 ? (
              <p style={{ fontSize: "10px", color: slot.text, opacity: 0.35, fontStyle: "italic", margin: 0 }}>–</p>
            ) : items.map((s, i) => (
              <div key={i} style={{ marginBottom: "6px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: slot.text, margin: 0 }}>{s.naehrstoff}</p>
                <p style={{ fontSize: "10px", color: slot.text, opacity: 0.7, margin: 0 }}>{s[slot.key]}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ───────── DETAIL-TABELLE ─────────
function ProductCell({ row, i, onUpdate }) {
  const [fetching, setFetching] = React.useState(false);
  const [error, setError] = React.useState("");

  const fetchImage = async () => {
    if (!row.kauflink) return;
    setFetching(true);
    setError("");
    const res = await base44.functions.invoke("fetchProductImage", { url: row.kauflink });
    if (res.data?.image_url) {
      onUpdate(i, "produkt_foto", res.data.image_url);
    } else {
      setError("Kein Bild gefunden");
    }
    setFetching(false);
  };

  return (
    <div style={{ display: "grid", gap: "3px" }}>
      <EditableCell value={row.produkt} onChange={v => onUpdate(i, "produkt", v)} placeholder="Marke / Name" />
      <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
        <input value={row.kauflink || ""} onChange={e => onUpdate(i, "kauflink", e.target.value)} placeholder="Kauflink (https://…)"
          style={{ flex: 1, border: "1px solid rgba(0,65,106,0.2)", borderRadius: "6px", padding: "4px 7px", fontSize: "11px", fontFamily: "inherit", background: "rgba(0,65,106,0.03)", outline: "none" }} />
        <button onClick={fetchImage} disabled={fetching || !row.kauflink} title="Produktbild automatisch laden"
          style={{ padding: "4px 8px", background: fetching ? "#eee" : "rgba(0,65,106,0.1)", border: "none", borderRadius: "6px", cursor: row.kauflink ? "pointer" : "not-allowed", color: C.indigo, display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap" }}>
          {fetching ? <Loader2 size={11} style={{ animation: "spin 0.8s linear infinite" }} /> : <ImageIcon size={11} />}
          {fetching ? "…" : "Bild"}
        </button>
      </div>
      {row.produkt_foto && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <img src={row.produkt_foto} alt="" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "4px", border: "1px solid #eee" }} />
          <input value={row.produkt_foto} onChange={e => onUpdate(i, "produkt_foto", e.target.value)} placeholder="Foto-URL"
            style={{ flex: 1, border: "1px solid rgba(0,65,106,0.15)", borderRadius: "6px", padding: "3px 6px", fontSize: "10px", fontFamily: "inherit", background: "rgba(0,65,106,0.02)", outline: "none" }} />
        </div>
      )}
      {error && <span style={{ fontSize: "10px", color: "#e55" }}>{error}</span>}
    </div>
  );
}

function DetailTable({ supplements, edit, onUpdate, onRemove }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
      <thead>
        <tr style={{ background: "rgba(0,65,106,0.05)" }}>
          {["Supplement", "Tagesdosis", "Produkt", "Kauflink", "Hinweis", ...(edit ? [""] : [])].map(h => (
            <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontWeight: 800, color: C.indigo, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: "2px solid rgba(0,65,106,0.1)" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {supplements.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid rgba(0,65,106,0.06)" }}>
            <td style={{ padding: "8px 10px", fontWeight: 700, color: "#111" }}>
              {edit ? <EditableCell value={row.naehrstoff} onChange={v => onUpdate(i, "naehrstoff", v)} placeholder="Nährstoff" /> : row.naehrstoff}
            </td>
            <td style={{ padding: "8px 10px", fontWeight: 700, color: C.indigo }}>
              {edit ? <EditableCell value={row.dosis_tag} onChange={v => onUpdate(i, "dosis_tag", v)} placeholder="z.B. 5g" /> : row.dosis_tag || "–"}
            </td>
            <td style={{ padding: "8px 10px", minWidth: "160px" }}>
              {edit ? (
                <ProductCell row={row} i={i} onUpdate={onUpdate} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  {row.produkt_foto && row.kauflink && (
                    <a href={row.kauflink} target="_blank" rel="noopener noreferrer" style={{ display: "block" }}>
                      <img src={row.produkt_foto} alt={row.produkt || row.naehrstoff}
                        style={{ width: "52px", height: "52px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(0,65,106,0.1)", background: "#fafafa" }} />
                    </a>
                  )}
                  {row.produkt_foto && !row.kauflink && (
                    <img src={row.produkt_foto} alt={row.produkt || row.naehrstoff}
                      style={{ width: "52px", height: "52px", objectFit: "contain", borderRadius: "8px", border: "1px solid rgba(0,65,106,0.1)", background: "#fafafa" }} />
                  )}
                  {row.produkt && <span style={{ fontSize: "10px", color: "#666", textAlign: "center" }}>{row.produkt}</span>}
                </div>
              )}
            </td>
            <td style={{ padding: "8px 10px" }}>
              {edit ? <EditableCell value={row.kauflink} onChange={v => onUpdate(i, "kauflink", v)} placeholder="https://…" /> :
                row.kauflink ? (
                  <a href={row.kauflink} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: C.indigo, color: C.white, fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "8px", textDecoration: "none" }}>
                    <ExternalLink size={10} /> Bestellen
                  </a>
                ) : <span style={{ color: "#ccc" }}>–</span>}
            </td>
            <td style={{ padding: "8px 10px", color: "#888", fontSize: "10px", fontStyle: "italic" }}>
              {edit ? <EditableCell value={row.notiz} onChange={v => onUpdate(i, "notiz", v)} placeholder="Notiz…" /> : row.notiz || ""}
            </td>
            {edit && (
              <td style={{ padding: "8px 10px" }}>
                <div style={{ display: "grid", gap: "4px" }}>
                  {TIMING_KEYS.map(k => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "9px", color: "#888", width: "55px" }}>{TIMING_LABELS[k]}:</span>
                      <input value={row[k] || ""} onChange={e => onUpdate(i, k, e.target.value)} placeholder="–"
                        style={{ width: "100px", border: "1px solid rgba(0,65,106,0.15)", borderRadius: "5px", padding: "2px 5px", fontSize: "9px" }} />
                    </div>
                  ))}
                  <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e55", marginTop: "2px", textAlign: "left" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ───────── SEITE 2: Erklärungen ─────────
function ExplanationsPage({ supplements, explanations, edit, onUpdate }) {
  return (
    <div style={{
      background: C.white, width: "210mm", minHeight: "297mm",
      margin: "0 auto 32px", padding: "18mm 16mm", boxShadow: "0 4px 40px rgba(0,65,106,0.08)",
      position: "relative", pageBreakBefore: "always"
    }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.indigo, opacity: 0.45, margin: "0 0 4px" }}>Supplementplan · Seite 2</p>
        <h2 style={{ fontSize: "20px", fontWeight: 900, color: C.indigo, margin: "0 0 4px" }}>Warum diese Supplemente?</h2>
        <p style={{ fontSize: "11px", color: "#888", margin: 0 }}>Hier findest du eine kurze Erklärung zu jedem Supplement – was es ist, warum du es nimmst und was es in deinem Körper bewirkt.</p>
      </div>
      <hr style={{ border: "none", borderTop: "1px solid rgba(0,65,106,0.08)", margin: "0 0 20px" }} />

      <div style={{ display: "grid", gap: "16px" }}>
        {supplements.map((s, i) => {
          const expl = explanations[s.naehrstoff] || {};
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid rgba(0,65,106,0.06)" }}>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 800, color: C.indigo, margin: "0 0 2px" }}>{s.naehrstoff}</p>
                {s.produkt && <p style={{ fontSize: "10px", color: "#aaa", margin: 0 }}>{s.produkt}</p>}
                <p style={{ fontSize: "11px", fontWeight: 700, color: C.indigo, margin: "4px 0 0", opacity: 0.7 }}>{s.dosis_tag}</p>
              </div>
              <div>
                {edit ? (
                  <div style={{ display: "grid", gap: "6px" }}>
                    <textarea value={expl.warum || ""} onChange={e => onUpdate(s.naehrstoff, "warum", e.target.value)}
                      placeholder="Warum dieses Supplement?" rows={2}
                      style={{ width: "100%", border: "1px solid rgba(0,65,106,0.15)", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", fontFamily: "inherit", resize: "none" }} />
                    <textarea value={expl.wirkung || ""} onChange={e => onUpdate(s.naehrstoff, "wirkung", e.target.value)}
                      placeholder="Was bewirkt es?" rows={2}
                      style={{ width: "100%", border: "1px solid rgba(0,65,106,0.15)", borderRadius: "6px", padding: "5px 8px", fontSize: "11px", fontFamily: "inherit", resize: "none" }} />
                  </div>
                ) : (
                  <>
                    {expl.warum && (
                      <div style={{ marginBottom: "6px" }}>
                        <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.indigo, opacity: 0.4 }}>Warum</span>
                        <p style={{ fontSize: "11px", color: "#444", lineHeight: 1.5, margin: "2px 0 0" }}>{expl.warum}</p>
                      </div>
                    )}
                    {expl.wirkung && (
                      <div>
                        <span style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.indigo, opacity: 0.4 }}>Wirkung</span>
                        <p style={{ fontSize: "11px", color: "#444", lineHeight: 1.5, margin: "2px 0 0" }}>{expl.wirkung}</p>
                      </div>
                    )}
                    {!expl.warum && !expl.wirkung && (
                      <p style={{ fontSize: "11px", color: "#ccc", fontStyle: "italic" }}>Noch keine Erklärung – klicke auf „Bearbeiten" oder generiere per KI.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ position: "absolute", bottom: "14mm", left: "16mm", right: "16mm", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(0,65,106,0.08)", paddingTop: "8px" }}>
        <span style={{ fontSize: "8px", color: C.indigo, opacity: 0.3, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Supplement-Erklärungen</span>
        <span style={{ fontSize: "8px", color: C.indigo, opacity: 0.3, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Leistungsarchitektur</span>
      </div>
    </div>
  );
}

// ───────── HAUPT-KOMPONENTE ─────────
export default function SupplementStrategy832() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    base44.entities.SupplementPlan.filter({ id }).then(res => {
      const d = res[0];
      if (d) {
        const supplements = d.supplements_json ? JSON.parse(d.supplements_json) : [];
        const expls = d.explanations_json ? JSON.parse(d.explanations_json) : {};
        setData(d);
        setDraft({ ...d, supplements });
        setExplanations(expls);
      }
      setLoading(false);
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    await base44.entities.SupplementPlan.update(data.id, {
      client_name: draft.client_name,
      version: draft.version,
      intro_text: draft.intro_text,
      supplements_json: JSON.stringify(draft.supplements),
      explanations_json: JSON.stringify(explanations),
    });
    setSaving(false);
    setEdit(false);
  };

  const generateExplanations = async () => {
    setGenerating(true);
    const names = draft.supplements.map(s => s.naehrstoff).filter(Boolean).join(", ");
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Du bist Ernährungs- und Supplement-Experte. Erkläre folgende Supplemente kurz und verständlich für einen Fitness-Kunden auf Deutsch. Für jedes Supplement liefere: "warum" (warum soll man es einnehmen, 1-2 Sätze) und "wirkung" (was bewirkt es im Körper, 1-2 Sätze). Sei klar, motivierend und nicht zu technisch.
Supplemente: ${names}`,
      response_json_schema: {
        type: "object",
        properties: {
          supplements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                warum: { type: "string" },
                wirkung: { type: "string" }
              }
            }
          }
        }
      }
    });
    const newExpls = { ...explanations };
    (result.supplements || []).forEach(s => {
      newExpls[s.name] = { warum: s.warum, wirkung: s.wirkung };
    });
    setExplanations(newExpls);
    setGenerating(false);
  };

  const updSupp = (idx, field, val) => {
    setDraft(d => {
      const s = [...d.supplements];
      s[idx] = { ...s[idx], [field]: val };
      return { ...d, supplements: s };
    });
  };

  const addRow = () => {
    setDraft(d => ({
      ...d,
      supplements: [...d.supplements, {
        gruppe: "", naehrstoff: "", dosis: "", produkt: "",
        morgens: "", mittags: "", abends: "", zur_nacht: "", dosis_tag: "", kauflink: "", notiz: ""
      }]
    }));
  };

  const updExpl = (name, field, val) => {
    setExplanations(e => ({ ...e, [name]: { ...(e[name] || {}), [field]: val } }));
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.eggshell, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.indigo}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!draft) return (
    <div style={{ minHeight: "100vh", background: C.eggshell, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: C.indigo, opacity: 0.5 }}>Kein Supplementplan gefunden.</p>
    </div>
  );

  const s_label = { fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.indigo, opacity: 0.45, margin: "0 0 6px" };

  return (
    <div style={{ minHeight: "100vh", background: C.eggshell, padding: "40px 16px 60px" }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 0; size: A4; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <a href={createPageUrl("SupplementAdmin832")} style={{ display: "flex", alignItems: "center", gap: "6px", color: C.indigo, opacity: 0.6, textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
          <ArrowLeft size={16} /> Zurück
        </a>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {edit ? (
            <>
              <button onClick={generateExplanations} disabled={generating}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(139,92,246,0.1)", color: "#7C3AED", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: generating ? 0.7 : 1 }}>
                {generating ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Sparkles size={14} />}
                {generating ? "Generiere…" : "KI-Erklärungen"}
              </button>
              <button onClick={addRow}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(0,65,106,0.08)", color: C.indigo, border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                <Plus size={15} /> Zeile
              </button>
              <button onClick={save} disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: C.indigo, color: C.white, border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                <Save size={15} /> {saving ? "Speichern…" : "Speichern"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEdit(true)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(0,65,106,0.1)", color: C.indigo, border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                <Edit2 size={15} /> Bearbeiten
              </button>
              <button onClick={() => window.print()}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: C.indigo, color: C.white, border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                <Printer size={15} /> Drucken
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═══ SEITE 1 ═══ */}
      <div style={{ background: C.white, width: "210mm", minHeight: "297mm", margin: "0 auto 32px", padding: "18mm 16mm 22mm", boxShadow: "0 4px 40px rgba(0,65,106,0.08)", position: "relative" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <p style={s_label}>Supplementplan</p>
            {edit ? (
              <input value={draft.client_name || ""} onChange={e => setDraft(d => ({ ...d, client_name: e.target.value }))}
                style={{ fontSize: "22px", fontWeight: 900, color: C.indigo, border: "none", borderBottom: `2px solid ${C.indigo}`, outline: "none", background: "transparent", width: "260px" }} />
            ) : (
              <h1 style={{ fontSize: "22px", fontWeight: 900, color: C.indigo, margin: 0 }}>{draft.client_name}</h1>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ display: "inline-block", background: "rgba(0,65,106,0.08)", color: C.indigo, fontSize: "9px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.1em" }}>
              Supplemente · v{draft.version}
            </span>
          </div>
        </div>

        {/* Einleitung */}
        {(draft.intro_text || edit) && (
          <div style={{ background: "rgba(0,65,106,0.04)", borderLeft: `3px solid ${C.indigo}`, borderRadius: "0 8px 8px 0", padding: "10px 14px", marginBottom: "20px" }}>
            <p style={{ ...s_label, marginBottom: "4px" }}>Hinweis</p>
            {edit ? (
              <textarea value={draft.intro_text || ""} onChange={e => setDraft(d => ({ ...d, intro_text: e.target.value }))}
                rows={3} placeholder="Einleitungstext…"
                style={{ width: "100%", border: "1px solid rgba(0,65,106,0.15)", borderRadius: "6px", padding: "6px 8px", fontSize: "11px", fontFamily: "inherit", resize: "none", background: "white" }} />
            ) : (
              <p style={{ fontSize: "11px", color: "#444", lineHeight: 1.6, margin: 0 }}>{draft.intro_text}</p>
            )}
          </div>
        )}

        <hr style={{ border: "none", borderTop: "1px solid rgba(0,65,106,0.08)", margin: "0 0 16px" }} />

        {/* TAGESPLAN */}
        <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.indigo, opacity: 0.45, margin: "0 0 8px" }}>Dein Tagesplan</p>
        <DailySchedule supplements={draft.supplements} />

        <hr style={{ border: "none", borderTop: "1px solid rgba(0,65,106,0.08)", margin: "0 0 16px" }} />

        {/* DETAIL-TABELLE */}
        <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.indigo, opacity: 0.45, margin: "0 0 10px" }}>Alle Supplemente im Detail</p>
        <DetailTable
          supplements={draft.supplements}
          edit={edit}
          onUpdate={(idx, field, val) => updSupp(idx, field, val)}
          onRemove={idx => setDraft(d => ({ ...d, supplements: d.supplements.filter((_, i) => i !== idx) }))}
        />

        {edit && (
          <button onClick={addRow} className="no-print"
            style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(0,65,106,0.05)", color: C.indigo, border: "1px dashed rgba(0,65,106,0.2)", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> Supplement hinzufügen
          </button>
        )}

        {/* Footer */}
        <div style={{ position: "absolute", bottom: "14mm", left: "16mm", right: "16mm", display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(0,65,106,0.08)", paddingTop: "8px" }}>
          <span style={{ fontSize: "8px", color: C.indigo, opacity: 0.3, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Supplementplan · {draft.client_name}</span>
          <span style={{ fontSize: "8px", color: C.indigo, opacity: 0.3, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Seite 1 · Leistungsarchitektur</span>
        </div>
      </div>

      {/* ═══ SEITE 2: Erklärungen ═══ */}
      <ExplanationsPage
        supplements={draft.supplements}
        explanations={explanations}
        edit={edit}
        onUpdate={updExpl}
      />
    </div>
  );
}