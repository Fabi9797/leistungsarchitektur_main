import React, { useState, useRef } from "react";
import { Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";

const FONT_SIZES = [24, 32, 40, 48, 56, 64, 72, 96];
const ALIGNMENTS = ["left", "center", "right"];
const WEIGHTS = ["normal", "bold"];

function defaultElement(overrides = {}) {
  return {
    id: Date.now() + Math.random(),
    content: "",
    fontSize: 44,
    fontWeight: "normal",
    textAlign: "center",
    color: "#111111",
    x: 50, // percent
    y: 50, // percent
    ...overrides,
  };
}

// Renders a slide preview (scaled down) and returns PNG export function
export function renderSlideToCanvas(elements, slideNumber) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Slide number
  ctx.fillStyle = "#cccccc";
  ctx.font = "bold 30px Inter, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${slideNumber}`, 80, 80);

  elements.forEach(el => {
    ctx.fillStyle = el.color || "#111111";
    ctx.font = `${el.fontWeight || "normal"} ${el.fontSize || 44}px Inter, Arial, sans-serif`;
    ctx.textAlign = el.textAlign || "center";

    const x = (el.x / 100) * W;
    const y = (el.y / 100) * H;
    const maxWidth = W - 220;

    // Word wrap
    const words = el.content.split(" ");
    const lineHeight = (el.fontSize || 44) * 1.4;
    let lines = [];
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

    // Handle newlines
    const finalLines = [];
    lines.forEach(l => l.split("\n").forEach(ll => finalLines.push(ll)));

    const totalH = finalLines.length * lineHeight;
    let startY = y - totalH / 2;
    finalLines.forEach(line => {
      ctx.fillText(line, x, startY);
      startY += lineHeight;
    });
  });

  return canvas;
}

export function downloadSlideAsPng(elements, slideNumber) {
  const canvas = renderSlideToCanvas(elements, slideNumber);
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slide_${slideNumber}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Preview component with drag support
function SlidePreview({ elements, selectedId, onSelect, onMove }) {
  const SCALE = 0.22;
  const W = 1080 * SCALE;
  const H = 1350 * SCALE;
  const previewRef = React.useRef(null);
  const draggingRef = React.useRef(null);

  const handleMouseDown = (e, elId) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(elId);
    draggingRef.current = elId;

    const onMouseMove = (me) => {
      if (!draggingRef.current || !previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const x = Math.min(95, Math.max(5, ((me.clientX - rect.left) / rect.width) * 100));
      const y = Math.min(95, Math.max(5, ((me.clientY - rect.top) / rect.height) * 100));
      onMove(draggingRef.current, x, y);
    };

    const onMouseUp = () => {
      draggingRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={previewRef}
      className="relative bg-white border-2 border-black/10 rounded-lg overflow-hidden flex-shrink-0"
      style={{ width: W, height: H }}
      onClick={() => onSelect(null)}
    >
      {elements.map(el => {
        const isSelected = el.id === selectedId;
        return (
          <div
            key={el.id}
            onMouseDown={(e) => handleMouseDown(e, el.id)}
            className={`absolute select-none transition-all ${isSelected ? "cursor-grabbing ring-2 ring-blue-400 ring-offset-1" : "cursor-grab hover:ring-1 hover:ring-black/20"}`}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              transform: "translate(-50%, -50%)",
              fontSize: el.fontSize * SCALE,
              fontWeight: el.fontWeight,
              textAlign: el.textAlign,
              color: el.color,
              fontFamily: "Inter, Arial, sans-serif",
              maxWidth: "90%",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.4,
              padding: "2px 4px",
              borderRadius: 3,
              background: isSelected ? "rgba(59,130,246,0.06)" : "transparent",
            }}
          >
            {el.content || <span style={{ opacity: 0.3, fontSize: el.fontSize * SCALE * 0.7 }}>Text...</span>}
          </div>
        );
      })}
    </div>
  );
}

