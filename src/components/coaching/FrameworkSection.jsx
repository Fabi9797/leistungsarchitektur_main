import React from "react";
import { motion } from "framer-motion";
import { Target, Dumbbell, Apple, CalendarCheck, TrendingUp } from "lucide-react";

const pillars = [
  { icon: Dumbbell, label: "Training" },
  { icon: Apple, label: "Ernährung" },
  { icon: CalendarCheck, label: "Gewohnheiten" },
];

export default function FrameworkSection() {
  return (
    <section id="methode" className="py-20 lg:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-xs font-bold text-[#00416A]/40 tracking-[0.2em] uppercase">
            Die Methode
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight">
            Die Leistungsarchitektur
          </h2>
          <p className="mt-6 text-lg text-black/50 max-w-2xl mx-auto leading-relaxed">
            Kein Raten. Kein Ausprobieren. Ein System, das auf Analyse und Steuerung basiert – nicht auf Motivation.
          </p>
        </motion.div>

        {/* Architecture Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto mb-20"
        >
          <div className="relative">
            {/* Roof / Dach */}
            <div className="relative bg-[#00416A] text-white rounded-t-2xl p-8 text-center">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-12 h-12 bg-[#00416A] rounded-full flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mt-4">Dach</p>
              <h3 className="text-xl lg:text-2xl font-bold mt-2">Dein neues Ich</h3>
              <p className="text-white/60 text-sm mt-2">Dauerhafte Form. Nachhaltige Gewohnheiten. Kontrolle.</p>
            </div>

            {/* Pillars / Säulen */}
            <div className="grid grid-cols-3 gap-0 border-l border-r border-black/10">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.label}
                    className={`p-8 text-center bg-[#F0EAD6]/50 ${
                      i < 2 ? "border-r border-black/10" : ""
                    }`}
                  >
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                      <Icon className="w-5 h-5 text-[#00416A]" />
                    </div>
                    <p className="mt-4 text-xs font-bold tracking-[0.15em] uppercase text-[#00416A]/60">
                      Säule 0{i + 1}
                    </p>
                    <p className="mt-1 font-semibold text-black">{p.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Foundation / Fundament */}
            <div className="bg-black text-white rounded-b-2xl p-8 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto">
                <Target className="w-5 h-5 text-[#F0EAD6]" />
              </div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mt-4">Fundament</p>
              <h3 className="text-xl lg:text-2xl font-bold mt-2">Hebelanalyse & Steuerung</h3>
              <p className="text-white/50 text-sm mt-2">
                Die Basis, auf der alles aufbaut. Wir identifizieren, was bei dir wirklich zählt.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Explanation Text */}
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-base text-black/60 leading-relaxed">
                Die meisten versuchen beim Abnehmen alles gleichzeitig zu verändern – Training, Ernährung und Motivation. Das führt selten zu nachhaltigem Fortschritt.
              </p>
              <p className="mt-4 text-base text-black/60 leading-relaxed">
                In meiner Methode beginnen wir deshalb mit einer <strong className="text-black">Hebelanalyse</strong>: Wir identifizieren zuerst die Faktoren, die bei dir wirklich über Fortschritt oder Stillstand entscheiden.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <p className="text-base text-black/60 leading-relaxed">
                Darauf aufbauend bringen wir Training, Ernährung und Alltag in ein <strong className="text-black">funktionierendes System</strong> und steuern dieses laufend anhand deiner Entwicklung.
              </p>
              <p className="mt-4 text-base text-black/60 leading-relaxed">
                So entstehen Gewohnheiten, die dich nicht nur wieder in Form bringen, sondern dich dort auch <strong className="text-black">dauerhaft halten</strong>.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}