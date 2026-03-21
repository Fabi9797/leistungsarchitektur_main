import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAnalyse } from "@/lib/AnalyseContext";

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
  const [showModal, setShowModal] = useState(false);
  return (
    <section className="relative min-h-screen flex items-center bg-white overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(#00416A 1px, transparent 1px), linear-gradient(90deg, #00416A 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 pb-14 lg:pt-32 lg:pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Proof Line */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#F0EAD6] rounded-full mb-6 sm:mb-8">
              <div className="w-2 h-2 bg-[#00416A] rounded-full flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-semibold text-[#00416A] tracking-wider uppercase">
                6+ Jahre Erfahrung aus eigenem Fitnessstudio
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black leading-[1.1]">
              Dein Morgen beginnt Heute.{" "}
              <span className="text-[#00416A]">Fit in die Zukunft.</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-black/60 leading-relaxed">
              Wir bringen Training, Ernährung und Alltag in ein funktionierendes System – damit du in Form kommst und es langfristig bleibst.
            </p>

            {/* Video on mobile (below subheadline) */}
            <div className="lg:hidden mt-6 rounded-2xl overflow-hidden shadow-xl" style={{ aspectRatio: "16/9" }}>
              <iframe
                src="https://www.youtube.com/embed/zo_YE1LY460"
                title="Performance Architecture"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>

            {/* Bullet Points */}
            <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
              {bullets.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.15, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#00416A] mt-0.5 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-black/70">{b}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 sm:mt-10">
              <button
                onClick={() => setShowModal(true)}
                className="group w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-3 px-8 py-4 bg-[#00416A] text-white text-base font-semibold rounded-xl hover:bg-[#003356] transition-all duration-300 shadow-lg shadow-[#00416A]/20 min-h-[52px]"
              >
                Analyse starten
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <AnimatePresence>
                {showModal && <AnalyseModal onClose={() => setShowModal(false)} />}
              </AnimatePresence>
              <p className="mt-3 text-sm text-black/40 text-center sm:text-left">
                2 Minuten · Finde heraus, ob mein Coaching für dich passt
              </p>
            </div>

            {/* System Indicators */}
            <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:flex sm:gap-8">
              {systemIndicators.map((s) => (
                <div key={s.num} className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2">
                  <span className="text-xs font-bold text-[#00416A]/30">{s.num}</span>
                  <div>
                    <span className="text-[10px] sm:text-xs font-bold text-[#00416A] tracking-wider block">{s.label}</span>
                    <p className="text-[10px] sm:text-xs text-black/40 mt-0.5 hidden sm:block">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Content: Video (desktop only) */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "16/9" }}>
              <iframe
                src="https://www.youtube.com/embed/zo_YE1LY460"
                title="Performance Architecture"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 0 }}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}