// Controls for a single element
function ElementControls({ el, onChange, onDelete }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-blue-700">Textelement bearbeiten</span>
        <button onClick={onDelete} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Text content */}
      <textarea
        value={el.content}
        onChange={e => onChange({ ...el, content: e.target.value })}
        rows={3}
        autoFocus
        placeholder="Text eingeben..."
        className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none bg-white"
      />

      {/* Style row */}
      <div className="flex flex-wrap gap-2">
        {/* Font size */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-black/40 font-semibold uppercase">Größe</span>
          <select
            value={el.fontSize}
            onChange={e => onChange({ ...el, fontSize: Number(e.target.value) })}
            className="border border-black/10 rounded-lg px-2 py-1 text-xs bg-white"
          >
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
        </div>

        {/* Weight */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-black/40 font-semibold uppercase">Gewicht</span>
          <select
            value={el.fontWeight}
            onChange={e => onChange({ ...el, fontWeight: e.target.value })}
            className="border border-black/10 rounded-lg px-2 py-1 text-xs bg-white"
          >
            {WEIGHTS.map(w => <option key={w} value={w}>{w === "bold" ? "Fett" : "Normal"}</option>)}
          </select>
        </div>

        {/* Alignment */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-black/40 font-semibold uppercase">Ausrichtung</span>
          <select
            value={el.textAlign}
            onChange={e => onChange({ ...el, textAlign: e.target.value })}
            className="border border-black/10 rounded-lg px-2 py-1 text-xs bg-white"
          >
            {ALIGNMENTS.map(a => <option key={a} value={a}>{a === "left" ? "Links" : a === "center" ? "Zentriert" : "Rechts"}</option>)}
          </select>
        </div>

        {/* Color */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-black/40 font-semibold uppercase">Farbe</span>
          <input
            type="color"
            value={el.color}
            onChange={e => onChange({ ...el, color: e.target.value })}
            className="w-10 h-7 rounded border border-black/10 cursor-pointer"
          />
        </div>
      </div>

      {/* Position */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-[10px] text-black/40 font-semibold uppercase">Position X (%)</span>
          <input
            type="range" min={5} max={95} value={el.x}
            onChange={e => onChange({ ...el, x: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
          <span className="text-[10px] text-black/40 text-center">{el.x}%</span>
        </div>
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="text-[10px] text-black/40 font-semibold uppercase">Position Y (%)</span>
          <input
            type="range" min={5} max={95} value={el.y}
            onChange={e => onChange({ ...el, y: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
          <span className="text-[10px] text-black/40 text-center">{el.y}%</span>
        </div>
      </div>
    </div>
  );
}

export default function SlideElementEditor({ slide, slideNumber, onChange }) {
  const [selectedId, setSelectedId] = useState(null);

  // Support old string-based slides
  const elements = Array.isArray(slide?.elements)
    ? slide.elements
    : typeof slide === "string" && slide.trim()
      ? [defaultElement({ content: slide, y: 50 })]
      : [];

  const updateElements = (els) => onChange({ elements: els });

  const addElement = () => {
    const newEl = defaultElement({ y: 30 + elements.length * 15 });
    updateElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateElement = (updated) => {
    updateElements(elements.map(el => el.id === updated.id ? updated : el));
  };

  const deleteElement = (id) => {
    updateElements(elements.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="border border-black/10 rounded-xl p-3 bg-white space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#00416A]/10 text-[#00416A] rounded-md flex items-center justify-center text-xs font-bold">
            {slideNumber}
          </div>
          <span className="text-xs text-black/40">{elements.length} Element{elements.length !== 1 ? "e" : ""}</span>
        </div>
        <button
          type="button"
          onClick={addElement}
          className="flex items-center gap-1 px-2 py-1 border border-[#00416A]/20 text-[#00416A] rounded-lg text-xs hover:bg-[#00416A]/5 transition"
        >
          <Plus className="w-3 h-3" /> Text hinzufügen
        </button>
      </div>

      {/* Preview + element list */}
      <div className="flex gap-3">
        <SlidePreview
          elements={elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={(id, x, y) => {
            updateElements(elements.map(el => el.id === id ? { ...el, x, y } : el));
          }}
        />

        {/* Element list */}
        <div className="flex-1 space-y-1.5 min-w-0">
          {elements.length === 0 && (
            <div className="text-xs text-black/30 text-center py-4">
              → „Text hinzufügen" klicken
            </div>
          )}
          {elements.map((el, i) => (
            <button
              key={el.id}
              type="button"
              onClick={() => setSelectedId(el.id === selectedId ? null : el.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs border transition truncate ${
                el.id === selectedId
                  ? "bg-blue-50 border-blue-300 text-blue-800"
                  : "bg-black/2 border-black/8 text-black/60 hover:border-black/20"
              }`}
            >
              <span className="font-semibold mr-1">{i + 1}.</span>
              {el.content ? el.content.substring(0, 50) + (el.content.length > 50 ? "…" : "") : <span className="italic opacity-50">leer</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Controls for selected element */}
      {selectedEl && (
        <ElementControls
          el={selectedEl}
          onChange={updateElement}
          onDelete={() => deleteElement(selectedEl.id)}
        />
      )}
    </div>
  );
}