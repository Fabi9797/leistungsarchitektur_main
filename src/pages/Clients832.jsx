import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Eye, Trash2 } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Clients832() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ClientProfile.list("-created_date");
    setClients(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await base44.entities.ClientProfile.create(form);
    setForm({});
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Profil wirklich löschen?")) return;
    await base44.entities.ClientProfile.delete(id);
    load();
  };

  const f = (key, label, type = "text") => (
    <div key={key} className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-[#00416A]/70 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={form[key] || ""}
        onChange={e => setForm(p => ({ ...p, [key]: type === "number" ? parseFloat(e.target.value) || "" : e.target.value }))}
        className="border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/30"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0EAD6] p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#00416A]">Kundenprofile</h1>
            <p className="text-sm text-black/40 mt-1">Interne Übersicht · nur für dich</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition"
          >
            <Plus className="w-4 h-4" /> Neuer Kunde
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="text-base font-bold text-[#00416A] mb-5">Neues Kundenprofil</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {f("name", "Name")}
              {f("alter", "Alter", "number")}
              {f("gewicht", "Gewicht (kg)", "number")}
              {f("groesse", "Größe (cm)", "number")}
              {f("ziel", "Hauptziel")}
              {f("hebel_1", "Hebel 1")}
              {f("hebel_2", "Hebel 2")}
              {f("hebel_3", "Hebel 3")}
              {f("training_ist", "Training IST")}
              {f("training_frequenz_ist", "Frequenz IST")}
              {f("training_soll_ok", "SOLL – OK")}
              {f("training_soll_uk", "SOLL – UK")}
              {f("training_soll_gk", "SOLL – GK")}
              {f("training_frequenz_soll", "Frequenz SOLL")}
              {f("ernaehrung_ist", "Ernährung IST")}
              {f("kalorien_ziel", "Kalorienziel (kcal)", "number")}
              {f("protein_ziel", "Protein (g)", "number")}
              {f("kohlenhydrate_ziel", "Kohlenhydrate (g)", "number")}
              {f("fett_ziel", "Fett (g)", "number")}
            </div>
            <div className="mt-4">
              {f("notizen", "Notizen")}
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" className="px-5 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition">
                Speichern
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-black/10 rounded-xl text-sm text-black/60 hover:bg-black/5 transition">
                Abbrechen
              </button>
            </div>
          </form>
        )}

        {/* Client List */}
        {loading ? (
          <p className="text-black/40 text-sm">Laden...</p>
        ) : clients.length === 0 ? (
          <div className="text-center py-20 text-black/30 text-sm">Noch keine Kundenprofile vorhanden.</div>
        ) : (
          <div className="grid gap-4">
            {clients.map(c => (
              <div key={c.id} className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold text-[#00416A] text-lg">{c.name}</p>
                  <p className="text-sm text-black/40 mt-0.5">
                    {c.alter ? `${c.alter} Jahre` : ""}{c.gewicht ? ` · ${c.gewicht} kg` : ""}{c.ziel ? ` · ${c.ziel}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={createPageUrl(`ClientOverview832?id=${c.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#00416A] text-white rounded-lg text-sm font-medium hover:bg-[#003356] transition"
                  >
                    <Eye className="w-4 h-4" /> Ansicht
                  </a>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-black/30 hover:text-red-500 transition">
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