import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Eye, Trash2, Copy, Link } from "lucide-react";

import { createPageUrl } from "@/utils";

const DEFAULT_SUPPLEMENTS = [
  { gruppe: "Medizin", kategorie: "Körpereigene Hormone", naehrstoff: "Vitamin-D3 (K2)", dosis: "1000 IE", produkt: "", morgens: "4000 IE", mittags: "", abends: "", zur_nacht: "", dosis_tag: "4000 IE", kauflink: "", notiz: "" },
  { gruppe: "Nährstoffe", kategorie: "", naehrstoff: "Magnesium-Bisglycinat", dosis: "300mg", produkt: "Sunday Natural", morgens: "", mittags: "", abends: "", zur_nacht: "ca. 1 Stunde vor schlafen", dosis_tag: "300mg", kauflink: "", notiz: "" },
  { gruppe: "Nährstoffe", kategorie: "", naehrstoff: "Omega 3", dosis: "", produkt: "Norsan", morgens: "", mittags: "", abends: "", zur_nacht: "", dosis_tag: "4 Kapseln oder 6ml Öl", kauflink: "", notiz: "Öl günstiger und besser" },
  { gruppe: "Nährstoffe", kategorie: "", naehrstoff: "Kreatin", dosis: "", produkt: "", morgens: "", mittags: "", abends: "", zur_nacht: "", dosis_tag: "5g (ab Freigabe)", kauflink: "", notiz: "" },
  { gruppe: "Nährstoffe", kategorie: "", naehrstoff: "Protein", dosis: "", produkt: "", morgens: "", mittags: "", abends: "", zur_nacht: "", dosis_tag: "30g", kauflink: "", notiz: "" }
];

export default function SupplementAdmin832() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ client_name: "", version: "1", intro_text: "" });
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const copyClientLink = (id) => {
    const url = `${window.location.origin}/SupplementStrategy832?id=${id}&readonly=true`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SupplementPlan.list("-created_date");
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await base44.entities.SupplementPlan.create({
      ...form,
      supplements_json: JSON.stringify(DEFAULT_SUPPLEMENTS),
    });
    setForm({ client_name: "", version: "1", intro_text: "" });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Löschen?")) return;
    await base44.entities.SupplementPlan.delete(id);
    load();
  };

  const handleDuplicate = async (item) => {
    await base44.entities.SupplementPlan.create({
      client_name: item.client_name + " (Kopie)",
      version: item.version,
      intro_text: item.intro_text || "",
      supplements_json: item.supplements_json || "",
      explanations_json: item.explanations_json || "",
    });
    load();
  };

  return (
    <div className="min-h-screen bg-[#F0EAD6] p-6 lg:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#00416A]">Supplementpläne</h1>
            <p className="text-xs text-black/40 mt-1 uppercase tracking-widest">Intern · Leistungsarchitektur</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition">
            <Plus className="w-4 h-4" /> Neu erstellen
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm mb-8 p-6 space-y-4">
            <h2 className="text-base font-bold text-[#00416A] mb-2">Neuer Supplementplan</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Kundenname</label>
                <input required value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Version</label>
                <input value={form.version} onChange={e => setForm(p => ({ ...p, version: e.target.value }))}
                  className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Einleitungstext (optional)</label>
                <textarea value={form.intro_text} onChange={e => setForm(p => ({ ...p, intro_text: e.target.value }))}
                  rows={3} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 resize-none" />
              </div>
            </div>
            <p className="text-xs text-black/30">Die Supplemente können nach dem Erstellen direkt in der Präsentation bearbeitet werden.</p>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="px-5 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition">Erstellen</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-black/10 rounded-xl text-sm text-black/50 hover:bg-black/5 transition">Abbrechen</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-black/30 text-sm text-center py-10">Laden…</p>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-black/30 text-sm">Noch keine Supplementpläne vorhanden.</div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold text-[#00416A] text-base">{item.client_name}</p>
                  <p className="text-xs text-black/40 mt-0.5">Version {item.version}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={createPageUrl(`SupplementStrategy832?id=${item.id}`)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#00416A] text-white rounded-lg text-sm font-medium hover:bg-[#003356] transition">
                    <Eye className="w-4 h-4" /> Öffnen
                  </a>
                  <button onClick={() => copyClientLink(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition ${copiedId === item.id ? "border-green-400 text-green-600 bg-green-50" : "border-black/10 text-black/50 hover:bg-black/5 hover:text-[#00416A]"}`}
                    title="Kunden-Link kopieren (nur lesen)">
                    <Link className="w-4 h-4" /> {copiedId === item.id ? "Kopiert!" : "Link"}
                  </button>
                  <button onClick={() => handleDuplicate(item)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-black/10 text-black/50 rounded-lg text-sm hover:bg-black/5 hover:text-[#00416A] transition"
                    title="Duplizieren">
                    <Copy className="w-4 h-4" /> Kopie
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-black/20 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}