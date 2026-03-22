import React from "react";
import { motion } from "framer-motion";
import { Dumbbell, Salad, Pill, BarChart2 } from "lucide-react";
import TempleGraphic from "./TempleGraphic";

const pillars = [
{
  icon: Dumbbell,
  label: "Trainingsplan",
  text: "Individueller Trainingsplan, der auf deinen persönlichen Alltag abgestimmt wird – damit Beruf und Sport in Einklang kommen."
},
{
  icon: Salad,
  label: "Ernährung",
  text: "Optimale Anpassung der Ernährung innerhalb einer Rahmenvorgabe – ganz ohne Verbote und Hungern."
},
{
  icon: Pill,
  label: "Nahrungsergänzung",
  text: "Zielführende und bedarfsorientierte Supplements, um deine Entwicklung bestmöglich zu unterstützen."
},
{
  icon: BarChart2,
  label: "Steuerung",
  text: "Begleitung anhand deiner echten Daten – Anpassungen erfolgen dann, wenn sie sinnvoll sind, nicht nach starrem Takt."
}];


export default function FrameworkSection() {
  return (
    <section id="methode" className="py-16 lg:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-20">
          
          <span className="text-xs font-bold text-[#00416A]/40 tracking-[0.2em] uppercase">
          Methodik
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-5xl font-bold text-black tracking-tight">
            Die Leistungsarchitektur
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-black/50 max-w-2xl mx-auto leading-relaxed">
          Kein Raten. Kein Perfektionismus. Ein auf dich zugeschnittenes System, das Schritt für Schritt aufgebaut wird – und das hält.
          </p>
        </motion.div>

        {/* Architecture Visual */}
        <div className="mb-12 sm:mb-20 px-4 sm:px-0">
          <TempleGraphic />
        </div>

        {/* Pillar Cards */}
        <div className="mb-12 sm:mb-20">
          <div className="flex gap-4 overflow-x-auto px-5 sm:px-0 pb-3 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#F0EAD6]/50 border border-black/8 rounded-2xl p-5 sm:p-6 flex-shrink-0 w-[72vw] sm:w-64 snap-start">
                  
                  <div className="w-10 h-10 bg-[#00416A] rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-[#00416A] tracking-widest uppercase mb-2">{p.label}</p>
                  <p className="text-sm text-black/60 leading-relaxed">{p.text}</p>
                </motion.div>);

            })}
          </div>
        </div>

        {/* Explanation Text */}
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}>
              
              <p className="text-base text-black/60 leading-relaxed">
                Die meisten versuchen beim Abnehmen alles gleichzeitig zu verändern – Training, Ernährung, Schlaf, Stress. Das Ergebnis: kurze Motivation, dann Erschöpfung.
              </p>
              <p className="mt-4 text-base text-black/60 leading-relaxed">
                Wir machen das anders: Wir beginnen mit einer <strong className="text-black">Hebelanalyse</strong> – und setzen dann gezielt dort an, wo die 20 % Veränderung liegen, die 80 % des Ergebnisses bringen. Individuell für dich.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}>
              
              <p className="text-base text-black/60 leading-relaxed">Darauf aufbauend entsteht dein persönliches Konstrukt – ein Baustein nach dem anderen. Nicht alles auf einmal, sondern so, wie es in deinen Alltag passt.

              </p>
              <p className="mt-4 text-base text-black/60 leading-relaxed">
                So entstehen Gewohnheiten, die nicht perfekt sein müssen – sondern die <strong className="text-black">zuverlässig funktionieren</strong> und dich dauerhaft in Form halten.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>);

}