import React from "react";

function SliderRow({ label, before, after, beforeKey, afterKey, update }) {
  const delta = after - before;
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white font-medium">{label}</span>
        <span className={`text-sm font-bold px-2 py-0.5 rounded ${
          delta > 0 ? "bg-green-500/20 text-green-400" :
          delta < 0 ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/40"
        }`}>
          {delta > 0 ? `+${delta}` : delta}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-white/40 text-xs mb-2">Vorher</p>
          <div className="flex items-center gap-3">
            <input
              type="range" min="1" max="10" value={before}
              onChange={e => update({ [beforeKey]: parseInt(e.target.value) })}
              className="flex-1 accent-amber-400"
            />
            <span className="text-amber-400 font-bold w-5 text-center">{before}</span>
          </div>
        </div>
        <div>
          <p className="text-white/40 text-xs mb-2">Nachher</p>
          <div className="flex items-center gap-3">
            <input
              type="range" min="1" max="10" value={after}
              onChange={e => update({ [afterKey]: parseInt(e.target.value) })}
              className="flex-1 accent-amber-400"
            />
            <span className="text-amber-400 font-bold w-5 text-center">{after}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-2">{label}</label>
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:border-amber-400/50 outline-none resize-none text-sm"
      />
    </div>
  );
}

export default function Step2Subjektiv({ data, update }) {
  return (
    <div className="space-y-5">
      <SliderRow label="⚡ Energie" before={data.energie_vorher} after={data.energie_nachher}
        beforeKey="energie_vorher" afterKey="energie_nachher" update={update} />
      <SliderRow label="🧠 Stress" before={data.stress_vorher} after={data.stress_nachher}
        beforeKey="stress_vorher" afterKey="stress_nachher" update={update} />
      <SliderRow label="😴 Schlaf" before={data.schlaf_vorher} after={data.schlaf_nachher}
        beforeKey="schlaf_vorher" afterKey="schlaf_nachher" update={update} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Textarea label="Gefühl zu Beginn" value={data.gefuehl_vorher}
          onChange={v => update({ gefuehl_vorher: v })}
          placeholder="Wie hat er sich am Anfang des Monats gefühlt?" />
        <Textarea label="Gefühl am Ende" value={data.gefuehl_nachher}
          onChange={v => update({ gefuehl_nachher: v })}
          placeholder="Wie fühlt er sich jetzt?" />
      </div>

      <Textarea label="🏆 Highlight des Monats" value={data.highlight_des_monats}
        onChange={v => update({ highlight_des_monats: v })}
        placeholder="Ein zentraler Erfolg oder positiver Moment..." />

      <Textarea label="💬 Reflexion des Kunden" value={data.reflexion_kunde}
        onChange={v => update({ reflexion_kunde: v })}
        placeholder="Eigene Einschätzung des Kunden..." />
    </div>
  );
}