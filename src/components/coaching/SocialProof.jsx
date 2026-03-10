import React from "react";
import { motion } from "framer-motion";

const transformations = [
  {
    name: "Shayan",
    tagline: "Vom Chaos zur Systematik.",
    stats: "-12 kg Körperfett · 16 Wochen",
    quote: "Ich hatte vorher alles Mögliche probiert – ohne Plan und ohne Ergebnis. Mit dem System habe ich zum ersten Mal verstanden, woran es wirklich lag.",
  },
  {
    name: "Alex",
    tagline: "Keine Diät, sondern Steuerung.",
    stats: "-9 kg Körperfett · 12 Wochen",
    quote: "Keine extreme Diät, kein stundenlanges Training. Einfach ein klares System, das in meinen Alltag passt. Das hat den Unterschied gemacht.",
  },
  {
    name: "Freddy",
    tagline: "Endlich ein Plan, der meinen Kalender respektiert.",
    stats: "-11 kg Körperfett · 14 Wochen",
    quote: "Als Unternehmer habe ich keine Zeit für Experimente. Hier wurde analysiert, was bei mir den größten Hebel hat – und genau das haben wir umgesetzt.",
  },
];

export default function SocialProof({ images }) {
  return (
    <section id="ergebnisse" className="py-16 lg:py-32 bg-[#F0EAD6]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-xs font-bold text-[#00416A]/50 tracking-[0.2em] uppercase">
            Echte Ergebnisse
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-5xl font-bold text-black tracking-tight">
            Ergebnisse meiner Kunden
          </h2>
          <p className="mt-3 text-base sm:text-lg text-black/50 max-w-2xl mx-auto">
            Keine Stockfotos. Keine leeren Versprechen. Reale Menschen, die mit einem klaren System nachhaltig in Form gekommen sind.
          </p>
        </motion.div>

        {/* Transformations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
          {transformations.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
            >
              {/* Image */}
              <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden">
                <img
                  src={images[i]}
                  alt={`Transformation ${t.name}`}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                
                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/70 text-xs font-semibold tracking-wider uppercase">{t.stats}</p>
                  <h3 className="text-white text-xl font-bold mt-1">{t.name}</h3>
                  <p className="text-white/80 text-sm font-medium mt-1">{t.tagline}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="p-6">
                <p className="text-sm text-black/60 leading-relaxed italic">
                  „{t.quote}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}