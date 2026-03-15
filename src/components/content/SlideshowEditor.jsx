import React, { useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Trash2, Plus, Image, GripVertical } from "lucide-react";

// Draws a single slide as PNG (4:5 ratio = 1080x1350) and triggers download
function downloadSlideAsPng(text, slideNumber) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // White background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Slide number (top left, subtle)
  ctx.fillStyle = "#cccccc";
  ctx.font = "bold 36px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${slideNumber}`, 80, 80);

  // Main text – centered, Inter, black
  const padding = 100;
  const maxWidth = W - padding * 2;
  const lines = wrapText(ctx, text, maxWidth, "52px Inter, Arial, sans-serif");
  const lineHeight = 72;
  const totalHeight = lines.length * lineHeight;
  let y = (H - totalHeight) / 2 + 52 / 2;

  ctx.fillStyle = "#111111";
  ctx.font = "52px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  lines.forEach(line => {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  });

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slide_${slideNumber}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function wrapText(ctx, text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export default function SlideshowEditor({ form, set, generatingSlides, onGenerate }) {
  const slides = form.slideshow_slides || [];

  const updateSlide = (idx, val) => {
    const updated = [...slides];
    updated[idx] = val;
    set("slideshow_slides", updated);
  };

  const addSlide = () => set("slideshow_slides", [...slides, ""]);

  const removeSlide = (idx) => set("slideshow_slides", slides.filter((_, i) => i !== idx));

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

      <div className="space-y-2 mt-1">
        {slides.map((slide, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-[#00416A]/10 text-[#00416A] rounded-md flex items-center justify-center text-xs font-bold mt-2">
              {idx + 1}
            </div>
            <textarea
              value={slide}
              onChange={e => updateSlide(idx, e.target.value)}
              rows={3}
              className="flex-1 border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 resize-none"
              placeholder={idx === 0 ? "Hook-Slide – z.B. 'Morgen geht's los!' (durchgestrichen)" : `Slide ${idx + 1} Text...`}
            />
            <div className="flex flex-col gap-1 mt-2">
              <button
                type="button"
                onClick={() => downloadSlideAsPng(slide, idx + 1)}
                disabled={!slide.trim()}
                title="Als PNG exportieren"
                className="p-1.5 text-[#00416A]/50 hover:text-[#00416A] hover:bg-[#00416A]/5 rounded-lg transition disabled:opacity-30"
              >
                <Image className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeSlide(idx)}
                className="p-1.5 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
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
            onClick={() => slides.forEach((slide, idx) => slide.trim() && downloadSlideAsPng(slide, idx + 1))}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00416A]/10 text-[#00416A] rounded-lg text-xs font-semibold hover:bg-[#00416A]/20 transition"
          >
            <Image className="w-3.5 h-3.5" /> Alle als PNG exportieren
          </button>
        </div>
      )}
    </div>
  );
}