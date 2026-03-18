import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

const VOICE_URLS = {
  Shayan: "https://industrial-maroon-afdxrnj55j.edgeone.app/Shayan.mp3",
  Alex: "",
  Freddy: "",
};

function VoicePlayer({ name }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const url = VOICE_URLS[name];
  if (!url) return null;

  const toggle = () => {
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="mt-4 bg-[#F0EAD6] rounded-xl p-4 flex items-center gap-3">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-[#00416A] flex items-center justify-center flex-shrink-0 hover:bg-[#00416A]/80 transition-colors"
      >
        {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[#00416A] text-xs font-bold mb-1.5">🎙️ Nachricht von {name}</p>
        <div className="relative h-1 bg-[#00416A]/20 rounded-full overflow-hidden cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            audioRef.current.currentTime = ratio * duration;
            setProgress(ratio * duration);
          }}
        >
          <div className="absolute left-0 top-0 h-full bg-[#00416A] rounded-full transition-all"
            style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[#00416A]/40 text-xs">{fmt(progress)}</span>
          <span className="text-[#00416A]/40 text-xs">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

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
    stats: "-11 kg Körperfatt · 14 Wochen",
    quote: "Als Unternehmer habe ich keine Zeit für Experimente. Hier wurde analysiert, was bei mir den größten Hebel hat – und genau das haben wir umgesetzt.",
  },
];

export default function SocialProof({ images }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
    setTimeout(checkScroll, 400);
  };

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

        {/* Carousel */}
        <div className="relative">
          {/* Arrows */}
          <button
            onClick={() => scroll(-1)}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center transition-opacity duration-200 ${canScrollLeft ? "opacity-100" : "opacity-30 pointer-events-none"}`}
          >
            <ChevronLeft className="w-5 h-5 text-[#00416A]" />
          </button>
          <button
            onClick={() => scroll(1)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-30 pointer-events-none"}`}
          >
            <ChevronRight className="w-5 h-5 text-[#00416A]" />
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3"
            style={{ scrollbarWidth: "none" }}
          >
            {transformations.map((t, i) => (
              <div
                key={t.name}
                className="flex-shrink-0 w-[80vw] sm:w-[45vw] lg:w-[30%] snap-start group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={images[i]}
                    alt={`Transformation ${t.name}`}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white/70 text-xs font-semibold tracking-wider uppercase">{t.stats}</p>
                    <h3 className="text-white text-xl font-bold mt-1">{t.name}</h3>
                    <p className="text-white/80 text-sm font-medium mt-1">{t.tagline}</p>
                  </div>
                </div>
                {/* Quote */}
                <div className="p-6">
                  <p className="text-sm text-black/60 leading-relaxed italic">„{t.quote}"</p>
                  <VoicePlayer name={t.name} />
                </div>
              </div>
            ))}
          </div>

          {/* Swipe hint */}
          <p className="text-center text-xs text-black/30 mt-4 sm:hidden">← Swipen für mehr →</p>
        </div>
      </div>
    </section>
  );
}