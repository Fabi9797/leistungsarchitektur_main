import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Printer, Pencil, Check, X, Plus, Trash2, Sparkles, Loader2, ArrowUp, ArrowDown, Mail } from "lucide-react";
import EmailNutritionModal from "@/components/content/EmailNutritionModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const DEFAULT_ORDER = ["morgens", "mittags", "snack", "abend"];
const SECTION_LABELS = { morgens: "Morgens", mittags: "Mittags", snack: "Snack", abend: "Abends" };

const parse = (str, fallback = []) => { try { return JSON.parse(str); } catch { return fallback; } };
const C = { indigo: "#00416A", egg: "#F0EAD6" };

const s = {
  label: { fontSize: "8px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(0,65,106,0.45)", margin: "0 0 10px" },
  h1: { fontSize: "38px", fontWeight: 800, color: C.indigo, lineHeight: 1.05, margin: 0 },
  h2: { fontSize: "22px", fontWeight: 800, color: C.indigo, lineHeight: 1.1, margin: 0 },
  h3: { fontSize: "13px", fontWeight: 700, color: C.indigo, margin: "0 0 8px" },
  body: { fontSize: "11px", color: "rgba(0,0,0,0.6)", lineHeight: 1.65 },
  small: { fontSize: "9px", color: "rgba(0,0,0,0.4)", fontWeight: 500 },
  divider: { height: "1px", background: "rgba(0,65,106,0.08)", margin: "16px 0", border: "none" },
};

// Editable text field – looks normal in view mode, becomes an input in edit mode
function E({ value, onChange, edit, style, multiline, placeholder = "..." }) {
  if (!edit) return multiline
    ? <p style={{ ...style, margin: 0 }}>{value}</p>
    : <span style={style}>{value}</span>;

  const base = {
    background: "rgba(0,65,106,0.04)", border: "1px dashed rgba(0,65,106,0.25)",
    borderRadius: "4px", outline: "none", fontFamily: "inherit", resize: "none",
    width: "100%", padding: "2px 4px", boxSizing: "border-box",
    ...style,
  };

  return multiline
    ? <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...base, display: "block" }} />
    : <input value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, display: "inline-block" }} />;
}

// Editable bullet list
function EditableList({ items, onChange, edit }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", alignItems: "flex-start" }}>
          <span style={{ color: C.indigo, fontWeight: 700, fontSize: "10px", marginTop: "2px", flexShrink: 0 }}>·</span>
          {edit ? (
            <div style={{ display: "flex", gap: "4px", flex: 1, alignItems: "center" }}>
              <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
                style={{ flex: 1, background: "rgba(0,65,106,0.04)", border: "1px dashed rgba(0,65,106,0.25)", borderRadius: "4px", outline: "none", fontFamily: "inherit", fontSize: "11px", padding: "2px 4px", color: "rgba(0,0,0,0.6)" }} />
              <button onClick={() => { const n = items.filter((_, j) => j !== i); onChange(n); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#cc3333", padding: "2px", flexShrink: 0 }}>
                <X size={10} />
              </button>
            </div>
          ) : (
            <p style={{ ...s.body, margin: 0 }}>{item}</p>
          )}
        </div>
      ))}
      {edit && (
        <button onClick={() => onChange([...items, ""])}
          style={{ marginTop: "4px", background: "none", border: "1px dashed rgba(0,65,106,0.3)", borderRadius: "4px", cursor: "pointer", color: C.indigo, fontSize: "10px", padding: "2px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
          <Plus size={9} /> Zeile hinzufügen
        </button>
      )}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span style={{ background: C.egg, color: C.indigo, borderRadius: "4px", padding: "3px 10px", fontSize: "10px", fontWeight: 600, display: "inline-block", marginRight: "6px", marginBottom: "4px" }}>
      {children}
    </span>
  );
}

