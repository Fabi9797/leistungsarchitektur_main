import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, ChevronDown, MessageSquare, Save, X } from "lucide-react";

const STATUS_COLORS = {
  "Neu": "bg-blue-50 text-blue-700 border-blue-100",
  "Kontaktiert": "bg-yellow-50 text-yellow-700 border-yellow-100",
  "Qualifiziert": "bg-purple-50 text-purple-700 border-purple-100",
  "Angebot": "bg-orange-50 text-orange-700 border-orange-100",
  "Gewonnen": "bg-green-50 text-green-700 border-green-100",
  "Verloren": "bg-red-50 text-red-700 border-red-100",
};

const STATUSES = ["Neu", "Kontaktiert", "Qualifiziert", "Angebot", "Gewonnen", "Verloren"];
const SOURCES = ["Website", "Empfehlung", "Instagram", "Sonstige"];

function LeadRow({ lead, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({ status: lead.status, notizen: lead.notizen || "", ziel: lead.ziel || "" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await base44.entities.Lead.update(lead.id, form);
    onUpdate();
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#00416A]/10 flex items-center justify-center flex-shrink-0">
            <span className="text-[#00416A] font-bold text-sm">{lead.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#00416A] text-sm truncate">{lead.name}</p>
            <p className="text-xs text-black/40 truncate">{[lead.email, lead.phone].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[lead.status] || STATUS_COLORS["Neu"]}`}>
            {lead.status}
          </span>
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-black/30 hover:text-black/60 transition">
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => onDelete(lead.id)} className="p-1.5 text-black/20 hover:text-red-500 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-black/5 pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Ziel</label>
              <input
                value={form.ziel}
                onChange={e => setForm(f => ({ ...f, ziel: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
                placeholder="z.B. Abnehmen"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Notizen</label>
            <textarea
              value={form.notizen}
              onChange={e => setForm(f => ({ ...f, notizen: e.target.value }))}
              rows={3}
              className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 resize-none"
              placeholder="Interne Notizen..."
            />
          </div>
          {lead.analyse_answers && (() => {
            try {
              const a = JSON.parse(lead.analyse_answers);
              return (
                <div className="bg-[#00416A]/4 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-[#00416A]/50 uppercase tracking-wider mb-2">Analyse-Antworten</p>
                  {Object.entries(a).map(([k, v]) => v && (
                    <p key={k} className="text-xs text-black/60 mb-1"><span className="font-semibold">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : v}</p>
                  ))}
                </div>
              );
            } catch { return null; }
          })()}
          <div className="flex justify-end">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00416A] text-white rounded-lg text-xs font-semibold hover:bg-[#003356] disabled:opacity-50 transition">
              <Save className="w-3.5 h-3.5" /> {saving ? "Speichern…" : "Speichern"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadsSection() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", status: "Neu", source: "Website" });

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Lead.list("-created_date");
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await base44.entities.Lead.create(form);
    setForm({ name: "", email: "", phone: "", status: "Neu", source: "Website" });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Lead wirklich löschen?")) return;
    await base44.entities.Lead.delete(id);
    load();
  };

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.status === s).length }), {});

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#00416A]">Leads</h2>
          <p className="text-xs text-black/40 mt-0.5">{leads.length} gesamt</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition"
        >
          <Plus className="w-4 h-4" /> Lead hinzufügen
        </button>
      </div>

      {/* Status-Übersicht */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
        {STATUSES.map(s => (
          <div key={s} className={`rounded-xl border px-3 py-2 text-center ${STATUS_COLORS[s]}`}>
            <p className="text-lg font-bold">{counts[s] || 0}</p>
            <p className="text-[10px] font-semibold opacity-70">{s}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm mb-5 p-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-[#00416A]">Neuer Lead</h3>
            <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-black/30" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">E-Mail</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Telefon</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Quelle</label>
              <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20">
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition">Erstellen</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-black/10 rounded-xl text-sm text-black/40 hover:bg-black/5 transition">Abbrechen</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-black/30 text-sm text-center py-8">Laden...</p>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 text-black/30 text-sm">Noch keine Leads vorhanden.</div>
      ) : (
        <div className="space-y-2">
          {leads.map(lead => (
            <LeadRow key={lead.id} lead={lead} onUpdate={load} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}