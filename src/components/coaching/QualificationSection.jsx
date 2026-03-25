import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const fits = [
  "Du willst sichtbar in Form kommen – ohne dein Leben komplett umzukrempeln.",
  "Du hast wenig Zeit, bist allerdings bereit, diese effizient zu nutzen.",
  "Du suchst ein passendes System, nicht die nächste kurzfristige Diät.",
  "Du bist offen für eine fundierte Analyse und datengestützte Steuerung.",
  "Du willst nachhaltige Ergebnisse erzielen, die auch in 12 Monaten noch Bestand haben.",
];

const noFits = [
  "Du suchst eine Wunderpille oder Abkürzung über Nacht.",
  "Dein Hauptziel ist maximaler Muskelaufbau und Bodybuilding.",
  "Du bist nicht bereit, Gewohnheiten langfristig zu verändern.",
  "Du erwartest Ergebnisse ohne eigene Mitarbeit.",
];

export default function QualificationSection() {
  return (
    <section className="py-16 lg:py-32 bg-[#F0EAD6]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-xs font-bold text-[#00416A]/40 tracking-[0.2em] uppercase">
            Passt es?
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-5xl font-bold text-black tracking-tight">
            Für wen ist das System?
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-8 max-w-5xl mx-auto">
          {/* Fit */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full mb-6">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700 tracking-wider uppercase">Das passt</span>
            </div>
            <div className="space-y-5">
              {fits.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#00416A]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-[#00416A]" />
                  </div>
                  <p className="text-base text-black/70">{f}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* No Fit */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full mb-6">
              <X className="w-4 h-4 text-red-500" />
              <span className="text-xs font-semibold text-red-600 tracking-wider uppercase">Nicht das Richtige</span>
            </div>
            <div className="space-y-5">
              {noFits.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <p className="text-base text-black/70">{f}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}