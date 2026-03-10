import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Eye, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { createPageUrl } from "@/utils";
import ClientDocuments from "../components/clients/ClientDocuments";

const FIELDS = [
  { section: "Person", fields: [
    { key: "name", label: "Name", required: true },
    { key: "alter", label: "Alter", type: "number" },
    { key: "groesse", label: "Größe (cm)", type: "number" },
    { key: "gewicht", label: "Gewicht (kg)", type: "number" },
    { key: "koerperfett", label: "Körperfett (%)" },
    { key: "beruf", label: "Beruf / Alltag" },
    { key: "trainingserfahrung", label: "Trainingserfahrung" },
    { key: "coaching_ziel", label: "Ziel des Coachings", multiline: true },
  ]},
  { section: "Training IST", fields: [
    { key: "training_ist_system", label: "Trainingssystem IST" },
    { key: "training_ist_frequenz", label: "Frequenz IST" },
    { key: "training_ist_probleme", label: "Probleme (kommagetrennt)", multiline: true },
  ]},
  { section: "Training SOLL", fields: [
    { key: "training_soll_system", label: "Trainingssystem SOLL" },
    { key: "training_soll_frequenz", label: "Frequenz SOLL" },
    { key: "training_soll_fokus", label: "Fokus (kommagetrennt)" },
  ]},
  { section: "Ernährung IST", fields: [
    { key: "ernaehrung_ist_struktur", label: "Struktur IST" },
    { key: "ernaehrung_ist_probleme", label: "Probleme (kommagetrennt)", multiline: true },
  ]},
  { section: "Ernährungsrahmen", fields: [
    { key: "kalorien_ziel", label: "Kalorienziel (kcal)", type: "number" },
    { key: "protein_ziel", label: "Protein (g)", type: "number" },
    { key: "fett_ziel", label: "Fett (g)", type: "number" },
    { key: "kohlenhydrate_ziel", label: "Kohlenhydrate (g)", type: "number" },
    { key: "mahlzeiten_struktur", label: "Mahlzeitenstruktur" },
  ]},
  { section: "Alltag & Lifestyle", fields: [
    { key: "schlaf", label: "Schlafdauer" },
    { key: "stresslevel", label: "Stresslevel" },
    { key: "schritte", label: "Schritte / Tag" },
    { key: "lifestyle_faktoren", label: "Weitere Faktoren (kommagetrennt)", multiline: true },
  ]},
  { section: "Hebel & Zielbild", fields: [
    { key: "hebel_1", label: "Hebel 1" },
    { key: "hebel_2", label: "Hebel 2" },
    { key: "hebel_3", label: "Hebel 3" },
    { key: "zielbild", label: "Zielbild (kommagetrennt)", multiline: true },
  ]},
];

export default function Clients832() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [openSection, setOpenSection] = useState("Person");

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

  const setVal = (key, val, type) => {
    setForm(p => ({ ...p, [key]: type === "number" ? (parseFloat(val) || "") : val }));
  };

  return (
    <div className="min-h-screen bg-[#F0EAD6] p-6 lg:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#00416A]">Kundenprofile</h1>
            <p className="text-xs text-black/40 mt-1 uppercase tracking-widest">Intern · Leistungsarchitektur</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition"
          >
            <Plus className="w-4 h-4" /> Neuer Kunde
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-black/8">
              <h2 className="text-base font-bold text-[#00416A]">Neues Kundenprofil erstellen</h2>
            </div>
            {FIELDS.map(({ section, fields }) => (
              <div key={section} className="border-b border-black/5 last:border-0">
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === section ? null : section)}
                  className="w-full flex items-center justify-between px-6 py-4 text-sm font-bold text-[#00416A]/70 hover:bg-black/2 transition text-left"
                >
                  {section}
                  {openSection === section ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSection === section && (
                  <div className="grid grid-cols-2 gap-4 px-6 pb-6">
                    {fields.map(({ key, label, type, multiline }) => (
                      <div key={key} className={multiline ? "col-span-2" : ""}>
                        <label className="block text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">{label}</label>
                        {multiline ? (
                          <textarea
                            value={form[key] || ""}
                            onChange={e => setVal(key, e.target.value, type)}
                            rows={2}
                            className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 resize-none"
                          />
                        ) : (
                          <input
                            type={type || "text"}
                            value={form[key] || ""}
                            onChange={e => setVal(key, e.target.value, type)}
                            className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex gap-3 px-6 py-5 bg-black/2">
              <button type="submit" className="px-5 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition">
                Speichern
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-black/10 rounded-xl text-sm text-black/50 hover:bg-white transition">
                Abbrechen
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-black/30 text-sm text-center py-10">Laden...</p>
        ) : clients.length === 0 ? (
          <div className="text-center py-20 text-black/30 text-sm">Noch keine Profile vorhanden.</div>
        ) : (
          <div className="space-y-3">
            {clients.map(c => (
              <div key={c.id} className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold text-[#00416A] text-base">{c.name}</p>
                  <p className="text-xs text-black/40 mt-0.5">
                    {[c.alter && `${c.alter} J.`, c.gewicht && `${c.gewicht} kg`, c.coaching_ziel].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={createPageUrl(`FactSheet832?id=${c.id}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#00416A] text-white rounded-lg text-sm font-medium hover:bg-[#003356] transition"
                  >
                    <Eye className="w-4 h-4" /> Fact Sheet
                  </a>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-black/20 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <ClientDocuments client={c} onUpdate={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}