import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Pause } from "lucide-react";

// 🎙️ ERSETZE DIESE URL MIT DEINER ECHTEN AUDIO-DATEI
const VOICE_URL = "https://media.base44.com/images/public/69b064c89953b727c5202e21/DEINE_AUDIO_DATEI.mp3";

function VoicePlayer() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 flex items-center gap-4">
      <audio
        ref={audioRef}
        src={VOICE_URL}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        className="w-12 h-12 rounded-full bg-[#F0EAD6] flex items-center justify-center flex-shrink-0 hover:bg-white transition-colors"
      >
        {playing
          ? <Pause className="w-5 h-5 text-[#00416A]" />
          : <Play className="w-5 h-5 text-[#00416A] ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold mb-2">🎙️ Persönliche Nachricht von Fabian</p>
        <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = ratio * duration;
            setProgress(ratio * duration);
          }}
        >
          <div
            className="absolute left-0 top-0 h-full bg-[#F0EAD6] rounded-full transition-all"
            style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-white/40 text-xs">{fmt(progress)}</span>
          <span className="text-white/40 text-xs">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

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
            <VoicePlayer />
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