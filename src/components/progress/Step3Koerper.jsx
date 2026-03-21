import React, { useState } from "react";

function DeltaField({ label, startVal, endVal, startKey, endKey, unit, update, lowerIsBetter }) {
  const delta = endVal && startVal ? (parseFloat(endVal) - parseFloat(startVal)).toFixed(1) : null;
  const isPositive = delta > 0;
  const isGood = lowerIsBetter ? !isPositive : isPositive;
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
      <p className="text-white/60 text-xs mb-3">{label}</p>
      <div className="grid grid-cols-3 gap-3 items-end">
        <div>
          <p className="text-white/40 text-xs mb-1">Start</p>
          <input type="number" value={startVal} onChange={e => update({ [startKey]: e.target.value })}
            className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-400/50"
            placeholder="0" />
        </div>
        <div>
          <p className="text-white/40 text-xs mb-1">Ende</p>
          <input type="number" value={endVal} onChange={e => update({ [endKey]: e.target.value })}
            className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-400/50"
            placeholder="0" />
        </div>
        <div className="text-center">
          {delta !== null && (
            <span className={`text-sm font-bold ${isGood ? "text-green-400" : "text-red-400"}`}>
              {delta > 0 ? "+" : ""}{delta} {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-400/50">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function NumField({ label, value, onChange, unit }) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1">{label} {unit && <span className="text-white/30">({unit})</span>}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-amber-400/50"
        placeholder="—" />
    </div>
  );
}

function VerlaufEditor({ label, jsonKey, data, update, unit }) {
  const [punkte, setPunkte] = useState(() => {
    try { return data[jsonKey] ? JSON.parse(data[jsonKey]) : []; } catch { return []; }
  });

  const addPunkt = () => {
    const next = [...punkte, { woche: `W${punkte.length + 1}`, wert: "" }];
    setPunkte(next);
    update({ [jsonKey]: JSON.stringify(next) });
  };

  const updatePunkt = (i, field, val) => {
    const next = punkte.map((p, idx) => idx === i ? { ...p, [field]: val } : p);
    setPunkte(next);
    update({ [jsonKey]: JSON.stringify(next) });
  };

  const removePunkt = (i) => {
    const next = punkte.filter((_, idx) => idx !== i);
    setPunkte(next);
    update({ [jsonKey]: JSON.stringify(next) });
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/60 text-xs">{label} Verlauf {unit && <span className="text-white/30">({unit})</span>}</p>
        <button onClick={addPunkt} className="text-amber-400 text-xs hover:text-amber-300">+ Punkt</button>
      </div>
      {punkte.length === 0 && <p className="text-white/20 text-xs">Noch keine Datenpunkte</p>}
      <div className="space-y-2">
        {punkte.map((p, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={p.woche} onChange={e => updatePunkt(i, "woche", e.target.value)}
              className="w-16 bg-[#0f0f0f] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-amber-400/50"
              placeholder="W1" />
            <input type="number" value={p.wert} onChange={e => updatePunkt(i, "wert", e.target.value)}
              className="flex-1 bg-[#0f0f0f] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-amber-400/50"
              placeholder={unit || "Wert"} />
            <button onClick={() => removePunkt(i)} className="text-white/20 hover:text-red-400 text-xs">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Step3Koerper({ data, update }) {
  const [umfaenge, setUmfaenge] = useState(() => {
    try { return data.umfaenge_json ? JSON.parse(data.umfaenge_json) : {}; } catch { return {}; }
  });

  const updateUmfang = (key, val) => {
    const next = { ...umfaenge, [key]: val };
    setUmfaenge(next);
    update({ umfaenge_json: JSON.stringify(next) });
  };

  const TRENDS = ["Steigend", "Stabil", "Fallend"];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Körpergewicht & KFA</h3>
        <div className="space-y-3">
          <DeltaField label="Gewicht (kg)" startVal={data.gewicht_start} endVal={data.gewicht_end}
            startKey="gewicht_start" endKey="gewicht_end" unit="kg" update={update} lowerIsBetter={true} />
          <DeltaField label="Körperfett (%)" startVal={data.kfa_start} endVal={data.kfa_end}
            startKey="kfa_start" endKey="kfa_end" unit="%" update={update} lowerIsBetter={true} />
        </div>
      </div>

      <div>
        <h3 className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Umfänge (cm)</h3>
        <div className="grid grid-cols-2 gap-3">
          {[["Taille","taille"],["Hüfte","huefte"],["Brust","brust"],["Oberarm","oberarm"]].map(([l,k]) => (
            <div key={k} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
              <p className="text-white/60 text-xs mb-3">{l} (cm)</p>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div>
                  <p className="text-white/40 text-xs mb-1">Start</p>
                  <input type="number" value={umfaenge[`${k}_start`] || ""} onChange={e => updateUmfang(`${k}_start`, e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-2 py-2 text-white text-xs outline-none focus:border-amber-400/50" placeholder="0" />
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Ende</p>
                  <input type="number" value={umfaenge[`${k}_end`] || ""} onChange={e => updateUmfang(`${k}_end`, e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-2 py-2 text-white text-xs outline-none focus:border-amber-400/50" placeholder="0" />
                </div>
                <div className="text-center">
                  {umfaenge[`${k}_start`] && umfaenge[`${k}_end`] && (
                    <span className={`text-xs font-bold ${
                      umfaenge[`${k}_end`] < umfaenge[`${k}_start`] ? "text-green-400" : "text-red-400"
                    }`}>
                      {(parseFloat(umfaenge[`${k}_end`]) - parseFloat(umfaenge[`${k}_start`])).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Vitalwerte</h3>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="HRV Ø" value={data.hrv_avg} onChange={v => update({ hrv_avg: v })} />
          <Select label="HRV Trend" value={data.hrv_trend} onChange={v => update({ hrv_trend: v })} options={TRENDS} />
          <NumField label="Ruhepuls Ø" value={data.ruhepuls_avg} onChange={v => update({ ruhepuls_avg: v })} unit="bpm" />
          <Select label="Ruhepuls Trend" value={data.ruhepuls_trend} onChange={v => update({ ruhepuls_trend: v })} options={TRENDS} />
          <NumField label="Schlafdauer Ø" value={data.schlafdauer_avg} onChange={v => update({ schlafdauer_avg: v })} unit="h" />
        </div>
        <div className="grid grid-cols-1 gap-3 mt-3">
          <VerlaufEditor label="HRV" jsonKey="hrv_verlauf_json" data={data} update={update} />
          <VerlaufEditor label="Ruhepuls" jsonKey="ruhepuls_verlauf_json" data={data} update={update} unit="bpm" />
        </div>
      </div>
    </div>
  );
}