import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Pause } from "lucide-react";

export default function AboutSection({ heroImage }) {
  return (
    <section className="py-16 lg:py-32 bg-[#00416A] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-w-xs sm:max-w-sm mx-auto lg:mx-0">
              <img
                src={heroImage}
                alt="Coach"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00416A]/30 to-transparent" />
            </div>
            {/* Experience badge */}
            <div className="absolute right-2 sm:-right-4 lg:right-0 bottom-6 sm:bottom-8 bg-[#F0EAD6] rounded-xl p-4 sm:p-5 shadow-xl">
              <p className="text-2xl sm:text-3xl font-bold text-[#00416A]">6+</p>
              <p className="text-xs text-[#00416A]/60 font-medium mt-1">Jahre Erfahrung</p>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <span className="text-xs font-bold text-white/30 tracking-[0.2em] uppercase">
              Über mich
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
              Warum ich das mache
            </h2>
            <div className="mt-8 space-y-5 text-white/70 text-base leading-relaxed">
              <p>
                Ich habe über sechs Jahre lang ein eigenes Fitnessstudio geführt. In dieser Zeit habe ich Hunderte von Menschen begleitet – und verstanden, woran die meisten wirklich scheitern.
              </p>
              <p>
                Es ist fast nie das Training. Und selten die Ernährung allein. Es ist das Fehlen eines Systems, das alle Faktoren verbindet und auf den individuellen Alltag abgestimmt ist.
              </p>
              <p>
                Genau deshalb habe ich die Leistungsarchitektur entwickelt: Ein Coaching, das nicht mit einem Trainingsplan beginnt, sondern mit einer Analyse. Denn bevor du etwas veränderst, musst du wissen, <strong className="text-white">wo dein Hebel liegt</strong>.
              </p>
              <p>
                Mein Ziel ist nicht, dir kurzfristig Ergebnisse zu liefern. Mein Ziel ist, dir ein System zu geben, das dich dauerhaft in Form hält – auch dann, wenn das Coaching endet.
              </p>
            </div>
            <a
              href="#analyse"
              className="mt-8 group inline-flex items-center gap-3 px-8 py-4 bg-[#F0EAD6] text-[#00416A] text-base font-semibold rounded-xl hover:bg-white transition-all duration-300"
            >
              Analyse starten
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}