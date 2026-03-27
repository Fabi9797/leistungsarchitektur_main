import React from "react";
import { motion } from "framer-motion";
import { Target, Dumbbell, Apple, CalendarCheck, TrendingUp } from "lucide-react";

const pillars = [
  { icon: Dumbbell, label: "Training", num: "01" },
  { icon: Apple, label: "Ernährung", num: "02" },
  { icon: CalendarCheck, label: "Nahrungsergänzung", num: "03" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const pillarGrow = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: { scaleY: 1, opacity: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export default function TempleGraphic() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="w-full max-w-xl mx-auto select-none overflow-hidden rounded-2xl shadow-xl"
    >
      {/* ── PEDIMENT / DACH ── */}
      <motion.div variants={fadeUp}>
        {/* Triangle */}
        <div
          className="w-full bg-[#00416A]"
          style={{ clipPath: "polygon(10% 100%, 50% 0%, 90% 100%)", height: 56 }}
        />
        {/* Apex icon — sits centered above the architrav */}
        <div className="flex justify-center -mt-5 relative z-10">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-[#F0EAD6] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#00416A]" />
          </div>
        </div>

        {/* Architrav */}
        <div className="bg-[#00416A] px-4 py-3 sm:py-4 text-center">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/40">Das Ergebnis</p>
          <h3 className="text-base sm:text-xl font-bold text-white mt-0.5">Dein neues Ich</h3>
          <p className="text-white/50 text-[11px] sm:text-xs mt-0.5">
            Dauerhafte Form · Nachhaltige Gewohnheiten · Kontrolle
          </p>
        </div>
      </motion.div>

      {/* ── SÄULEN / PILLARS ── */}
      <div className="flex bg-[#F0EAD6]/70 border-x border-black/10">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={p.label}
              className={`flex-1 flex flex-col items-center ${i < pillars.length - 1 ? "border-r border-black/10" : ""}`}
            >
              {/* Capital */}
              <div className="w-full h-2.5 bg-[#00416A]/12 border-b border-black/10" />

              {/* Shaft */}
              <motion.div
                variants={pillarGrow}
                style={{ transformOrigin: "top" }}
                className="w-full flex flex-col items-center justify-center py-5 sm:py-8 px-2 gap-2"
              >
                {/* Fluting – hidden on very small screens to save space */}
                <div className="hidden xs:flex gap-px">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="w-px h-5 sm:h-8 bg-[#00416A]/15 rounded-full" />
                  ))}
                </div>

                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-md border border-black/5">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00416A]" />
                </div>

                <div className="text-center">
                  <p className="text-[8px] font-bold text-[#00416A]/35 tracking-[0.15em] uppercase leading-none">
                    {p.num}
                  </p>
                  <p className="text-[11px] sm:text-sm font-bold text-black mt-0.5 leading-tight">{p.label}</p>
                </div>

                <div className="hidden xs:flex gap-px">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="w-px h-5 sm:h-8 bg-[#00416A]/15 rounded-full" />
                  ))}
                </div>
              </motion.div>

              {/* Base */}
              <div className="w-full h-2.5 bg-[#00416A]/12 border-t border-black/10" />
            </div>
          );
        })}
      </div>

      {/* ── STYLOBATE STUFEN ── */}
      <motion.div variants={fadeUp}>
        <div className="h-2 bg-black/70" />
        <div className="h-2 bg-black/85" />

        {/* Foundation */}
        <div className="bg-black px-5 sm:px-8 py-5 sm:py-7 text-center">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#F0EAD6]" />
          </div>
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/30">Fundament</p>
          <h3 className="text-sm sm:text-lg font-bold text-white mt-0.5">Hebelanalyse & Steuerung</h3>
          <p className="text-white/40 text-[11px] sm:text-xs mt-1 max-w-xs mx-auto leading-relaxed">
            Die Basis, auf der alles aufbaut. Wir identifizieren, was bei dir wirklich zählt.
          </p>
          <div className="flex gap-1.5 sm:gap-2 justify-center mt-3 sm:mt-4 flex-wrap">
            {["Analyse", "Daten", "Steuerung"].map((label) => (
              <div key={label} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md">
                <span className="text-[9px] sm:text-[10px] text-white/40 font-semibold tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}