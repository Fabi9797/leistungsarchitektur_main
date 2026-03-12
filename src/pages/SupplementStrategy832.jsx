import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Printer, Edit2, Save, Plus, Trash2, ExternalLink } from "lucide-react";
import { createPageUrl } from "@/utils";

const C = { indigo: "#00416A", eggshell: "#F0EAD6", white: "#FFFFFF" };

const TIMING_LABELS = ["Morgens", "Mittags", "Abends", "Zur Nacht"];

const DEFAULT_SUPPLEMENTS = [
  {
    gruppe: "Medizin",
    kategorie: "Körpereigene Hormone",
    naehrstoff: "Vitamin-D3 (K2)",
    dosis: "1000 IE",
    produkt: "",
    morgens: "4000 IE", mittags: "", abends: "", zur_nacht: "",
    dosis_tag: "4000 IE",
    kauflink: "",
    notiz: ""
  },
  {
    gruppe: "Nährstoffe",
    kategorie: "",
    naehrstoff: "Magnesium-Bisglycinat",
    dosis: "300mg",
    produkt: "Sunday Natural",
    morgens: "", mittags: "", abends: "", zur_nacht: "ca. 1 Stunde vor schlafen",
    dosis_tag: "300mg",
    kauflink: "",
    notiz: ""
  },
  {
    gruppe: "Nährstoffe",
    kategorie: "",
    naehrstoff: "Omega 3",
    dosis: "",
    produkt: "Norsan",
    morgens: "", mittags: "", abends: "", zur_nacht: "",
    dosis_tag: "4 Kapseln oder 6ml Öl",
    kauflink: "",
    notiz: "Öl günstiger und besser"
  },
  {
    gruppe: "Nährstoffe",
    kategorie: "",
    naehrstoff: "Kreatin",
    dosis: "",
    produkt: "",
    morgens: "", mittags: "", abends: "", zur_nacht: "",
    dosis_tag: "5g (ab Freigabe)",
    kauflink: "",
    notiz: ""
  },
  {
    gruppe: "Nährstoffe",
    kategorie: "",
    naehrstoff: "Protein",
    dosis: "",
    produkt: "",
    morgens: "", mittags: "", abends: "", zur_nacht: "",
    dosis_tag: "30g",
    kauflink: "",
    notiz: ""
  }
];

function EditableCell({ value, onChange, placeholder = "", multiline = false }) {
  if (multiline) {
    return (
      <textarea
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        style={{ width: "100%", border: "1px solid rgba(0,65,106,0.15)", borderRadius: "6px", padding: "4px 6px", fontSize: "11px", fontFamily: "inherit", resize: "none", background: "rgba(0,65,106,0.03)", outline: "none" }}
      />
    );
  }
  return (
    <input
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", border: "1px solid rgba(0,65,106,0.15)", borderRadius: "6px", padding: "4px 6px", fontSize: "11px", fontFamily: "inherit", background: "rgba(0,65,106,0.03)", outline: "none" }}
    />
  );
}

