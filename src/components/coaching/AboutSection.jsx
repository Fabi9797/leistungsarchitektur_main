import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { useAnalyse } from "@/lib/AnalyseContext";
import { base44 } from "@/api/base44Client";

const FALLBACK = {
  headline: "Warum ich das mache",
  text_1: "Ich führe seit über sechs Jahren ein eigenes Fitnessstudio, das FITTER in Bad Harzburg. In dieser Zeit habe ich Hunderte von Menschen begleitet – und verstanden, woran die meisten wirklich scheitern.",
  text_2: "Es ist fast nie das Training und selten die Ernährung allein. Es ist das Fehlen eines Systems, das alle Faktoren verbindet und auf den individuellen Alltag abgestimmt ist.",
  text_3: "Genau deshalb habe ich die Leistungsarchitektur entwickelt: Ein Coaching, das über einen Trainingsplan hinaus geht und die Gesamtheit betrachtet. Denn bevor du etwas veränderst, musst du wissen, wo deine größten Hebel liegen.",
  text_4: "Mein Ziel ist nicht, dir kurzfristig Ergebnisse zu liefern. Mein Ziel ist, dir ein System zu geben, das dich dauerhaft in Form hält – auch dann, wenn das Coaching endet.",
  foto_url: "https://media.base44.com/images/public/69b064c89953b727c5202e21/98cf67c2a_DesignohneTitel12.png",
  voice_url: "",
  voice_label: "Persönliche Nachricht von Fabian",
  years_experience: "+14",
  studio_link_text: "FITTER in Bad Harzburg",
  studio_link_url: "https://fitter.jetzt/badharzburg/",
};

function VoicePlayer({ url, label }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  if (!url) return null;

  const toggle = () => {
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 flex items-center gap-4">
      <audio ref={audioRef} src={url}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)} />
      <button onClick={toggle}
        className="w-12 h-12 rounded-full bg-[#F0EAD6] flex items-center justify-center flex-shrink-0 hover:bg-white transition-colors">
        {playing ? <Pause className="w-5 h-5 text-[#00416A]" /> : <Play className="w-5 h-5 text-[#00416A] ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold mb-2">🎙️ {label}</p>
        <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = ratio * duration;
            setProgress(ratio * duration);
          }}>
          <div className="absolute left-0 top-0 h-full bg-[#F0EAD6] rounded-full transition-all"
            style={{ width: duration ? `${progress / duration * 100}%` : "0%" }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-white/40 text-xs">{fmt(progress)}</span>
          <span className="text-white/40 text-xs">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AboutSection() {
  const [profile, setProfile] = useState(FALLBACK);

  useEffect(() => {
    base44.entities.CoachProfile.list().then(list => {
      if (list && list.length > 0) {
        setProfile({ ...FALLBACK, ...list[0] });
      }
    }).catch(() => {});
  }, []);

  const p = profile;
  const texts = [p.text_1, p.text_2, p.text_3, p.text_4].filter(Boolean);

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
            className="relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-w-xs sm:max-w-sm mx-auto lg:mx-0">
              <img src={p.foto_url} alt="Coach" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00416A]/30 to-transparent" />
            </div>
            <div className="absolute right-2 sm:-right-4 lg:right-0 bottom-6 sm:bottom-8 bg-[#F0EAD6] rounded-xl p-4 sm:p-5 shadow-xl">
              <p className="text-2xl sm:text-3xl font-bold text-[#00416A]">{p.years_experience}</p>
              <p className="text-xs text-[#00416A]/60 font-medium mt-1">Jahre Erfahrung</p>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}>
            <span className="text-xs font-bold text-white/30 tracking-[0.2em] uppercase">Über mich</span>
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
              {p.headline}
            </h2>
            <div className="mt-8 space-y-5 text-white/70 text-base leading-relaxed">
              {texts.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
            <VoicePlayer url={p.voice_url} label={p.voice_label} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}