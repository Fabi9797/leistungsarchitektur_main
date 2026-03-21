import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const emptyUebung = { name: "", einheit: "kg", wert_start: "", wert_end: "", satz_reps: "" };

function CompSlider({ label, value, onChange }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-sm">{label}</span>
        <span className="text-amber-400 font-bold">{value}%</span>
      </div>
      <input type="range" min="0" max="100" value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full accent-amber-400" />
    </div>
  );
}

export default function Step4Training({ data, update }) {
  const [uebungen, setUebungen] = useState(() => {
    try { return data.uebungen_json ? JSON.parse(data.uebungen_json) : [{ ...emptyUebung }]; }
    catch { return [{ ...emptyUebung }]; }
  });

  const syncUebungen = (list) => {
    setUebungen(list);
    update({ uebungen_json: JSON.stringify(list) });
  };

  const addUebung = () => {
    if (uebungen.length >= 6) return;
    syncUebungen([...uebungen, { ...emptyUebung }]);
  };

  const removeUebung = (i) => syncUebungen(uebungen.filter((_, idx) => idx !== i));

  const updateUebung = (i, field, val) => {
    const next = uebungen.map((u, idx) => idx === i ? { ...u, [field]: val } : u);
    syncUebungen(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-amber-400 text-xs font-bold uppercase tracking-widest">Hauptübungen</h3>
          {uebungen.length < 6 && (
            <button onClick={addUebung}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
              <Plus className="w-3.5 h-3.5" /> Übung hinzufügen
            </button>
          )}
        </div>

        <div className="space-y-3">
          {uebungen.map((u, i) => {
            const delta = u.wert_end && u.wert_start
              ? (parseFloat(u.wert_end) - parseFloat(u.wert_start)).toFixed(1) : null;
            return (
              <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    <p className="text-white/40 text-xs mb-1">Übung</p>
                    <input value={u.name} onChange={e => updateUebung(i, "name", e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-400/50"
                      placeholder="z.B. Kniebeuge" />
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/40 text-xs mb-1">Start</p>
                    <input type="number" value={u.wert_start} onChange={e => updateUebung(i, "wert_start", e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-400/50"
                      placeholder="0" />
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/40 text-xs mb-1">Ende</p>
                    <input type="number" value={u.wert_end} onChange={e => updateUebung(i, "wert_end", e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-400/50"
                      placeholder="0" />
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/40 text-xs mb-1">Sätze×Wdh</p>
                    <input value={u.satz_reps} onChange={e => updateUebung(i, "satz_reps", e.target.value)}
                      className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-400/50"
                      placeholder="4×5" />
                  </div>
                  <div className="col-span-1 flex flex-col items-center pt-5">
                    {delta !== null && (
                      <span className={`text-xs font-bold ${parseFloat(delta) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {parseFloat(delta) >= 0 ? "+" : ""}{delta}
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 flex items-end pb-2">
                    <button onClick={() => removeUebung(i)} className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CompSlider label="Training Compliance" value={data.training_compliance}
        onChange={v => update({ training_compliance: v })} />

      <div>
        <h3 className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Ernährung</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            ["Kalorien Ø (kcal)", "kalorien_avg"],
            ["Protein Ø (g)", "protein_avg"]
          ].map(([l, k]) => (
            <div key={k} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
              <p className="text-white/50 text-xs mb-2">{l}</p>
              <input type="number" value={data[k]} onChange={e => update({ [k]: e.target.value })}
                className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-400/50"
                placeholder="0" />
            </div>
          ))}
        </div>
        <CompSlider label="Ernährungs-Compliance" value={data.ernaehrung_compliance}
          onChange={v => update({ ernaehrung_compliance: v })} />
        <div className="mt-3">
          <CompSlider label="Supplement-Compliance" value={data.supplement_compliance}
            onChange={v => update({ supplement_compliance: v })} />
        </div>
      </div>
    </div>
  );
}