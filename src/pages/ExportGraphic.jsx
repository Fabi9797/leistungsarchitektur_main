import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Target, Dumbbell, Apple, FlaskConical, TrendingUp } from "lucide-react";

const pillars = [
  { icon: Dumbbell, label: "Training", num: "01" },
  { icon: Apple, label: "Ernährung", num: "02" },
  { icon: FlaskConical, label: "Nahrungsergänzung", num: "03" },
];

function TempleStatic() {
  return (
    <div className="w-full max-w-xl mx-auto select-none overflow-hidden rounded-2xl shadow-xl">
      {/* DACH */}
      <div>
        <div className="w-full bg-[#00416A]" style={{ clipPath: "polygon(10% 100%, 50% 0%, 90% 100%)", height: 56 }} />
        <div className="flex justify-center -mt-5 relative z-10">
          <div className="w-11 h-11 bg-[#F0EAD6] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <TrendingUp className="w-5 h-5 text-[#00416A]" />
          </div>
        </div>
        <div className="bg-[#00416A] px-4 py-4 text-center">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/40">Das Ergebnis</p>
          <h3 className="text-xl font-bold text-white mt-0.5">Dein neues Ich</h3>
          <p className="text-white/50 text-xs mt-0.5">Dauerhafte Form · Nachhaltige Gewohnheiten · Kontrolle</p>
        </div>
      </div>

      {/* SÄULEN */}
      <div className="flex bg-[#F0EAD6]/70 border-x border-black/10">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={p.label} className={`flex-1 flex flex-col items-center ${i < pillars.length - 1 ? "border-r border-black/10" : ""}`}>
              <div className="w-full h-2.5 bg-[#00416A]/12 border-b border-black/10" />
              <div className="w-full flex flex-col items-center justify-center py-8 px-2 gap-2 min-h-[160px]">
                <div className="flex gap-px">
                  {[...Array(4)].map((_, j) => <div key={j} className="w-px h-8 bg-[#00416A]/15 rounded-full" />)}
                </div>
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md border border-black/5">
                  <Icon className="w-5 h-5 text-[#00416A]" />
                </div>
                <div className="text-center px-1">
                  <p className="text-[8px] font-bold text-[#00416A]/35 tracking-[0.15em] uppercase leading-none">{p.num}</p>
                  <p className="text-[11px] font-bold text-black mt-0.5 leading-tight text-center">{p.label}</p>
                </div>
                <div className="flex gap-px">
                  {[...Array(4)].map((_, j) => <div key={j} className="w-px h-8 bg-[#00416A]/15 rounded-full" />)}
                </div>
              </div>
              <div className="w-full h-2.5 bg-[#00416A]/12 border-t border-black/10" />
            </div>
          );
        })}
      </div>

      {/* FUNDAMENT */}
      <div>
        <div className="h-2 bg-black/70" />
        <div className="h-2 bg-black/85" />
        <div className="bg-black px-8 py-7 text-center">
          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Target className="w-5 h-5 text-[#F0EAD6]" />
          </div>
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30">Fundament</p>
          <h3 className="text-lg font-bold text-white mt-0.5">Hebelanalyse & Steuerung</h3>
          <p className="text-white/40 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
            Die Basis, auf der alles aufbaut. Wir identifizieren, was bei dir wirklich zählt.
          </p>
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
            {["Analyse", "Daten", "Steuerung"].map((label) => (
              <div key={label} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md">
                <span className="text-[10px] text-white/40 font-semibold tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExportGraphic() {
  const ref = useRef(null);

  const handleDownload = async () => {
    const canvas = await html2canvas(ref.current, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
    });
    const link = document.createElement("a");
    link.download = "leistungsarchitektur.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-8 p-8">
      <div ref={ref} className="inline-block">
        <TempleStatic />
      </div>
      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-[#00416A] text-white rounded-xl font-semibold hover:bg-[#003356] transition"
      >
        Als PNG herunterladen
      </button>
    </div>
  );
}