import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, ChevronDown, ChevronUp, Pencil, X, Save, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";

const PHASE_COLORS = {
  1: { bg: "#00416A", light: "#e8f0f7", badge: "#00416A" },
  2: { bg: "#1a6b3c", light: "#e8f5ee", badge: "#1a6b3c" },
  3: { bg: "#7b3fa0", light: "#f3e8f7", badge: "#7b3fa0" },
  4: { bg: "#b45309", light: "#fef3e2", badge: "#b45309" },
};

function EditableText({ value, onChange, multiline, className }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const commit = () => { onChange(val); setEditing(false); };

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className={`cursor-pointer hover:bg-black/5 rounded px-0.5 transition ${className}`}
        title="Klicken zum Bearbeiten"
      >
        {value || <span className="text-black/20 italic">leer</span>}
      </span>
    );
  }

  return multiline ? (
    <textarea
      autoFocus
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      rows={3}
      className={`w-full border border-[#00416A]/40 rounded px-1 py-0.5 text-xs focus:outline-none resize-none bg-white ${className}`}
    />
  ) : (
    <input
      autoFocus
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={commit}
      className={`w-full border border-[#00416A]/40 rounded px-1 py-0.5 text-xs focus:outline-none bg-white ${className}`}
    />
  );
}

function EditableList({ items, label, phaseColor, onChange }) {
  const [addVal, setAddVal] = useState("");

  if (!items && !onChange) return null;
  const list = items || [];

  const updateItem = (i, val) => {
    const next = [...list];
    next[i] = val;
    onChange(next);
  };

  const removeItem = (i) => {
    onChange(list.filter((_, idx) => idx !== i));
  };

  const addItem = () => {
    if (!addVal.trim()) return;
    onChange([...list, addVal.trim()]);
    setAddVal("");
  };

  if (list.length === 0 && !onChange) return null;

  return (
    <div className="mt-3">
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: phaseColor.badge }}>{label}</p>
      <ul className="space-y-1">
        {list.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-black/70 group">
            <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: phaseColor.badge }} />
            <EditableText value={item} onChange={v => updateItem(i, v)} className="flex-1 text-xs text-black/70" />
            <button onClick={() => removeItem(i)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition flex-shrink-0">
              <X className="w-3 h-3" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-1 mt-1.5">
        <input
          value={addVal}
          onChange={e => setAddVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()}
          placeholder="+ Hinzufügen..."
          className="flex-1 border border-black/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#00416A]/30 bg-white/70"
        />
        <button onClick={addItem} className="px-2 py-1 bg-black/10 rounded text-xs hover:bg-black/15 transition">+</button>
      </div>
    </div>
  );
}

