import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Wie unterscheidet sich das von einem normalen Trainingsplan?",
    a: "Hier geht es nicht um einen Plan, den du abarbeitest. Wir beginnen mit einer Analyse deiner Hebel – also der Faktoren, die bei dir den größten Einfluss auf Fortschritt haben. Training, Ernährung und Alltag werden dann zu einem System verbunden, das laufend gesteuert und angepasst wird.",
  },
  {
    q: "Ich habe wenig Zeit. Funktioniert das trotzdem?",
    a: "Genau dafür ist das System gemacht. Wir arbeiten nicht mit starren 6-Tage-Plänen, sondern passen alles an deine reale Verfügbarkeit an. Das Ziel ist maximale Wirkung bei minimalem Zeitaufwand.",
  },
  {
    q: "Muss ich komplett auf alles verzichten?",
    a: "Nein. Es geht nicht um Verzicht, sondern um Steuerung. Wir finden die Stellschrauben, an denen kleine Veränderungen große Wirkung haben. Extreme Diäten gehören nicht zu meiner Methode.",
  },
  {
    q: "Was ist die Analyse am Anfang genau?",
    a: "Eine kurze, strukturierte Standortbestimmung. Du beantwortest ein paar Fragen zu deinem Alltag, deinem bisherigen Training und deiner Ernährung. Daraus leiten wir ab, wo der größte Hebel für deine Veränderung liegt.",
  },
  {
    q: "Ist das nur für Anfänger?",
    a: "Nein. Das System ist für alle gedacht, die sichtbar in Form kommen wollen – unabhängig vom Fitnesslevel. Viele meiner Kunden trainieren schon länger, aber ohne messbaren Fortschritt. Genau dort setzt die Hebelanalyse an.",
  },
  {
    q: "Wie lange dauert es, bis man Ergebnisse sieht?",
    a: "Die meisten Kunden spüren innerhalb der ersten 2–3 Wochen deutliche Veränderungen im Alltag. Sichtbare Körperveränderungen zeigen sich typischerweise nach 4–8 Wochen – je nach Ausgangslage und Konsequenz.",
  },
];

function FAQItem({ item, isOpen, onClick }) {
  return (
    <div className="border-b border-black/10 last:border-none">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <h3 className="text-base lg:text-lg font-semibold text-black pr-8 group-hover:text-[#00416A] transition-colors">
          {item.q}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-[#00416A]/40 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-base text-black/55 leading-relaxed max-w-3xl">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-20 lg:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold text-[#00416A]/40 tracking-[0.2em] uppercase">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight">
            Häufige Fragen
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              item={faq}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}