import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Check, X, BookmarkPlus, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const DAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const FORMATS = [
  "Talk to camera", "Repost Feed", "Athleten-Einblick", "Athletenfeedback",
  "Training", "Essen/Nutrilize", "Poll/Frage", "Athletenerfolg",
  "Mythos der Woche", "Persönlich/Ausblick", "Sonstiges"
];

const FORMAT_COLORS = {
  "Talk to camera": "bg-violet-100 text-violet-700",
  "Repost Feed": "bg-pink-100 text-pink-700",
  "Athleten-Einblick": "bg-blue-100 text-blue-700",
  "Athletenfeedback": "bg-green-100 text-green-700",
  "Training": "bg-orange-100 text-orange-700",
  "Essen/Nutrilize": "bg-lime-100 text-lime-700",
  "Poll/Frage": "bg-yellow-100 text-yellow-700",
  "Athletenerfolg": "bg-emerald-100 text-emerald-700",
  "Mythos der Woche": "bg-red-100 text-red-700",
  "Persönlich/Ausblick": "bg-cyan-100 text-cyan-700",
  "Sonstiges": "bg-gray-100 text-gray-600",
};

const STATUS_STYLES = {
  "Geplant": "border-black/10 bg-white",
  "Fertig": "border-green-300 bg-green-50",
  "Übersprungen": "border-black/10 bg-black/5 opacity-60",
};

const DEFAULT_PLAN = [
  [
    { format: "Talk to camera", content: "Guten Start — kurzer persönlicher Gedanke zur Woche" },
    { format: "Repost Feed", content: "Feedbeitrag reposten mit kurzem Kommentar" },
  ],
  [
    { format: "Athleten-Einblick", content: "Foto/Screenshot vom Call, Trainingsplanerstellung oder Ernährungsstrategie — So arbeite ich gerade" },
  ],
  [
    { format: "Athletenfeedback", content: "Voice- oder Textnachricht eines Athleten — authentisch, unbearbeitet" },
    { format: "Repost Feed", content: "Feedbeitrag reposten" },
  ],
  [
    { format: "Training", content: "Eigenes Training — Joggen, Intervalle oder Kraft. Kurzer Clip + 1 Learnable Gedanke" },
  ],
  [
    { format: "Essen/Nutrilize", content: "Mahlzeit mit Tracking-Screenshot — echter Alltag, kein perfekter Meal-Prep-Content" },
    { format: "Poll/Frage", content: "Was ist dein größter Struggle gerade?" },
  ],
  [
    { format: "Athletenerfolg", content: "Gewicht, HRV, Ruhepuls oder Körperfoto mit kurzem Kontext" },
    { format: "Repost Feed", content: "Feedbeitrag reposten" },
  ],
  [
    { format: "Persönlich/Ausblick", content: "Kurzer Blick auf die Woche — was war gut, was kommt" },
  ],
];

function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-${String(weekNo).padStart(2, "0")}`;
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function formatDate(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.`;
}