export default function SupplementStrategy832() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const [data, setData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    base44.entities.SupplementPlan.filter({ id }).then(res => {
      const d = res[0];
      if (d) {
        const parsed = {
          ...d,
          supplements: d.supplements_json ? JSON.parse(d.supplements_json) : DEFAULT_SUPPLEMENTS,
        };
        setData(d);
        setDraft(parsed);
      }
      setLoading(false);
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    const payload = {
      client_name: draft.client_name,
      version: draft.version,
      intro_text: draft.intro_text,
      supplements_json: JSON.stringify(draft.supplements),
    };
    if (data?.id) {
      await base44.entities.SupplementPlan.update(data.id, payload);
    }
    setSaving(false);
    setEdit(false);
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
        gruppe: "", kategorie: "", naehrstoff: "", dosis: "", produkt: "",
        morgens: "", mittags: "", abends: "", zur_nacht: "", dosis_tag: "", kauflink: "", notiz: ""
      }]
    }));
  };

  const removeRow = (idx) => {
    setDraft(d => ({ ...d, supplements: d.supplements.filter((_, i) => i !== idx) }));
  };

  // Group supplements by "gruppe"
  const grouped = {};
  (draft?.supplements || []).forEach((s, idx) => {
    const g = s.gruppe || "Sonstige";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push({ ...s, _idx: idx });
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.eggshell, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.indigo}`, borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!draft) {
    return (
      <div style={{ minHeight: "100vh", background: C.eggshell, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: C.indigo, opacity: 0.5 }}>Kein Supplementplan gefunden.</p>
      </div>
    );
  }

  const s = {
    page: { background: C.white, width: "210mm", minHeight: "297mm", margin: "0 auto 32px", padding: "18mm 16mm", boxShadow: "0 4px 40px rgba(0,65,106,0.08)", position: "relative" },
    label: { fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.indigo, opacity: 0.45, margin: "0 0 6px" },
    divider: { border: "none", borderTop: `1px solid rgba(0,65,106,0.08)`, margin: "20px 0" },
    tag: { display: "inline-block", background: `rgba(0,65,106,0.08)`, color: C.indigo, fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", letterSpacing: "0.1em" },
  };

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
        <div style={{ display: "flex", gap: "8px" }}>
          {edit ? (
            <>
              <button onClick={addRow} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(0,65,106,0.08)", color: C.indigo, border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                <Plus size={15} /> Zeile
              </button>
              <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: C.indigo, color: C.white, border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                <Save size={15} /> {saving ? "Speichern…" : "Speichern"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEdit(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(0,65,106,0.1)", color: C.indigo, border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                <Edit2 size={15} /> Bearbeiten
              </button>
              <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: C.indigo, color: C.white, border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                <Printer size={15} /> Drucken
              </button>
            </>
          )}
        </div>
      </div>

      {/* PAGE */}
      <div style={s.page}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <p style={s.label}>Supplementplan</p>
            {edit ? (
              <input value={draft.client_name || ""} onChange={e => setDraft(d => ({ ...d, client_name: e.target.value }))}
                style={{ fontSize: "22px", fontWeight: 900, color: C.indigo, border: "none", borderBottom: `2px solid ${C.indigo}`, outline: "none", background: "transparent", width: "260px" }} />
            ) : (
              <h1 style={{ fontSize: "22px", fontWeight: 900, color: C.indigo, margin: 0 }}>{draft.client_name}</h1>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={s.tag}>Supplemente · v{draft.version}</span>
            {edit && (
              <input value={draft.version || ""} onChange={e => setDraft(d => ({ ...d, version: e.target.value }))}
                style={{ display: "block", marginTop: "4px", fontSize: "11px", border: "1px solid rgba(0,65,106,0.2)", borderRadius: "6px", padding: "2px 6px", width: "60px", textAlign: "center" }} />
            )}
          </div>
        </div>

        {/* Intro */}
        {(draft.intro_text || edit) && (
          <>
            <p style={s.label}>Hinweis</p>
            {edit ? (
              <textarea value={draft.intro_text || ""} onChange={e => setDraft(d => ({ ...d, intro_text: e.target.value }))}
                rows={3} placeholder="Einleitungstext…"
                style={{ width: "100%", border: "1px solid rgba(0,65,106,0.15)", borderRadius: "8px", padding: "8px 10px", fontSize: "11px", fontFamily: "inherit", resize: "none", marginBottom: "20px" }} />
            ) : (
              <p style={{ fontSize: "11px", color: "#333", lineHeight: 1.6, marginBottom: "20px" }}>{draft.intro_text}</p>
            )}
          </>
        )}

        <hr style={s.divider} />

        {/* TABLE */}
        <p style={s.label}>Übersicht</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10.5px" }}>
            <thead>
              <tr style={{ background: `rgba(0,65,106,0.06)` }}>
                {["Nährstoff", "Dosis/Kaps.", "Produkt", "Morgens", "Mittags", "Abends", "Zur Nacht", "Dosis/Tag", "Link", "Notiz", ...(edit ? [""] : [])].map(h => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700, color: C.indigo, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: `2px solid rgba(0,65,106,0.1)` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([gruppe, rows]) => (
                <React.Fragment key={gruppe}>
                  <tr>
                    <td colSpan={edit ? 11 : 10} style={{ padding: "10px 8px 4px", fontWeight: 800, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.indigo, opacity: 0.5, borderTop: `1px solid rgba(0,65,106,0.08)` }}>
                      {edit ? (
                        <input value={rows[0].gruppe || ""} onChange={e => rows.forEach(r => updSupp(r._idx, "gruppe", e.target.value))}
                          placeholder="Gruppe…"
                          style={{ border: "none", borderBottom: "1px solid rgba(0,65,106,0.3)", background: "transparent", fontSize: "9px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: C.indigo, outline: "none", width: "150px" }} />
                      ) : gruppe}
                    </td>
                  </tr>
                  {rows.map((row) => (
                    <tr key={row._idx} style={{ borderBottom: `1px solid rgba(0,65,106,0.05)`, background: row._idx % 2 === 0 ? "transparent" : "rgba(0,65,106,0.015)" }}>
                      <td style={{ padding: "6px 8px", fontWeight: 600, color: "#111" }}>
                        {edit ? <EditableCell value={row.naehrstoff} onChange={v => updSupp(row._idx, "naehrstoff", v)} placeholder="Nährstoff" /> : row.naehrstoff}
                      </td>
                      <td style={{ padding: "6px 8px", color: "#444" }}>
                        {edit ? <EditableCell value={row.dosis} onChange={v => updSupp(row._idx, "dosis", v)} placeholder="z.B. 1000 IE" /> : row.dosis}
                      </td>
                      <td style={{ padding: "6px 8px", color: "#555" }}>
                        {edit ? <EditableCell value={row.produkt} onChange={v => updSupp(row._idx, "produkt", v)} placeholder="Marke" /> : row.produkt}
                      </td>
                      {["morgens", "mittags", "abends", "zur_nacht"].map(t => (
                        <td key={t} style={{ padding: "6px 8px", color: "#555", fontSize: "10px" }}>
                          {edit ? <EditableCell value={row[t]} onChange={v => updSupp(row._idx, t, v)} placeholder="–" /> : (row[t] || <span style={{ color: "#ccc" }}>–</span>)}
                        </td>
                      ))}
                      <td style={{ padding: "6px 8px", fontWeight: 700, color: C.indigo }}>
                        {edit ? <EditableCell value={row.dosis_tag} onChange={v => updSupp(row._idx, "dosis_tag", v)} placeholder="Gesamtdosis" /> : row.dosis_tag}
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        {edit ? (
                          <EditableCell value={row.kauflink} onChange={v => updSupp(row._idx, "kauflink", v)} placeholder="https://…" />
                        ) : row.kauflink ? (
                          <a href={row.kauflink} target="_blank" rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", gap: "3px", color: C.indigo, fontSize: "10px", fontWeight: 600 }}>
                            <ExternalLink size={11} /> Bestellen
                          </a>
                        ) : <span style={{ color: "#ccc" }}>–</span>}
                      </td>
                      <td style={{ padding: "6px 8px", color: "#666", fontSize: "10px", maxWidth: "120px" }}>
                        {edit ? <EditableCell value={row.notiz} onChange={v => updSupp(row._idx, "notiz", v)} placeholder="Notiz…" /> : row.notiz}
                      </td>
                      {edit && (
                        <td style={{ padding: "6px 8px" }}>
                          <button onClick={() => removeRow(row._idx)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#e55", padding: "2px" }}>
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {edit && (
          <button onClick={addRow} className="no-print"
            style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(0,65,106,0.07)", color: C.indigo, border: "1px dashed rgba(0,65,106,0.25)", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> Zeile hinzufügen
          </button>
        )}

        {/* Footer */}
        <div style={{ position: "absolute", bottom: "14mm", left: "16mm", right: "16mm", display: "flex", justifyContent: "space-between", borderTop: `1px solid rgba(0,65,106,0.08)`, paddingTop: "8px" }}>
          <span style={{ fontSize: "8px", color: C.indigo, opacity: 0.3, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Supplementplan · {draft.client_name}</span>
          <span style={{ fontSize: "8px", color: C.indigo, opacity: 0.3, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Leistungsarchitektur</span>
        </div>
      </div>
    </div>
  );
}