import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Eye, Trash2, ChevronDown, ChevronUp, LayoutDashboard, FileText, Pill, Utensils, Users, UserPlus, Pencil, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import ClientDocuments from "../components/clients/ClientDocuments";
import LeadsSection from "../components/clients/LeadsSection";

const FIELDS = [
  { section: "Stammdaten", fields: [
    { key: "name", label: "Name", required: true },
    { key: "email", label: "E-Mail" },
    { key: "telefon", label: "Telefon / WhatsApp" },
    { key: "geburtstag", label: "Geburtstag", type: "date" },
    { key: "instagram", label: "Instagram" },
  ]},
  { section: "Person", fields: [
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
  const [activeTab, setActiveTab] = useState("clients");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [openSection, setOpenSection] = useState("Stammdaten");
  const [editingClient, setEditingClient] = useState(null);
  const [supplementPlans, setSupplementPlans] = useState([]);
  const [nutritionStrategies, setNutritionStrategies] = useState([]);

  const load = async () => {
    setLoading(true);
    const [data, supps, nutris] = await Promise.all([
      base44.entities.ClientProfile.list("-created_date"),
      base44.entities.SupplementPlan.list("-updated_date"),
      base44.entities.NutritionStrategy.list("-updated_date"),
    ]);
    setClients(data);
    setSupplementPlans(supps);
    setNutritionStrategies(nutris);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (editingClient) {
      await base44.entities.ClientProfile.update(editingClient.id, form);
      setEditingClient(null);
    } else {
      await base44.entities.ClientProfile.create(form);
    }
    setForm({});
    setShowForm(false);
    load();
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setForm({ ...client });
    setOpenSection("Stammdaten");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          {activeTab === "clients" && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition"
            >
              <Plus className="w-4 h-4" /> Neuer Kunde
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-black/5 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "clients" ? "bg-white text-[#00416A] shadow-sm" : "text-black/40 hover:text-black/60"}`}
          >
            <Users className="w-4 h-4" /> Kunden
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "leads" ? "bg-white text-[#00416A] shadow-sm" : "text-black/40 hover:text-black/60"}`}
          >
            <UserPlus className="w-4 h-4" /> Leads
          </button>
        </div>

        {activeTab === "leads" && <LeadsSection />}

        {activeTab === "clients" && showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden">
            <div className="px-6 py-5 border-b border-black/8">
              <h2 className="text-base font-bold text-[#00416A]">{editingClient ? `${editingClient.name} bearbeiten` : "Neues Kundenprofil erstellen"}</h2>
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
              <button type="button" onClick={() => { setShowForm(false); setEditingClient(null); setForm({}); }} className="px-5 py-2 border border-black/10 rounded-xl text-sm text-black/50 hover:bg-white transition">
                Abbrechen
              </button>
            </div>
          </form>
        )}

        {activeTab === "clients" && loading ? (
          <p className="text-black/30 text-sm text-center py-10">Laden...</p>
        ) : activeTab === "clients" && clients.length === 0 ? (
          <div className="text-center py-20 text-black/30 text-sm">Noch keine Profile vorhanden.</div>
        ) : activeTab === "clients" ? (
          <div className="space-y-3">

            {clients.map(c => (
              <div key={c.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#00416A] text-base">{c.name}</p>
                    <p className="text-xs text-black/40 mt-0.5">
                      {[c.alter && `${c.alter} J.`, c.gewicht && `${c.gewicht} kg`, c.coaching_ziel].filter(Boolean).join(" · ")}
                    </p>
                    {(c.email || c.telefon) && (
                      <p className="text-xs text-[#00416A]/50 mt-0.5">
                        {[c.email, c.telefon].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/CoachingDashboard832?clientId=${c.id}&name=${encodeURIComponent(c.name)}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#00416A]/10 text-[#00416A] rounded-lg text-sm font-medium hover:bg-[#00416A]/20 transition"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Control
                    </Link>
                    {c.coaching_plan_json && (
                      <Link
                        to={`/CoachingPlan832?clientId=${c.id}&name=${encodeURIComponent(c.name)}`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition"
                      >
                        <ClipboardList className="w-4 h-4" /> Plan
                      </Link>
                    )}
                    <Link
                      to={`/FactSheet832?id=${c.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#00416A] text-white rounded-lg text-sm font-medium hover:bg-[#003356] transition"
                    >
                      <Eye className="w-4 h-4" /> Fact Sheet
                    </Link>
                    <button onClick={() => handleEdit(c)} className="p-2 text-black/20 hover:text-[#00416A] transition">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-black/20 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Verknüpfte Dokumente */}
                {(() => {
                  const supp = supplementPlans.find(s => s.client_name?.toLowerCase() === c.name?.toLowerCase());
                  const nutri = nutritionStrategies.find(n => n.client_name?.toLowerCase() === c.name?.toLowerCase());
                  if (!supp && !nutri) return null;
                  return (
                    <div className="mt-3 pt-3 border-t border-black/5 flex flex-wrap gap-2">
                      {supp && (
                        <Link to={`/SupplementStrategy832?id=${supp.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-semibold hover:bg-purple-100 transition">
                          <Pill className="w-3 h-3" /> Supplementplan v{supp.version}
                        </Link>
                      )}
                      {nutri && (
                        <Link to={`/NutritionStrategy832?id=${nutri.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs font-semibold hover:bg-green-100 transition">
                          <Utensils className="w-3 h-3" /> Ernährungsstrategie v{nutri.version}
                        </Link>
                      )}
                    </div>
                  );
                })()}

                <ClientDocuments client={c} onUpdate={load} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}