export default function StoryWeekPlanner() {
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
  const [slots, setSlots] = useState([]); // [{dayIndex, slotIndex, format, content, status, id}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const weekKey = getWeekKey(currentMonday);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.StorySlot.filter({ week_key: weekKey });
    if (data.length > 0) {
      setSlots(data);
    } else {
      // Seed default plan
      const defaultSlots = DEFAULT_PLAN.flatMap((daySlots, dayIndex) =>
        daySlots.map((s, slotIndex) => ({
          week_key: weekKey,
          day_index: dayIndex,
          slot_index: slotIndex,
          format: s.format,
          content: s.content,
          status: "Geplant",
          is_template: false,
          _local: true,
          _localId: `${dayIndex}-${slotIndex}-${Date.now()}`,
        }))
      );
      setSlots(defaultSlots);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [weekKey]);

  const prevWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() - 7);
    setCurrentMonday(d);
  };

  const nextWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 7);
    setCurrentMonday(d);
  };

  const getSlotsForDay = (dayIndex) =>
    slots.filter(s => s.day_index === dayIndex).sort((a, b) => a.slot_index - b.slot_index);

  const updateSlot = (slot, changes) => {
    setSlots(prev => prev.map(s => {
      const match = s.id ? s.id === slot.id : s._localId === slot._localId;
      return match ? { ...s, ...changes } : s;
    }));
  };

  const addSlot = (dayIndex) => {
    const existing = getSlotsForDay(dayIndex);
    const newSlot = {
      week_key: weekKey,
      day_index: dayIndex,
      slot_index: existing.length,
      format: "Talk to camera",
      content: "",
      status: "Geplant",
      is_template: false,
      _local: true,
      _localId: `new-${dayIndex}-${Date.now()}`,
    };
    setSlots(prev => [...prev, newSlot]);
  };

  const removeSlot = (slot) => {
    setSlots(prev => prev.filter(s => {
      const match = s.id ? s.id === slot.id : s._localId === slot._localId;
      return !match;
    }));
  };

  const save = async () => {
    setSaving(true);
    // Delete existing saved slots for this week
    const existing = await base44.entities.StorySlot.filter({ week_key: weekKey, is_template: false });
    await Promise.all(existing.map(s => base44.entities.StorySlot.delete(s.id)));
    // Save all current slots
    await Promise.all(slots.map(s => {
      const { _local, _localId, id, ...data } = s;
      return base44.entities.StorySlot.create({ ...data, week_key: weekKey, is_template: false });
    }));
    await load();
    setSaving(false);
    showToast("Gespeichert ✓");
    window.dispatchEvent(new Event("storySlotsSaved"));
  };

  const saveAsTemplate = async () => {
    setSaving(true);
    // Remove old template
    const existing = await base44.entities.StorySlot.filter({ is_template: true });
    await Promise.all(existing.map(s => base44.entities.StorySlot.delete(s.id)));
    // Save current as template (week_key = "template")
    await Promise.all(slots.map(s => {
      const { _local, _localId, id, ...data } = s;
      return base44.entities.StorySlot.create({ ...data, week_key: "template", is_template: true });
    }));
    setSaving(false);
    showToast("Als Vorlage gespeichert ✓");
  };

  const loadTemplate = async () => {
    const templateSlots = await base44.entities.StorySlot.filter({ is_template: true });
    if (templateSlots.length === 0) {
      showToast("Keine Vorlage gefunden");
      return;
    }
    setSlots(templateSlots.map((s, i) => ({
      ...s,
      week_key: weekKey,
      is_template: false,
      _local: true,
      _localId: `tpl-${i}-${Date.now()}`,
      id: undefined,
    })));
    showToast("Vorlage geladen");
  };

  const cycleStatus = (slot) => {
    const order = ["Geplant", "Fertig", "Übersprungen"];
    const next = order[(order.indexOf(slot.status) + 1) % order.length];
    updateSlot(slot, { status: next });
  };

  if (loading) return <p className="text-center py-10 text-black/30 text-sm">Laden...</p>;

  const mondayDate = currentMonday;
  const isCurrentWeek = getWeekKey(new Date()) === weekKey;

  return (
    <div>
      {/* Week Nav */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-black/5 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="font-bold text-[#00416A] text-sm">
              KW {weekKey.split("-")[1]} · {formatDate(mondayDate)} – {(() => { const d = new Date(mondayDate); d.setDate(d.getDate() + 6); return formatDate(d); })()}
            </p>
            {isCurrentWeek && <p className="text-[10px] text-[#00416A]/50 font-semibold uppercase">Diese Woche</p>}
          </div>
          <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-black/5 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-black/10 text-black/60 hover:bg-black/5 transition">
            <FolderOpen className="w-3.5 h-3.5" /> Vorlage laden
          </button>
          <button onClick={saveAsTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-black/10 text-black/60 hover:bg-black/5 transition">
            <BookmarkPlus className="w-3.5 h-3.5" /> Als Vorlage speichern
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#00416A] text-white hover:bg-[#003356] transition disabled:opacity-50">
            {saving ? "Speichern..." : "Speichern"}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(FORMAT_COLORS).slice(0, 6).map(([format, cls]) => (
          <span key={format} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{format}</span>
        ))}
        <span className="text-[9px] text-black/30 self-center">+ mehr</span>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {DAYS.map((dayName, dayIndex) => {
          const dayDate = new Date(mondayDate);
          dayDate.setDate(dayDate.getDate() + dayIndex);
          const isToday = formatDate(dayDate) === formatDate(new Date()) &&
            dayDate.getMonth() === new Date().getMonth() &&
            dayDate.getFullYear() === new Date().getFullYear();
          const daySlots = getSlotsForDay(dayIndex);

          return (
            <div key={dayIndex}
              className={`rounded-2xl p-3 border transition ${isToday ? "border-[#00416A]/30 bg-[#00416A]/5" : "border-black/8 bg-white"}`}>
              {/* Day header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className={`text-xs font-bold ${isToday ? "text-[#00416A]" : "text-black/60"}`}>{DAYS_SHORT[dayIndex]}</p>
                  <p className="text-[10px] text-black/30">{formatDate(dayDate)}</p>
                </div>
                <button onClick={() => addSlot(dayIndex)}
                  className="p-1 rounded-lg hover:bg-black/5 transition text-black/30 hover:text-[#00416A]">
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Slots */}
              <div className="space-y-2">
                {daySlots.map((slot) => (
                  <StorySlotCard
                    key={slot.id || slot._localId}
                    slot={slot}
                    onUpdate={(changes) => updateSlot(slot, changes)}
                    onRemove={() => removeSlot(slot)}
                    onCycleStatus={() => cycleStatus(slot)}
                  />
                ))}
                {daySlots.length === 0 && (
                  <p className="text-[10px] text-black/20 text-center py-3">Leer</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#00416A] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function StorySlotCard({ slot, onUpdate, onRemove, onCycleStatus }) {
  const statusIcon = {
    "Geplant": null,
    "Fertig": <Check className="w-3 h-3 text-green-600" />,
    "Übersprungen": <X className="w-3 h-3 text-black/30" />,
  };

  return (
    <div className={`rounded-xl border p-2 transition ${STATUS_STYLES[slot.status] || "bg-white border-black/10"}`}>
      {/* Format row */}
      <div className="flex items-center gap-1 mb-1.5">
        <select
          value={slot.format}
          onChange={(e) => onUpdate({ format: e.target.value })}
          className="flex-1 text-[9px] font-bold bg-transparent border-none outline-none cursor-pointer text-[#00416A] truncate"
        >
          {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <button onClick={onCycleStatus} className="p-0.5 rounded hover:bg-black/5 transition" title={slot.status}>
          {statusIcon[slot.status] || <div className="w-3 h-3 rounded-full border-2 border-black/20" />}
        </button>
        <button onClick={onRemove} className="p-0.5 rounded hover:bg-red-50 text-black/20 hover:text-red-400 transition">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      {/* Format badge */}
      <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full mb-1 ${FORMAT_COLORS[slot.format] || "bg-gray-100 text-gray-600"}`}>
        {slot.format}
      </span>
      {/* Content */}
      <textarea
        value={slot.content || ""}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Inhalt beschreiben..."
        rows={2}
        className="w-full text-[10px] text-black/70 bg-transparent resize-none outline-none placeholder:text-black/20 leading-relaxed"
      />
      {/* Status pill */}
      <div className="flex justify-end">
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full cursor-pointer select-none
          ${slot.status === "Fertig" ? "bg-green-100 text-green-700" : slot.status === "Übersprungen" ? "bg-black/10 text-black/40" : "bg-[#00416A]/10 text-[#00416A]"}`}
          onClick={onCycleStatus}
        >
          {slot.status}
        </span>
      </div>
    </div>
  );
}