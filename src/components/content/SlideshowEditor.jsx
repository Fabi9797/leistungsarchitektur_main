import React from "react";
import { Sparkles, Loader2, Plus, Image } from "lucide-react";
import SlideElementEditor, { downloadSlideAsPng } from "./SlideElementEditor";

function normalizeSlide(slide) {
  if (slide && typeof slide === "object" && Array.isArray(slide.elements)) return slide;
  if (typeof slide === "string" && slide.trim()) {
    return {
      elements: [{
        id: Date.now() + Math.random(),
        content: slide,
        fontSize: 44,
        fontWeight: "normal",
        textAlign: "center",
        color: "#111111",
        x: 50,
        y: 50,
      }]
    };
  }
  return { elements: [] };
}

export default function SlideshowEditor({ form, set, generatingSlides, onGenerate }) {
  const rawSlides = form.slideshow_slides || [];
  const slides = rawSlides.map(normalizeSlide);

  const updateSlide = (idx, val) => {
    const updated = [...slides];
    updated[idx] = val;
    set("slideshow_slides", updated);
  };

  const addSlide = () => set("slideshow_slides", [...slides, { elements: [] }]);

  const removeSlide = (idx) => set("slideshow_slides", slides.filter((_, i) => i !== idx));

  const handleExportAll = () => {
    slides.forEach((slide, idx) => {
      if (slide.elements.length > 0) {
        downloadSlideAsPng(slide.elements, idx + 1);
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label-xs">🖼 Slideshow Slides ({slides.length})</label>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generatingSlides || (!form.hook && !form.topic_info)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition disabled:opacity-60"
        >
          {generatingSlides
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generiert...</>
            : <><Sparkles className="w-3.5 h-3.5" /> Mit Claude generieren</>}
        </button>
      </div>

      {slides.length === 0 && !generatingSlides && (
        <div className="text-center py-8 text-black/30 text-sm border-2 border-dashed border-black/10 rounded-xl">
          Hook eingeben → „Mit Claude generieren" klicken
        </div>
      )}

      <div className="space-y-3 mt-1">
        {slides.map((slide, idx) => (
          <div key={idx} className="relative">
            <SlideElementEditor
              slide={slide}
              slideNumber={idx + 1}
              onChange={(val) => updateSlide(idx, val)}
            />
            <div className="flex gap-1 absolute top-3 right-3">
              <button
                type="button"
                onClick={() => downloadSlideAsPng(slide.elements, idx + 1)}
                disabled={slide.elements.length === 0}
                title="Als PNG exportieren"
                className="p-1.5 text-[#00416A]/50 hover:text-[#00416A] hover:bg-[#00416A]/5 rounded-lg transition disabled:opacity-30"
              >
                <Image className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 0 && (
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={addSlide}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-black/10 rounded-lg text-xs text-black/50 hover:border-[#00416A]/40 hover:text-[#00416A] transition"
          >
            <Plus className="w-3.5 h-3.5" /> Slide hinzufügen
          </button>
          <button
            type="button"
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00416A]/10 text-[#00416A] rounded-lg text-xs font-semibold hover:bg-[#00416A]/20 transition"
          >
            <Image className="w-3.5 h-3.5" /> Alle als PNG exportieren
          </button>
        </div>
      )}
    </div>
  );
}