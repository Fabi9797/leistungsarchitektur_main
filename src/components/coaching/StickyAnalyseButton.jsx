import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useAnalyse } from "@/lib/AnalyseContext";

// heroButtonRef: ref on the hero CTA button
// finalCtaRef: ref on the final CTA section
export default function StickyAnalyseButton({ heroButtonRef, finalCtaRef }) {
  const { openAnalyse } = useAnalyse();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroButtonRef?.current || !finalCtaRef?.current) return;

      const heroBottom = heroButtonRef.current.getBoundingClientRect().bottom;
      const finalTop = finalCtaRef.current.getBoundingClientRect().top;

      // Show after scrolling past hero button, hide when final CTA is visible
      const pastHero = heroBottom < 0;
      const reachedFinal = finalTop < window.innerHeight * 0.85;

      setVisible(pastHero && !reachedFinal);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroButtonRef, finalCtaRef]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center px-5 pointer-events-none">
      <button
        onClick={openAnalyse}
        className="pointer-events-auto group inline-flex items-center gap-3 px-8 py-4 bg-[#00416A] text-white text-base font-semibold rounded-xl hover:bg-[#003356] transition-all duration-300 shadow-2xl shadow-[#00416A]/30"
      >
        Analyse starten
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}