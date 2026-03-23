import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { useAnalyse } from "@/lib/AnalyseContext";

export default function FinalCTA({ finalCtaRef }) {
  const { openAnalyse } = useAnalyse();
  return (
    <section id="analyse" ref={finalCtaRef} className="py-16 lg:py-32 bg-[#F0EAD6] relative overflow-hidden">
      {/* Subtle decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-[#00416A]/15" />

      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00416A]/10 rounded-full mb-8">
            <div className="w-2 h-2 bg-[#00416A] rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-[#00416A] tracking-wider uppercase">
              Nächster Schritt
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-black tracking-tight leading-tight">
            Bereit für die letzte Transformation,{" "}
            <span className="text-[#00416A]">die du jemals brauchen wirst?</span>
          </h2>

          <p className="mt-6 text-lg text-black/50 max-w-2xl mx-auto leading-relaxed">
            Keine leeren Versprechen. Kein aggressives Verkaufsgespräch. Nur eine kurze Analyse, um herauszufinden, wo dein größter Hebel liegt – und ob mein System zu dir passt.
          </p>

          <div className="mt-10">
            <button
              onClick={openAnalyse}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#00416A] text-white text-base sm:text-lg font-semibold rounded-xl hover:bg-[#003356] transition-all duration-300 shadow-xl shadow-[#00416A]/20 min-h-[56px]"
            >
              Analyse starten
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-sm text-black/40">
              2 Minuten · Finde heraus, ob mein Coaching für dich passt
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-black/30">
            <Shield className="w-4 h-4" />
            <span className="text-sm">100% diskret & individuell</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}