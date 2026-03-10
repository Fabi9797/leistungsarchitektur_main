import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const bullets = [
  "Verstehe, welche Faktoren bei dir wirklich über Abnehmen oder Stillstand entscheiden.",
  "Lerne, wie du Training, Ernährung und Alltag effizient kombinierst – auch mit wenig Zeit.",
  "Etabliere Gewohnheiten, die dafür sorgen, dass du dauerhaft in Form bleibst.",
];

const systemIndicators = [
  { num: "01", label: "ANALYSE", desc: "Identifikation der Hebel" },
  { num: "02", label: "SYSTEM", desc: "Integration in den Alltag" },
  { num: "03", label: "STEUERUNG", desc: "Datengestützte Anpassung" },
];

export default function HeroSection({ heroImage }) {
  return (
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(#00416A 1px, transparent 1px), linear-gradient(90deg, #00416A 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16 lg:pt-32 lg:pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Proof Line */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F0EAD6] rounded-full mb-8">
              <div className="w-2 h-2 bg-[#00416A] rounded-full" />
              <span className="text-xs font-semibold text-[#00416A] tracking-wider uppercase">
                6+ Jahre Erfahrung aus eigenem Fitnessstudio
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black leading-[1.08]">
              Dein Morgen beginnt Heute.{" "}
              <span className="text-[#00416A]">Fit in die Zukunft.</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg lg:text-xl text-black/60 leading-relaxed max-w-xl">
              Wir bringen Training, Ernährung und Alltag in ein funktionierendes System – damit du in Form kommst und es langfristig bleibst.
            </p>

            {/* Bullet Points */}
            <div className="mt-8 space-y-4">
              {bullets.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#00416A] mt-0.5 flex-shrink-0" />
                  <span className="text-base text-black/70">{b}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10">
              <a
                href="#analyse"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#00416A] text-white text-base font-semibold rounded-xl hover:bg-[#003356] transition-all duration-300 shadow-lg shadow-[#00416A]/20"
              >
                Analyse starten
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <p className="mt-3 text-sm text-black/40">
                2 Minuten · Finde heraus, ob mein Coaching für dich passt
              </p>
            </div>

            {/* System Indicators */}
            <div className="mt-12 flex gap-6 lg:gap-8">
              {systemIndicators.map((s) => (
                <div key={s.num} className="flex items-start gap-2">
                  <span className="text-xs font-bold text-[#00416A]/30">{s.num}</span>
                  <div>
                    <span className="text-xs font-bold text-[#00416A] tracking-wider">{s.label}</span>
                    <p className="text-xs text-black/40 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-w-md ml-auto">
              <img
                src={heroImage}
                alt="Premium Fitness Coaching"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#00416A]/20 to-transparent" />
            </div>
            {/* Floating stat card */}
            <div className="absolute -left-6 bottom-24 bg-white rounded-xl shadow-2xl p-5 border border-black/5">
              <p className="text-xs font-semibold text-black/40 uppercase tracking-wider">Ø Ergebnis</p>
              <p className="text-2xl font-bold text-[#00416A] mt-1">-8.4 kg</p>
              <p className="text-xs text-black/40 mt-1">Körperfett in 12 Wochen</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}