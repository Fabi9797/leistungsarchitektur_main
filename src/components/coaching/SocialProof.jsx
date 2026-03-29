import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Mic } from "lucide-react";
import { base44 } from "@/api/base44Client";

function VoicePlayer({ name, url }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  if (!url) {
    return (
      <div className="mt-4 bg-[#F0EAD6] rounded-xl p-4 flex items-center gap-3 opacity-40">
        <div className="w-10 h-10 rounded-full bg-[#00416A]/20 flex items-center justify-center flex-shrink-0">
          <Mic className="w-4 h-4 text-[#00416A]" />
        </div>
        <div>
          <p className="text-[#00416A] text-xs font-bold">🎙️ Nachricht von {name}</p>
          <p className="text-[#00416A]/50 text-xs mt-0.5">Audio folgt</p>
        </div>
      </div>
    );
  }

  const toggle = () => {
    if (playing) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setPlaying(!playing);
  };

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

export default function SocialProof({ images }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    base44.entities.Testimonial.list("sort_order").then(list => {
      const active = (list || []).filter(t => t.is_active);
      setTestimonials(active);
    }).catch(() => {});
  }, []);

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

  // Fallback to images prop for backwards compat when foto_url not set
  const getImage = (t, index) => t.foto_url || (images && images[index]) || "";

  const getIgUrl = (t) => {
    if (!t.instagram_handle) return null;
    return t.instagram_handle.startsWith("http") ? t.instagram_handle : `https://instagram.com/${t.instagram_handle.replace(/^@/, "")}`;
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
            Athletenstimmen
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-5xl font-bold text-black tracking-tight">
            Ergebnisse meiner Athleten
          </h2>
          <p className="mt-3 text-base sm:text-lg text-black/50 max-w-2xl mx-auto">
            Keine Stockfotos. Keine leeren Versprechen. Reale Menschen, die mit einem klaren System nachhaltig in Form gekommen sind.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
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

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-3"
            style={{ scrollbarWidth: "none" }}
          >
            {testimonials.map((t, i) => {
              const igUrl = getIgUrl(t);
              const img = getImage(t, i);
              return (
                <div
                  key={t.id}
                  className="flex-shrink-0 snap-start"
                  style={{ width: "clamp(300px, 85vw, 440px)" }}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <div
                      className="relative aspect-[4/5] overflow-hidden"
                      style={{ cursor: igUrl ? "pointer" : "default" }}
                      onClick={() => { if (igUrl) window.open(igUrl, "_blank"); }}
                    >
                      {img ? (
                        <img src={img} alt={`Transformation ${t.client_name}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#00416A]/10 flex items-center justify-center">
                          <span className="text-[#00416A]/30 text-6xl font-bold">{t.client_name?.[0]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      {igUrl && (
                        <div className="absolute top-3 right-3 z-10 opacity-90">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-white/70 text-xs font-semibold tracking-wider uppercase">{t.stats}</p>
                        <h3 className="text-white text-xl font-bold mt-1">{t.client_name}</h3>
                        <p className="text-white/80 text-sm font-medium mt-1">{t.tagline}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-black/60 leading-relaxed italic">„{t.zitat}"</p>
                      <VoicePlayer name={t.client_name} url={t.audio_url} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs text-black/30 mt-4 sm:hidden">← Swipen für mehr →</p>
        </div>
      </div>
    </section>
  );
}