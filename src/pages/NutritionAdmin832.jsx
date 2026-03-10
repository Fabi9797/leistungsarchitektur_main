import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Eye, Trash2 } from "lucide-react";
import { createPageUrl } from "@/utils";

const DEFAULT = {
  client_name: "",
  version: "1",
  ist_summary: "Hohes Kaloriendefizit, wenig Eiweiß, keine Regelmäßigkeit",
  soll_summary: "Moderates Kaloriendefizit, viel Eiweiß, Mittag und Abend regelmäßig",
  warum_json: JSON.stringify([
    { title: "Moderates, statt hohes Defizit", subtitle: "Body Recomposition", text: "Ein Zustand, in dem der Körper Fett abbaut und gleichzeitig Muskel aufbaut. Im hohen Defizit ist das nicht möglich. Stress und schlechter Regeneration wird damit ebenfalls vorgebeugt." },
    { title: "Viel, statt wenig Eiweiß", subtitle: "", text: "Neben zahlreichen gesundheitlichen Vorteilen sättigt Eiweiß gut und unterstützt, besonders im Defizit, den Muskelerhalt/aufbau." },
    { title: "Regelmäßig, statt Unregelmäßig", subtitle: "", text: "Stabilerer Blutzuckerspiegel, bessere Verdauung, kein Heißhunger am Abend, besserer Schlaf und Planbarkeit." }
  ], null, 2),
  kalorien_ziel: 1900,
  kalorien_defizit: "400–500 kcal Defizit",
  protein_ziel: 155,
  protein_info: "1,7g pro kg Körpergewicht",
  mahlzeiten_json: JSON.stringify([
    { zeit: "bis 9 Uhr", name: "Morgens", kcal: "100–200 kcal", protein: "20–30g E" },
    { zeit: "bis 14 Uhr", name: "Mittags", kcal: "750 kcal", protein: "60–70g E" },
    { zeit: "bis 17 Uhr", name: "Snack", kcal: "350 kcal", protein: "15–20g E" },
    { zeit: "bis 19 Uhr", name: "Abends", kcal: "650 kcal", protein: "40–50g E" }
  ], null, 2),
  morgens_json: JSON.stringify([
    { name: "Eiweißshake", basis: ["30g Eiweißshake"], kcal: "110 kcal", protein: "23g E" },
    { name: "Skyr", basis: ["250g Skyr"], beilagen: ["Honig", "(TK) Beeren"], kcal: "110–160 kcal", protein: "23g E" }
  ], null, 2),
  mittags_json: JSON.stringify([
    { name: "Fleisch mit Gemüse und Brot", basis: ["300–500g div. Fleisch"], beilage1: ["Brechbohnen", "Brokkoli", "Gegrilltes Gemüse (ggf. TK)", "Butter Gemüse"], beilage2: ["Scheibe Brot", "Brötchen"], kcal: "650–750 kcal", protein: "~100g E" },
    { name: "Linsennudeln mit Beilagen", basis: ["100g Rote Linsen Nudeln", "100g Kichererbsen Nudeln", "1 Dose Thunfisch"], beilagen: ["75g Feta Light", "Tomaten", "Avocado", "Artischocken", "10–20ml Olivenöl"], kcal: "650–750 kcal", protein: "~79g E" },
    { name: "Frosta Tüte mit Beilage", basis: ["div. Frosta Tüten mit Fleisch oder Fisch"], beilage1: ["75g Feta Light"], beilage2: ["200g Skyr"], kcal: "650–850 kcal", protein: "~23g E" }
  ], null, 2),
  snack_json: JSON.stringify([
    { name: "Kefir", basis: ["500ml Kefir", "20g Mandeln"], kcal: "350–400 kcal", protein: "~20g E" },
    { name: "Burrata", basis: ["100g Burrata", "40g Schinken"], kcal: "350–400 kcal", protein: "~25–30g E" }
  ], null, 2),
  abend_json: JSON.stringify([
    { name: "Brotzeit", basis: ["2 Scheiben Eiweißbrot", "2 Eier"], beilage1: ["Hüttenkäse (+Honig)", "Hähnchen/Putenbrust", "Lachs", "Hummus"], beilage2: ["Gemüse aller Art"], kcal: "600–700 kcal", protein: "~40–50g E" },
    { name: "Quark-Bowl", basis: ["250g Magerquark", "40g Soja Flocken", "15g Erdnussmus", "20g Honig"], beilagen: ["Beeren", "Schoko Splitter", "Zimt", "Kakao"], kcal: "500–600 kcal", protein: "~45–50g E" }
  ], null, 2)
};

export default function NutritionAdmin832() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(DEFAULT);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.NutritionStrategy.list("-created_date");
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await base44.entities.NutritionStrategy.create(form);
    setForm(DEFAULT);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Löschen?")) return;
    await base44.entities.NutritionStrategy.delete(id);
    load();
  };

  const F = ({ k, label, multi }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider">{label}</label>
      {multi ? (
        <textarea rows={6} value={form[k] || ""} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
          className="border border-black/10 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 resize-none" />
      ) : (
        <input type={typeof DEFAULT[k] === "number" ? "number" : "text"} value={form[k] || ""} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
          className="border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0EAD6] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#00416A]">Ernährungsstrategien</h1>
            <p className="text-xs text-black/40 mt-1 uppercase tracking-widest">Intern · Leistungsarchitektur</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition">
            <Plus className="w-4 h-4" /> Neu erstellen
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm mb-8 p-6 space-y-4">
            <h2 className="text-base font-bold text-[#00416A] mb-2">Neue Ernährungsstrategie</h2>
            <div className="grid grid-cols-2 gap-4">
              <F k="client_name" label="Kundenname" />
              <F k="version" label="Version" />
              <F k="ist_summary" label="IST-Zusammenfassung" />
              <F k="soll_summary" label="SOLL-Zusammenfassung" />
              <F k="kalorien_ziel" label="Kalorienziel" />
              <F k="kalorien_defizit" label="Defizit-Info" />
              <F k="protein_ziel" label="Protein (g)" />
              <F k="protein_info" label="Protein-Info" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <F k="warum_json" label="Warum? (JSON)" multi />
              <F k="mahlzeiten_json" label="Mahlzeitenstruktur (JSON)" multi />
              <F k="morgens_json" label="Morgens Varianten (JSON)" multi />
              <F k="mittags_json" label="Mittags Varianten (JSON)" multi />
              <F k="snack_json" label="Snack Varianten (JSON)" multi />
              <F k="abend_json" label="Abendessen Varianten (JSON)" multi />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="px-5 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition">Speichern</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-black/10 rounded-xl text-sm text-black/50 hover:bg-black/5 transition">Abbrechen</button>
            </div>
          </form>
        )}

        {loading ? <p className="text-black/30 text-sm text-center py-10">Laden…</p> : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold text-[#00416A] text-base">{item.client_name}</p>
                  <p className="text-xs text-black/40 mt-0.5">Version {item.version} · {item.kalorien_ziel ? `${item.kalorien_ziel} kcal` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={createPageUrl(`NutritionStrategy832?id=${item.id}`)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#00416A] text-white rounded-lg text-sm font-medium hover:bg-[#003356] transition">
                    <Eye className="w-4 h-4" /> Präsentation
                  </a>
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