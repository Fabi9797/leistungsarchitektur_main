import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const problems = [
"Du trainierst, aber siehst keine sichtbaren Veränderungen.",
"Deine Ernährung ist mal streng, mal planlos – ein ständiges Hin und Her.",
"Dein Alltag lässt kaum Platz für konsequente Routinen.",
"Du startest motiviert, aber nach ein paar Wochen ist die Luft raus.",
"Du weißt nicht, welcher Faktor bei dir wirklich den Unterschied macht."];


export default function ProblemSection() {
  return (
    <section className="py-16 lg:py-32 bg-[#00416A] relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}>
            
            <span className="text-xs font-bold text-white/30 tracking-[0.2em] uppercase">
              Das Problem
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
              Warum die meisten scheitern:{" "}
              <span className="text-[#F0EAD6]">Aktionismus ohne Hebelwirkung.</span>
            </h2>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/60 leading-relaxed">Du hast keine Zeit für Experimente. Wer versucht, alles gleichzeitig zu ändern, verliert die Kontrolle. Wir finden die Hebel, die bei dir wirklich den Unterschied machen.

            </p>
            <a
              href="#analyse"
              className="mt-8 group inline-flex items-center gap-2 text-[#F0EAD6] font-semibold hover:text-white transition-colors">
              
              Deinen Hebel finden
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Right - Problem List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-4">
            
            {problems.map((p, i) =>
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-4 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              
                <span className="text-xs font-bold text-white/20 mt-0.5">0{i + 1}</span>
                <p className="text-white/80 text-base">{p}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Visual Contrast */}
        <div className="mt-14 sm:mt-20 flex items-center gap-4 sm:gap-8 justify-center">
          <div className="text-center flex-shrink-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-2 sm:mb-3">
              <div className="w-3 h-3 bg-red-400/60 rounded-full" />
            </div>
            <p className="text-[10px] sm:text-xs text-white/30 uppercase tracking-wider font-semibold">Aktionismus</p>
          </div>
          <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-white/10 via-white/30 to-white/10 relative">
            <ArrowRight className="w-4 h-4 text-white/30 absolute right-0 -top-2" />
          </div>
          <div className="text-center flex-shrink-0">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-full border-2 border-[#F0EAD6]/40 flex items-center justify-center mb-2 sm:mb-3">
              <div className="w-3 h-3 bg-[#F0EAD6] rounded-full" />
            </div>
            <p className="text-[10px] sm:text-xs text-[#F0EAD6]/60 uppercase tracking-wider font-semibold">Hebelanalyse</p>
          </div>
        </div>
      </div>
    </section>);

}