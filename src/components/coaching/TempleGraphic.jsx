import React from "react";
import { motion } from "framer-motion";
import { Target, Dumbbell, Apple, CalendarCheck, TrendingUp } from "lucide-react";

const pillars = [
  { icon: Dumbbell, label: "Training", num: "01" },
  { icon: Apple, label: "Ernährung", num: "02" },
  { icon: CalendarCheck, label: "Gewohnheiten", num: "03" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const pillarGrow = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: { scaleY: 1, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function TempleGraphic() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="w-full max-w-2xl mx-auto select-none"
    >
      {/* ── DACH / ROOF ── */}
      <motion.div variants={fadeUp} className="relative">
        {/* Pediment triangle */}
        <div className="relative flex flex-col items-center">
          {/* Triangle shape via clip-path */}
          <div
            className="w-full"
            style={{ clipPath: "polygon(8% 100%, 50% 0%, 92% 100%)" }}
          >
            <div className="bg-[#00416A] h-16 sm:h-20" />
          </div>

          {/* Apex icon */}
          <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F0EAD6] rounded-full flex items-center justify-center shadow-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#00416A]" />
            </div>
          </div>
        </div>

        {/* Entablature / Architrav */}
        <div className="bg-[#00416A] rounded-t-sm px-4 sm:px-8 py-4 sm:py-5 text-center -mt-px">
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-white/40 mb-1">
            Das Ergebnis
          </p>
          <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            Dein neues Ich
          </h3>
          <p className="text-white/50 text-xs sm:text-sm mt-1">
            Dauerhafte Form · Nachhaltige Gewohnheiten · Kontrolle
          </p>
        </div>
      </motion.div>

      {/* ── SÄULEN / PILLARS ── */}
      <div className="flex gap-0 bg-[#F0EAD6]/60 border-x border-black/10">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={p.label}
              className={`flex-1 flex flex-col items-center ${i < pillars.length - 1 ? "border-r border-black/10" : ""}`}
            >
              {/* Capital (top of pillar) */}
              <div className="w-full h-3 sm:h-4 bg-[#00416A]/10 border-b border-black/10" />

              {/* Shaft */}
              <motion.div
                variants={pillarGrow}
                style={{ transformOrigin: "top" }}
                className="w-full flex flex-col items-center justify-center gap-2 sm:gap-3 py-6 sm:py-10 px-2 sm:px-4"
              >
                {/* Fluted pillar decoration */}
                <div className="flex gap-px mb-2">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className="w-px sm:w-[2px] h-8 sm:h-12 bg-[#00416A]/15 rounded-full"
                    />
                  ))}
                </div>

                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-md border border-black/5">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00416A]" />
                </div>
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-bold text-[#00416A]/40 tracking-[0.15em] uppercase">
                    {p.num}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-black mt-0.5">{p.label}</p>
                </div>

                {/* Fluting again lower */}
                <div className="flex gap-px mt-2">
                  {[...Array(5)].map((_, j) => (
                    <div
                      key={j}
                      className="w-px sm:w-[2px] h-8 sm:h-12 bg-[#00416A]/15 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>

              {/* Base (bottom of pillar) */}
              <div className="w-full h-3 sm:h-4 bg-[#00416A]/10 border-t border-black/10" />
            </div>
          );
        })}
      </div>

      {/* ── STYLOBATE / STUFEN ── */}
      <motion.div variants={fadeUp}>
        {/* Step 1 */}
        <div className="bg-black/80 h-3 sm:h-4 mx-0" />
        {/* Step 2 wider */}
        <div className="bg-black/90 -mx-2 sm:-mx-4 h-3 sm:h-4" />
        {/* Step 3 widest = Foundation */}
        <div className="bg-black -mx-4 sm:-mx-8 rounded-b-2xl px-6 sm:px-12 py-5 sm:py-8 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#F0EAD6]" />
          </div>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-white/30 mb-1">
            Fundament
          </p>
          <h3 className="text-base sm:text-xl font-bold text-white">
            Hebelanalyse & Steuerung
          </h3>
          <p className="text-white/40 text-xs sm:text-sm mt-1 max-w-xs mx-auto">
            Die Basis, auf der alles aufbaut. Wir identifizieren, was bei dir wirklich zählt.
          </p>

          {/* Three foundation stones */}
          <div className="flex gap-2 sm:gap-3 justify-center mt-4 sm:mt-5">
            {["Analyse", "Daten", "Steuerung"].map((label) => (
              <div
                key={label}
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white/5 border border-white/10 rounded-lg"
              >
                <span className="text-[9px] sm:text-xs text-white/40 font-semibold tracking-wider">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}