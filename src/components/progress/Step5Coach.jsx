import React from "react";
import { Star } from "lucide-react";

export default function Step5Coach({ data, update }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-white/60 mb-2">Coach-Kommentar</label>
        <textarea
          value={data.coach_kommentar}
          onChange={e => update({ coach_kommentar: e.target.value })}
          rows={5}
          placeholder="Qualitative Gesamteinschätzung des Monats..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-400/50 outline-none resize-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-2">Fokus nächster Monat</label>
        <textarea
          value={data.fokus_naechster_monat}
          onChange={e => update({ fokus_naechster_monat: e.target.value })}
          rows={4}
          placeholder="2-3 Prioritäten für den nächsten Monat (eine pro Zeile)..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-amber-400/50 outline-none resize-none text-sm"
        />
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5">
        <p className="text-white/60 text-sm mb-4">Gesamtbewertung des Monats (1–10)</p>
        <div className="flex items-center gap-3 mb-4">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <button
              key={n}
              onClick={() => update({ gesamtbewertung: n })}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                n <= data.gesamtbewertung
                  ? "bg-amber-400 text-black"
                  : "bg-white/5 text-white/30 hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-4xl font-bold">{data.gesamtbewertung}</span>
          <span className="text-white/30 text-lg">/ 10</span>
        </div>
      </div>
    </div>
  );
}