function WocheCard({ woche, phaseColor, editMode, onUpdate }) {
  const [open, setOpen] = useState(false);
  const data = woche;

  const set = (key, val) => onUpdate({ ...data, [key]: val });

  const TextField = ({ field, label, multiline }) => (
    <div className="mt-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-1">{label}</p>
      {editMode
        ? <EditableText value={data[field] || ""} onChange={v => set(field, v)} multiline={multiline} className="text-xs text-black/60 block w-full" />
        : data[field] ? <p className="text-xs text-black/60">{data[field]}</p> : null
      }
    </div>
  );

  const ListField = ({ field, label }) => {
    if (!editMode && (!data[field] || !data[field].length)) return null;
    return (
      <EditableList
        items={data[field] || []}
        label={label}
        phaseColor={phaseColor}
        onChange={editMode ? (v) => set(field, v) : null}
      />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-black/2 transition"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: phaseColor.badge }}>
            {data.woche}
          </span>
          <div>
            {editMode
              ? <EditableText value={data.titel || ""} onChange={v => set("titel", v)} className="font-bold text-black text-sm block" />
              : <p className="font-bold text-black text-sm">{data.titel}</p>
            }
            {editMode
              ? <EditableText value={data.hauptfokus || ""} onChange={v => set("hauptfokus", v)} className="text-xs text-black/40 mt-0.5 block" />
              : <p className="text-xs text-black/40 mt-0.5">{data.hauptfokus}</p>
            }
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-black/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-black/30 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-black/5" style={{ background: phaseColor.light }}>
          <TextField field="nebenfokus" label="Nebenfokus" />
          <ListField field="aktiv" label="Aktiv" />
          <ListField field="nicht_aktiv" label="Nicht aktiv" />
          <ListField field="noch_nicht" label="Noch nicht" />
          <ListField field="weekly_review" label="Weekly Review" />
          <ListField field="moegliche_anpassungen" label="Mögliche Anpassungen" />
          <ListField field="kpis" label="KPIs" />
          <ListField field="regeln" label="Regeln" />

          {(data.ziel_woche || editMode) && (
            <div className="mt-3 p-3 rounded-lg" style={{ background: phaseColor.badge + "18" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: phaseColor.badge }}>Ziel der Woche</p>
              {editMode
                ? <EditableText value={data.ziel_woche || ""} onChange={v => set("ziel_woche", v)} multiline className="text-xs text-black/70 italic w-full block" />
                : <p className="text-xs text-black/70 italic">{data.ziel_woche}</p>
              }
            </div>
          )}

          {(data.merksatz || editMode) && (
            <div className="mt-3 p-3 rounded-lg border-l-4" style={{ background: "#fff8e1", borderColor: "#f59e0b" }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">Merksatz</p>
              {editMode
                ? <EditableText value={data.merksatz || ""} onChange={v => set("merksatz", v)} multiline className="text-xs text-black/70 italic w-full block" />
                : <p className="text-xs text-black/70 italic">"{data.merksatz}"</p>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CoachingPlan832() {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get("clientId");
  const clientName = params.get("name") || "Kunde";

  const [plan, setPlan] = useState(null);
  const [clientRecord, setClientRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    base44.entities.ClientProfile.list().then(all => {
      const client = all.find(c => c.id === clientId);
      if (client) {
        setClientRecord(client);
        if (client.coaching_plan_json) setPlan(JSON.parse(client.coaching_plan_json));
      }
      setLoading(false);
    });
  }, [clientId]);

  async function handleSave() {
    setSaving(true);
    await base44.entities.ClientProfile.update(clientId, {
      coaching_plan_json: JSON.stringify(plan),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const updateWoche = (phaseIdx, wocheIdx, updated) => {
    setPlan(p => {
      const next = { ...p };
      next.phasen = [...p.phasen];
      next.phasen[phaseIdx] = { ...p.phasen[phaseIdx] };
      next.phasen[phaseIdx].wochen = [...p.phasen[phaseIdx].wochen];
      next.phasen[phaseIdx].wochen[wocheIdx] = updated;
      return next;
    });
  };

  const updatePhaseField = (phaseIdx, key, val) => {
    setPlan(p => {
      const next = { ...p };
      next.phasen = [...p.phasen];
      next.phasen[phaseIdx] = { ...p.phasen[phaseIdx], [key]: val };
      return next;
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#00416A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!plan) return (
    <div className="min-h-screen bg-[#F0EAD6] flex flex-col items-center justify-center gap-3">
      <p className="text-black/40 text-sm">Kein Coaching-Plan gefunden.</p>
      <Link to="/Clients832" className="text-[#00416A] text-sm underline">Zurück zur Übersicht</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0EAD6] pb-16">
      {/* Header */}
      <div className="bg-[#00416A] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link to={`/Clients832`} className="text-white/50 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Coaching Plan</p>
            <p className="font-bold text-base">{clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#00416A] rounded-lg text-xs font-bold hover:bg-white/90 transition disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <Check className="w-3 h-3 text-green-600" /> : <Save className="w-3 h-3" />}
              {saved ? "Gespeichert" : "Speichern"}
            </button>
          )}
          <button
            onClick={() => setEditMode(e => !e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${editMode ? "bg-white/20 text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"}`}
          >
            {editMode ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
            {editMode ? "Abbrechen" : "Bearbeiten"}
          </button>
        </div>
      </div>

      {editMode && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-700">
          ✏️ Bearbeitungsmodus: Klicke auf beliebigen Text um ihn zu ändern. Listen-Einträge können entfernt oder ergänzt werden.
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-8">
        {plan.phasen?.map((phase, phaseIdx) => {
          const colors = PHASE_COLORS[phase.phase] || PHASE_COLORS[1];
          return (
            <div key={phase.phase}>
              {/* Phase Header */}
              <div className="rounded-2xl p-5 mb-4 text-white" style={{ background: colors.bg }}>
                <div className="flex items-center gap-3">
                  <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Phase {phase.phase}</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/50 text-xs">Woche {phase.wochen_range}</span>
                </div>
                {editMode
                  ? <EditableText value={phase.name} onChange={v => updatePhaseField(phaseIdx, "name", v)} className="text-lg font-bold mt-1 block text-white" />
                  : <h2 className="text-lg font-bold mt-1">{phase.name}</h2>
                }
                {editMode
                  ? <EditableText value={phase.ziel || ""} onChange={v => updatePhaseField(phaseIdx, "ziel", v)} multiline className="text-xs mt-1 block text-white/60" />
                  : <p className="text-white/60 text-xs mt-1">{phase.ziel}</p>
                }
              </div>

              {/* Wochen */}
              <div className="space-y-2">
                {phase.wochen?.map((woche, wocheIdx) => (
                  <WocheCard
                    key={woche.woche}
                    woche={woche}
                    phaseColor={colors}
                    editMode={editMode}
                    onUpdate={updated => updateWoche(phaseIdx, wocheIdx, updated)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Module */}
        {plan.module && (
          <div className="bg-white rounded-2xl p-6 border border-black/8">
            <h3 className="font-bold text-[#00416A] mb-4">Modulare Komponenten</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Pflichtmodule", field: "pflicht", color: "#00416A" },
                { label: "Früh aktivieren", field: "frueh_aktivieren", color: "#1a6b3c" },
                { label: "Später aktivieren", field: "spaeter_aktivieren", color: "#7b3fa0" },
                { label: "Nur bei Bedarf", field: "nur_bei_bedarf", color: "#b45309" },
              ].map(({ label, field, color }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color }}>{label}</p>
                  <ul className="space-y-1">
                    {plan.module[field]?.map((item, i) => (
                      <li key={i} className="text-xs text-black/60 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                        {editMode
                          ? <EditableText value={item} onChange={v => {
                              const next = [...plan.module[field]];
                              next[i] = v;
                              setPlan(p => ({ ...p, module: { ...p.module, [field]: next } }));
                            }} className="text-xs text-black/60 flex-1" />
                          : item
                        }
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}