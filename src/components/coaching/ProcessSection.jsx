import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Onboarding & Analyse",
    desc: "Tiefgreifendes Verständnis deines Status Quo. Wir analysieren deinen Alltag, dein bisheriges Training, deine Ernährung und identifizieren die Faktoren, die bei dir den größten Hebel haben.",
  },
  {
    num: "02",
    title: "System-Design",
    desc: "Auf Basis der Analyse entsteht dein persönliches Framework – Schritt für Schritt aufgebaut, nicht alles auf einmal. Training, Ernährung und Gewohnheiten werden so gestaltet, dass sie realistisch in deinen Alltag passen. Gut genug, um zu funktionieren. Nicht perfekt, um zu überfordern.",
  },
  {
    num: "03",
    title: "Iterative Steuerung",
    desc: "Wöchentliche Anpassung basierend auf deinen Daten und deiner Entwicklung. Kein starrer Plan – sondern ein lebendes System, das mit dir mitwächst und bei Bedarf nachjustiert wird.",
  },
];

export default function ProcessSection() {
  return (
    <section id="ablauf" className="py-16 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20"
        >
          <span className="text-xs font-bold text-[#00416A]/40 tracking-[0.2em] uppercase">
            Der Ablauf
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-5xl font-bold text-black tracking-tight">
            Der Weg zur Form
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-black/50 max-w-2xl mx-auto">
            Drei Phasen. Ein Ziel. Kein Aktionismus, sondern gezielte Steuerung.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative flex gap-5 sm:gap-8 lg:gap-12 ${i < steps.length - 1 ? "pb-10 sm:pb-16" : ""}`}
            >
              {/* Number & Line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-[#00416A]/5 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#00416A]/20">{step.num}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-gradient-to-b from-[#00416A]/15 to-transparent mt-4" />
                )}
              </div>

              {/* Content */}
              <div className="pt-2 lg:pt-4 pb-4">
                <h3 className="text-xl lg:text-2xl font-bold text-black tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-base text-black/55 leading-relaxed max-w-lg">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}