function MealCard({ variant, edit, onChange, onDelete, index, showIndex }) {
  const upd = (key, val) => onChange({ ...variant, [key]: val });
  const updList = (key, val) => onChange({ ...variant, [key]: val });
  const [genLoading, setGenLoading] = useState(false);
  const fileInputRef = React.useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadLoading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    onChange({ ...variant, image_url: result.file_url });
    setUploadLoading(false);
  }

  async function generateImage() {
    const basis = variant.basis || [];
    if (!basis.length && !variant.name) return;
    setGenLoading(true);
    const ingredients = basis.join(", ") || variant.name;
    const result = await base44.integrations.Core.GenerateImage({
      prompt: `Clean, minimal food photography of: ${ingredients}. Top-down view on a white plate, natural light, professional food photo, no garnish, no text.`
    });
    onChange({ ...variant, image_url: result.url });
    setGenLoading(false);
  }

  return (
    <div style={{ border: "1px solid rgba(0,65,106,0.1)", borderRadius: "10px", overflow: "hidden", background: "white", position: "relative" }}>
      <div style={{ width: "100%", height: "140px", background: C.egg, position: "relative", overflow: "hidden" }}>
        {variant.image_url ? (
          <img src={variant.image_url} alt={variant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ ...s.small, opacity: 0.5 }}>Kein Bild</p>
          </div>
        )}
        {edit && (
          <div style={{ position: "absolute", bottom: "8px", right: "8px", display: "flex", gap: "4px" }}>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current.click()} disabled={uploadLoading} style={{ background: "rgba(0,0,0,0.55)", color: "white", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "10px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", opacity: uploadLoading ? 0.7 : 1 }}>
              {uploadLoading ? <><Loader2 size={9} style={{ animation: "spin 1s linear infinite" }} /> Hochladen…</> : <>↑ Upload</>}
            </button>
            <button onClick={generateImage} disabled={genLoading} style={{ background: C.indigo, color: "white", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "10px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", opacity: genLoading ? 0.7 : 1 }}>
              {genLoading ? <><Loader2 size={9} style={{ animation: "spin 1s linear infinite" }} /> Generieren…</> : <><Sparkles size={9} /> KI-Bild</>}
            </button>
          </div>
        )}
      </div>
      {edit && (
        <button onClick={onDelete} style={{ position: "absolute", top: "8px", left: "8px", zIndex: 2, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "4px", cursor: "pointer", color: "#cc3333", padding: "2px 6px", fontSize: "10px", display: "flex", alignItems: "center", gap: "3px" }}>
          <Trash2 size={9} /> Löschen
        </button>
      )}
      <div style={{ padding: "14px 16px" }}>
        {showIndex && <p style={{ ...s.small, marginBottom: "6px" }}>Option {index + 1}</p>}
        <E value={variant.name} onChange={v => upd("name", v)} edit={edit} style={{ ...s.h3, marginBottom: "12px", display: "block" }} placeholder="Name" />
        <hr style={s.divider} />
        {(variant.basis || edit) && (
          <div style={{ marginBottom: "10px" }}>
            <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Basis</p>
            <EditableList items={variant.basis || []} onChange={v => updList("basis", v)} edit={edit} />
          </div>
        )}
        {(variant.beilagen?.length > 0 || edit) && (
          <div style={{ marginBottom: "10px" }}>
            <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Beilagen</p>
            <EditableList items={variant.beilagen || []} onChange={v => updList("beilagen", v)} edit={edit} />
          </div>
        )}
        {(variant.beilage1?.length > 0 || edit) && (
          <div style={{ marginBottom: "10px" }}>
            <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Beilage 1</p>
            <EditableList items={variant.beilage1 || []} onChange={v => updList("beilage1", v)} edit={edit} />
          </div>
        )}
        {(variant.beilage2?.length > 0 || edit) && (
          <div style={{ marginBottom: "10px" }}>
            <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.12em", textTransform: "uppercase" }}>Beilage 2</p>
            <EditableList items={variant.beilage2 || []} onChange={v => updList("beilage2", v)} edit={edit} />
          </div>
        )}
        <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid rgba(0,65,106,0.07)" }}>
          {edit ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <input value={variant.kcal || ""} onChange={ev => upd("kcal", ev.target.value)} placeholder="kcal" style={{ width: "80px", background: C.egg, border: "1px dashed rgba(0,65,106,0.3)", borderRadius: "4px", outline: "none", fontFamily: "inherit", fontSize: "10px", fontWeight: 600, color: C.indigo, padding: "2px 6px" }} />
              <input value={variant.protein || ""} onChange={ev => upd("protein", ev.target.value)} placeholder="Protein" style={{ width: "80px", background: C.egg, border: "1px dashed rgba(0,65,106,0.3)", borderRadius: "4px", outline: "none", fontFamily: "inherit", fontSize: "10px", fontWeight: 600, color: C.indigo, padding: "2px 6px" }} />
            </div>
          ) : (
            <>
              <Tag>{variant.kcal}</Tag>
              <Tag>{variant.protein}</Tag>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MealSection({ title, items, edit, onChange, onRename, onDelete, sectionKey }) {
  const newCard = { name: "Neue Option", basis: [], kcal: "000 kcal", protein: "00g P" };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        {edit ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
            <Pencil size={14} style={{ color: C.indigo, opacity: 0.5, flexShrink: 0 }} />
            <input
              value={title}
              onChange={ev => onRename(ev.target.value)}
              style={{ fontSize: "22px", fontWeight: 800, color: C.indigo, lineHeight: 1.1, flex: 1, background: "#f0f7ff", border: `2px solid ${C.indigo}`, borderRadius: "6px", outline: "none", fontFamily: "inherit", padding: "4px 10px" }}
            />
          </div>
        ) : (
          <h2 style={{ ...s.h2, margin: 0 }}>{title}</h2>
        )}
        {edit && (
          <button onClick={onDelete}
            style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "6px", cursor: "pointer", color: "#cc3333", padding: "4px 10px", fontSize: "10px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
            <Trash2 size={11} /> Sektion löschen
          </button>
        )}
      </div>
      {edit ? (
        <Droppable droppableId={sectionKey} direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: "flex", gap: "16px", minHeight: "80px", flexWrap: "wrap", alignItems: "flex-start" }}
            >
              {items.map((v, i) => (
                <Draggable key={`${sectionKey}-${i}`} draggableId={`${sectionKey}-${i}`} index={i}>
                  {(prov, snapshot) => (
                    <div ref={prov.innerRef} {...prov.draggableProps}
                      style={{ ...prov.draggableProps.style, opacity: snapshot.isDragging ? 0.85 : 1, width: "calc(33% - 12px)", minWidth: "200px", flexShrink: 0 }}>
                      <div {...prov.dragHandleProps}
                        style={{ textAlign: "center", fontSize: "10px", color: "rgba(0,65,106,0.35)", marginBottom: "4px", cursor: "grab", userSelect: "none" }}>
                        ⠿ verschieben
                      </div>
                      <MealCard variant={v} index={i} showIndex={items.length > 1} edit={edit}
                        onChange={updated => { const n = [...items]; n[i] = updated; onChange(n); }}
                        onDelete={() => onChange(items.filter((_, j) => j !== i))} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(Math.max(items.length, 1), 3)}, 1fr)`, gap: "16px" }}>
          {items.map((v, i) => (
            <MealCard key={i} variant={v} index={i} showIndex={items.length > 1} edit={edit}
              onChange={updated => { const n = [...items]; n[i] = updated; onChange(n); }}
              onDelete={() => onChange(items.filter((_, j) => j !== i))} />
          ))}
        </div>
      )}
      {edit && (
        <button onClick={() => onChange([...items, { ...newCard }])}
          style={{ marginTop: "12px", background: "none", border: "1px dashed rgba(0,65,106,0.3)", borderRadius: "8px", cursor: "pointer", color: C.indigo, fontSize: "11px", fontWeight: 600, padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={11} /> Karte hinzufügen
        </button>
      )}
    </>
  );
}

function Page({ children, pageNum }) {
  return (
    <div className="page" style={{
      width: "794px", minHeight: "1123px", background: "white", margin: "0 auto 32px",
      padding: "56px 60px", boxSizing: "border-box", boxShadow: "0 4px 40px rgba(0,0,0,0.12)",
      display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif",
    }}>
      {children}
      <div style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={s.small}>Leistungsarchitektur · Vertraulich</p>
        <p style={s.small}>Seite {pageNum}</p>
      </div>
    </div>
  );
}

export default function NutritionStrategy832() {
  const [origData, setOrigData] = useState(null);
  const [draft, setDraft] = useState(null);
  const [clientEmail, setClientEmail] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const entityId = useRef(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    entityId.current = id;
    if (id) {
      base44.entities.NutritionStrategy.filter({ id }).then(all => {
        const found = all[0];
        if (found) {
          setOrigData(found);
          setDraft(toDraft(found));
          if (found.client_name) {
            base44.entities.ClientProfile.list().then(clients => {
              const client = clients.find(c => c.name?.toLowerCase() === found.client_name?.toLowerCase());
              if (client?.email) setClientEmail(client.email);
            });
          }
        }
      });
    }
  }, []);

  function toDraft(d) {
    let sectionOrder = DEFAULT_ORDER;
    let sectionLabels = { ...SECTION_LABELS };
    try {
      const parsed = JSON.parse(d.section_order_json);
      if (Array.isArray(parsed)) {
        sectionOrder = parsed;
      } else if (parsed?.order) {
        sectionOrder = parsed.order;
        sectionLabels = { ...SECTION_LABELS, ...(parsed.labels || {}) };
      }
    } catch {}
    return {
      client_name: d.client_name || "",
      version: d.version || "1",
      ist_summary: d.ist_summary || "",
      soll_summary: d.soll_summary || "",
      kalorien_ziel: d.kalorien_ziel || "",
      kalorien_defizit: d.kalorien_defizit || "",
      protein_ziel: d.protein_ziel || "",
      protein_info: d.protein_info || "",
      warum: parse(d.warum_json, []) || [],
      mahlzeiten: parse(d.mahlzeiten_json, []) || [],
      morgens: parse(d.morgens_json, []) || [],
      mittags: parse(d.mittags_json, []) || [],
      snack: parse(d.snack_json, []) || [],
      abend: parse(d.abend_json, []) || [],
      sectionOrder,
      sectionLabels,
    };
  }

  async function handleSave() {
    setSaving(true);
    await base44.entities.NutritionStrategy.update(entityId.current, {
      client_name: draft.client_name,
      version: draft.version,
      ist_summary: draft.ist_summary,
      soll_summary: draft.soll_summary,
      kalorien_ziel: Number(draft.kalorien_ziel),
      kalorien_defizit: draft.kalorien_defizit,
      protein_ziel: Number(draft.protein_ziel),
      protein_info: draft.protein_info,
      warum_json: JSON.stringify(draft.warum),
      mahlzeiten_json: JSON.stringify(draft.mahlzeiten),
      morgens_json: JSON.stringify(draft.morgens),
      mittags_json: JSON.stringify(draft.mittags),
      snack_json: JSON.stringify(draft.snack),
      abend_json: JSON.stringify(draft.abend),
      section_order_json: JSON.stringify({ order: draft.sectionOrder, labels: draft.sectionLabels }),
    });
    setSaving(false);
    setEditMode(false);
  }

  function handleDiscard() {
    setDraft(toDraft(origData));
    setEditMode(false);
  }

  const upd = (key, val) => setDraft(d => ({ ...d, [key]: val }));
  const updWhy = (i, key, val) => setDraft(d => { const w = [...d.warum]; w[i] = { ...w[i], [key]: val }; return { ...d, warum: w }; });
  const updMeal = (i, key, val) => setDraft(d => { const m = [...d.mahlzeiten]; m[i] = { ...m[i], [key]: val }; return { ...d, mahlzeiten: m }; });

  const e = editMode;
  const date = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  if (!draft) return (
    <div style={{ minHeight: "100vh", background: C.egg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <p style={{ color: "rgba(0,0,0,0.3)", fontSize: "14px" }}>Laden…</p>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        input, textarea { font-family: 'Inter', sans-serif; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .no-print { display: none !important; }
          .print-wrapper { background: white !important; padding: 0 !important; }
          .page {
            width: 210mm !important;
            height: 297mm !important;
            min-height: unset !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 14mm 16mm !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
          }
          @page { size: A4 portrait; margin: 0; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ background: C.indigo, color: "white", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 50, gap: "12px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5, flexShrink: 0 }}>
          Ernährungsstrategie · {draft.client_name}
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {!editMode ? (
            <>
              <button onClick={() => setEditMode(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                <Pencil size={12} /> Bearbeiten
              </button>
              <button onClick={() => setShowEmailModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                <Mail size={12} /> E-Mail senden
              </button>
              <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "white", color: C.indigo, border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                <Printer size={12} /> Als PDF
              </button>
            </>
          ) : (
            <>
              <span style={{ fontSize: "10px", opacity: 0.6, fontStyle: "italic" }}>Bearbeitungsmodus aktiv</span>
              <button onClick={handleDiscard} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                <X size={11} /> Verwerfen
              </button>
              <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", background: "#22c55e", color: "white", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                <Check size={11} /> {saving ? "Speichern…" : "Speichern"}
              </button>
            </>
          )}
        </div>
      </div>

      {showEmailModal && (
        <EmailNutritionModal
          draft={draft}
          strategyId={entityId.current}
          defaultEmail={clientEmail}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      <div className="print-wrapper" style={{ background: "#e8e2d0", padding: "40px 20px" }}>

        {/* SEITE 1: Cover + Warum */}
        <Page pageNum={1}>
          <div style={{ paddingBottom: "28px", marginBottom: "28px", borderBottom: `2px solid ${C.indigo}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={s.label}>Leistungsarchitektur · Ernährungsstrategie</p>
                <E value={draft.client_name} onChange={v => upd("client_name", v)} edit={e} style={s.h1} placeholder="Kundenname" />
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ ...s.body }}>Version </span>
                  <E value={draft.version} onChange={v => upd("version", v)} edit={e} style={{ ...s.body, width: e ? "40px" : "auto" }} placeholder="1" />
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={s.small}>Erstellt am</p>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(0,0,0,0.5)", marginTop: "2px" }}>{date}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
              <div style={{ background: "rgba(240,234,214,0.8)", borderRadius: "8px", padding: "14px 16px" }}>
                <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.15em", textTransform: "uppercase" }}>IST-Zustand</p>
                <E value={draft.ist_summary} onChange={v => upd("ist_summary", v)} edit={e} multiline style={{ fontSize: "12px", fontWeight: 600, color: "rgba(0,0,0,0.7)" }} placeholder="IST-Zustand beschreiben" />
              </div>
              <div style={{ background: C.indigo, borderRadius: "8px", padding: "14px 16px" }}>
                <p style={{ ...s.small, marginBottom: "5px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Zielzustand</p>
                <E value={draft.soll_summary} onChange={v => upd("soll_summary", v)} edit={e} multiline style={{ fontSize: "12px", fontWeight: 600, color: e ? "rgba(0,0,0,0.7)" : "white" }} placeholder="Zielzustand beschreiben" />
              </div>
            </div>
          </div>

          <p style={s.label}>Begründung</p>
          <h2 style={{ ...s.h2, marginBottom: "20px" }}>Warum diese Strategie?</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {draft.warum.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "16px", alignItems: "start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: C.egg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: C.indigo }}>{i + 1}</span>
                </div>
                <div style={{ position: "relative" }}>
                  {e && (
                    <button onClick={() => setDraft(d => ({ ...d, warum: d.warum.filter((_, j) => j !== i) }))}
                      style={{ position: "absolute", top: 0, right: 0, background: "none", border: "none", cursor: "pointer", color: "#cc3333", padding: 0 }}>
                      <X size={11} />
                    </button>
                  )}
                  <div style={{ display: "flex", gap: "4px", marginBottom: "3px", flexWrap: "wrap" }}>
                    <E value={item.title} onChange={v => updWhy(i, "title", v)} edit={e} style={{ fontSize: "13px", fontWeight: 700, color: C.indigo }} placeholder="Titel" />
                    {(item.subtitle || e) && (
                      <>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: C.indigo, opacity: 0.6 }}> – „</span>
                        <E value={item.subtitle} onChange={v => updWhy(i, "subtitle", v)} edit={e} style={{ fontSize: "13px", fontWeight: 500, color: C.indigo, opacity: 0.6 }} placeholder="Untertitel" />
                        <span style={{ fontSize: "13px", fontWeight: 500, color: C.indigo, opacity: 0.6 }}>"</span>
                      </>
                    )}
                  </div>
                  <E value={item.text} onChange={v => updWhy(i, "text", v)} edit={e} multiline style={s.body} placeholder="Beschreibung" />
                </div>
              </div>
            ))}
            {e && (
              <button onClick={() => setDraft(d => ({ ...d, warum: [...d.warum, { title: "", subtitle: "", text: "" }] }))}
                style={{ alignSelf: "flex-start", background: "none", border: "1px dashed rgba(0,65,106,0.3)", borderRadius: "8px", cursor: "pointer", color: C.indigo, fontSize: "11px", fontWeight: 600, padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={11} /> Punkt hinzufügen
              </button>
            )}
          </div>
        </Page>

        {/* SEITE 2: Tagesstruktur */}
        <Page pageNum={2}>
          <p style={s.label}>Umsetzung</p>
          <h2 style={{ ...s.h2, marginBottom: "24px" }}>Tagesstruktur & Ziele</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: C.egg, borderRadius: "10px", padding: "20px 24px" }}>
              <p style={s.label}>Kalorienziel</p>
              <E value={String(draft.kalorien_ziel)} onChange={v => upd("kalorien_ziel", v)} edit={e} style={{ fontSize: "36px", fontWeight: 800, color: C.indigo, lineHeight: 1, display: "block", marginBottom: "4px" }} placeholder="2000" />
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={s.body}>kcal · </span>
                <E value={draft.kalorien_defizit} onChange={v => upd("kalorien_defizit", v)} edit={e} style={s.body} placeholder="z.B. 500 kcal Defizit" />
              </div>
            </div>
            <div style={{ background: C.egg, borderRadius: "10px", padding: "20px 24px" }}>
              <p style={s.label}>Proteinziel</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                <E value={String(draft.protein_ziel)} onChange={v => upd("protein_ziel", v)} edit={e} style={{ fontSize: "36px", fontWeight: 800, color: C.indigo, lineHeight: 1, marginBottom: "4px", display: "block" }} placeholder="180" />
                {!e && <span style={{ fontSize: "20px", fontWeight: 800, color: C.indigo }}>g</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={s.body}>Eiweiß täglich · </span>
                <E value={draft.protein_info} onChange={v => upd("protein_info", v)} edit={e} style={s.body} placeholder="Info" />
              </div>
            </div>
          </div>

          <hr style={s.divider} />

          <p style={{ ...s.label, marginBottom: "14px" }}>Mahlzeitenstruktur</p>
          <div style={{ border: "1px solid rgba(0,65,106,0.1)", borderRadius: "10px", overflow: "hidden" }}>
            {draft.mahlzeiten.map((m, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: e ? "1fr 1fr 1fr 30px" : "1fr 1fr 1fr", padding: "12px 20px", background: i % 2 === 0 ? "white" : "rgba(240,234,214,0.5)", borderBottom: i < draft.mahlzeiten.length - 1 ? "1px solid rgba(0,65,106,0.06)" : "none", alignItems: "center" }}>
                <E value={m.name} onChange={v => updMeal(i, "name", v)} edit={e} style={{ fontSize: "12px", fontWeight: 700, color: C.indigo }} placeholder="Name" />
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <E value={m.kcal} onChange={v => updMeal(i, "kcal", v)} edit={e} style={{ ...s.body, fontSize: "11px" }} placeholder="kcal" />
                  {!e && <span style={{ ...s.body, fontSize: "11px" }}> · </span>}
                  <E value={m.protein} onChange={v => updMeal(i, "protein", v)} edit={e} style={{ ...s.body, fontSize: "11px" }} placeholder="Protein" />
                </div>
                <E value={m.zeit} onChange={v => updMeal(i, "zeit", v)} edit={e} style={{ ...s.small, textAlign: e ? "left" : "right", fontSize: "10px" }} placeholder="Zeit" />
                {e && (
                  <button onClick={() => setDraft(d => ({ ...d, mahlzeiten: d.mahlzeiten.filter((_, j) => j !== i) }))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#cc3333", padding: "2px" }}>
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {e && (
            <button onClick={() => setDraft(d => ({ ...d, mahlzeiten: [...d.mahlzeiten, { name: "", kcal: "", protein: "", zeit: "" }] }))}
              style={{ marginTop: "8px", background: "none", border: "1px dashed rgba(0,65,106,0.3)", borderRadius: "8px", cursor: "pointer", color: C.indigo, fontSize: "11px", fontWeight: 600, padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={11} /> Zeile hinzufügen
            </button>
          )}
        </Page>

        {/* SEITEN 3+: Mahlzeiten in konfigurierbarer Reihenfolge */}
        <DragDropContext onDragEnd={(result) => {
          if (!result.destination) return;
          const srcKey = result.source.droppableId;
          const dstKey = result.destination.droppableId;
          const srcItems = [...draft[srcKey]];
          const [moved] = srcItems.splice(result.source.index, 1);
          if (srcKey === dstKey) {
            srcItems.splice(result.destination.index, 0, moved);
            upd(srcKey, srcItems);
          } else {
            const dstItems = [...draft[dstKey]];
            dstItems.splice(result.destination.index, 0, moved);
            setDraft(d => ({ ...d, [srcKey]: srcItems, [dstKey]: dstItems }));
          }
        }}>
        {draft.sectionOrder.filter(key => editMode || draft[key].length > 0).map((key, idx) => (
          <Page key={key} pageNum={idx + 3}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <p style={s.label}>Mahlzeiten</p>
              {e && (
                <div style={{ display: "flex", gap: "4px" }} className="no-print">
                  <button
                    onClick={() => {
                      if (idx === 0) return;
                      const o = [...draft.sectionOrder];
                      [o[idx - 1], o[idx]] = [o[idx], o[idx - 1]];
                      upd("sectionOrder", o);
                    }}
                    disabled={idx === 0}
                    style={{ background: "rgba(0,65,106,0.08)", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: 600, color: C.indigo }}
                  >
                    <ArrowUp size={11} /> Seite vor
                  </button>
                  <button
                    onClick={() => {
                      if (idx === draft.sectionOrder.length - 1) return;
                      const o = [...draft.sectionOrder];
                      [o[idx], o[idx + 1]] = [o[idx + 1], o[idx]];
                      upd("sectionOrder", o);
                    }}
                    disabled={idx === draft.sectionOrder.length - 1}
                    style={{ background: "rgba(0,65,106,0.08)", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: idx === draft.sectionOrder.length - 1 ? "default" : "pointer", opacity: idx === draft.sectionOrder.length - 1 ? 0.3 : 1, display: "flex", alignItems: "center", gap: "3px", fontSize: "10px", fontWeight: 600, color: C.indigo }}
                  >
                    Seite zurück <ArrowDown size={11} />
                  </button>

                </div>
              )}
            </div>
            <MealSection
              title={draft.sectionLabels?.[key] || SECTION_LABELS[key]}
              items={draft[key]}
              edit={e}
              onChange={v => upd(key, v)}
              sectionKey={key}
              onRename={name => setDraft(d => ({ ...d, sectionLabels: { ...d.sectionLabels, [key]: name } }))}
              onDelete={() => setDraft(d => ({
                ...d,
                sectionOrder: d.sectionOrder.filter(k => k !== key),
                [key]: [],
                sectionLabels: Object.fromEntries(Object.entries(d.sectionLabels || {}).filter(([k2]) => k2 !== key))
              }))}
            />
          </Page>
        ))}
        </DragDropContext>

      </div>
    </>
  );
}