import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TypeBadge } from "./ContentBadge";
import { base44 } from "@/api/base44Client";

const TYPE_PILL_COLORS = {
  "Reden":     "bg-blue-100 text-blue-700",
  "B-Roll":    "bg-orange-100 text-orange-700",
  "Slideshow": "bg-purple-100 text-purple-700",
  "Reel":      "bg-pink-100 text-pink-700",
  "Story":     "bg-yellow-100 text-yellow-700",
  "Carousel":  "bg-indigo-100 text-indigo-700",
};

const STORY_FORMAT_COLORS = {
  "Talk to camera":     "bg-violet-200 text-violet-800",
  "Repost Feed":        "bg-fuchsia-100 text-fuchsia-700",
  "Athleten-Einblick":  "bg-sky-100 text-sky-700",
  "Athletenfeedback":   "bg-teal-100 text-teal-700",
  "Training":           "bg-amber-100 text-amber-700",
  "Essen/Nutrilize":    "bg-lime-100 text-lime-700",
  "Poll/Frage":         "bg-yellow-100 text-yellow-700",
  "Athletenerfolg":     "bg-emerald-100 text-emerald-700",
  "Mythos der Woche":   "bg-red-100 text-red-700",
  "Persönlich/Ausblick":"bg-cyan-100 text-cyan-700",
  "Sonstiges":          "bg-gray-100 text-gray-600",
};

const STATUS_DOT = {
  "Geplant":     "bg-[#00416A]/40",
  "Fertig":      "bg-green-500",
  "Übersprungen":"bg-black/20",
};

const MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const WEEKDAYS = ["Mo","Di","Mi","Do","Fr","Sa","So"];
const WEEKDAYS_LONG = ["Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag","Sonntag"];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return (new Date(year, month, 1).getDay() + 6) % 7; }
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}
function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-${String(weekNo).padStart(2,"0")}`;
}
function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// --- Story loader hook ---
function useStorySlotsForRange(startDate, endDate) {
  const [storySlots, setStorySlots] = useState([]);
  useEffect(() => {
    // Load all non-template story slots and filter by date range
    base44.entities.StorySlot.filter({ is_template: false }).then(all => {
      setStorySlots(all);
    }).catch(() => setStorySlots([]));
  }, [startDate?.toISOString(), endDate?.toISOString()]);
  return storySlots;
}

// Map story slots (with week_key + day_index) to actual dates
function storySlotsToDateMap(slots) {
  const map = {}; // "YYYY-MM-DD" -> [slot, ...]
  slots.forEach(slot => {
    if (!slot.week_key || slot.week_key === "template") return;
    const [y, w] = slot.week_key.split("-").map(Number);
    // Get Monday of that ISO week
    const jan4 = new Date(y, 0, 4);
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7) + (w - 1) * 7);
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + slot.day_index);
    const key = toDateStr(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
    if (!map[key]) map[key] = [];
    map[key].push(slot);
  });
  return map;
}

// --- Sub-components ---
function FeedPill({ p, onSelect, onDragStart, draggable }) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={() => onSelect(p)}
      className={`cursor-pointer rounded-md px-1 py-0.5 text-[9px] font-semibold truncate hover:opacity-80 transition ${TYPE_PILL_COLORS[p.type] || "bg-gray-100 text-gray-600"}`}
      title={p.title}
    >
      {p.title}
    </div>
  );
}

function StoryPill({ slot, compact = true }) {
  const color = STORY_FORMAT_COLORS[slot.format] || "bg-gray-100 text-gray-600";
  return (
    <div className={`rounded-md px-1 py-0.5 text-[9px] font-semibold truncate flex items-center gap-0.5 ${color}`} title={slot.format + (slot.content ? ": " + slot.content : "")}>
      <span className="opacity-60">▸</span>
      <span className="truncate">{compact ? slot.format : (slot.content || slot.format)}</span>
      <span className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[slot.status] || "bg-gray-300"}`} />
    </div>
  );
}

// =====================
// MONTH VIEW
// =====================
function MonthView({ pieces, storyByDate, year, month, onSelect, onDateChange }) {
  const today = new Date();
  const [dragOverDay, setDragOverDay] = useState(null);
  const draggedPieceId = useRef(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const byDate = {};
  pieces.forEach(p => {
    if (p.planned_date) {
      const d = new Date(p.planned_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!byDate[key]) byDate[key] = [];
        byDate[key].push(p);
      }
    }
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const handleDragStart = (e, piece) => {
    draggedPieceId.current = piece.id;
    e.dataTransfer.setData("text/plain", piece.id);
  };
  const handleDrop = (e, day) => {
    e.preventDefault();
    const pieceId = draggedPieceId.current || e.dataTransfer.getData("text/plain");
    if (!pieceId || !day) return;
    draggedPieceId.current = null;
    onDateChange && onDateChange(pieceId, toDateStr(year, month, day));
    setDragOverDay(null);
  };

  return (
    <>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-black/30 uppercase py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          const dateKey = day ? toDateStr(year, month, day) : null;
          const dayStories = dateKey ? (storyByDate[dateKey] || []) : [];
          return (
            <div key={idx}
              className={`min-h-[80px] rounded-xl p-1.5 transition-colors
                ${day ? "bg-white" : ""}
                ${isToday(day) ? "ring-2 ring-[#00416A]/40" : ""}
                ${dragOverDay === day && day ? "bg-[#00416A]/10 ring-2 ring-[#00416A]/30" : ""}
              `}
              onDragOver={(e) => day && (e.preventDefault(), setDragOverDay(day))}
              onDragLeave={() => setDragOverDay(null)}
              onDrop={(e) => day && handleDrop(e, day)}
            >
              {day && (
                <>
                  <div className={`text-xs font-semibold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${isToday(day) ? "bg-[#00416A] text-white" : "text-black/40"}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {(byDate[day] || []).map(p => (
                      <FeedPill key={p.id} p={p} onSelect={onSelect} draggable
                        onDragStart={(e) => handleDragStart(e, p)} />
                    ))}
                    {dayStories.map(s => (
                      <StoryPill key={s.id || s._localId} slot={s} compact />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {pieces.filter(p => !p.planned_date).length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/5">
          <p className="text-[10px] font-bold text-black/30 uppercase mb-2">
            Ohne Datum ({pieces.filter(p => !p.planned_date).length}) — auf einen Tag ziehen
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pieces.filter(p => !p.planned_date).map(p => (
              <div key={p.id} draggable
                onDragStart={(e) => { draggedPieceId.current = p.id; e.dataTransfer.setData("text/plain", p.id); }}
                onClick={() => onSelect(p)}
                className="cursor-grab active:cursor-grabbing flex items-center gap-1 bg-white rounded-lg px-2 py-1 text-xs text-black/50 hover:shadow-sm transition select-none">
                <TypeBadge type={p.type} /> {p.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// =====================
// WEEK VIEW
// =====================
function WeekView({ pieces, storyByDate, monday, onSelect, onDateChange }) {
  const today = new Date();
  const [dragOverDate, setDragOverDate] = useState(null);
  const draggedPieceId = useRef(null);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const piecesByDate = {};
  pieces.forEach(p => {
    if (p.planned_date) {
      const key = p.planned_date.slice(0, 10);
      if (!piecesByDate[key]) piecesByDate[key] = [];
      piecesByDate[key].push(p);
    }
  });

  const handleDrop = (e, dateStr) => {
    e.preventDefault();
    const pieceId = draggedPieceId.current || e.dataTransfer.getData("text/plain");
    if (!pieceId) return;
    draggedPieceId.current = null;
    onDateChange && onDateChange(pieceId, dateStr);
    setDragOverDate(null);
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, idx) => {
        const dateStr = toDateStr(day.getFullYear(), day.getMonth(), day.getDate());
        const dayPieces = piecesByDate[dateStr] || [];
        const dayStories = storyByDate[dateStr] || [];
        const isToday = isSameDay(day, today);
        return (
          <div key={idx}
            className={`rounded-2xl p-2 min-h-[120px] transition border
              ${isToday ? "border-[#00416A]/30 bg-[#00416A]/5" : "border-black/8 bg-white"}
              ${dragOverDate === dateStr ? "ring-2 ring-[#00416A]/30 bg-[#00416A]/10" : ""}
            `}
            onDragOver={(e) => { e.preventDefault(); setDragOverDate(dateStr); }}
            onDragLeave={() => setDragOverDate(null)}
            onDrop={(e) => handleDrop(e, dateStr)}
          >
            <div className="mb-2">
              <p className={`text-[10px] font-bold ${isToday ? "text-[#00416A]" : "text-black/40"}`}>{WEEKDAYS[idx]}</p>
              <p className={`text-base font-bold leading-none ${isToday ? "text-[#00416A]" : "text-black/60"}`}>{day.getDate()}</p>
            </div>
            <div className="space-y-1">
              {dayPieces.length === 0 && dayStories.length === 0 && (
                <p className="text-[9px] text-black/20 text-center py-2">–</p>
              )}
              {dayPieces.map(p => (
                <FeedPill key={p.id} p={p} onSelect={onSelect} draggable
                  onDragStart={(e) => { draggedPieceId.current = p.id; e.dataTransfer.setData("text/plain", p.id); }} />
              ))}
              {dayStories.length > 0 && (
                <div className="pt-0.5 border-t border-black/5 space-y-0.5">
                  {dayStories.map(s => <StoryPill key={s.id} slot={s} compact />)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================
// DAY VIEW
// =====================
function DayView({ pieces, storyByDate, date, onSelect }) {
  const dateStr = toDateStr(date.getFullYear(), date.getMonth(), date.getDate());
  const dayPieces = pieces.filter(p => p.planned_date && p.planned_date.slice(0, 10) === dateStr);
  const dayStories = storyByDate[dateStr] || [];
  const today = new Date();
  const isToday = isSameDay(date, today);

  return (
    <div className="max-w-lg mx-auto">
      <div className={`rounded-2xl p-5 border ${isToday ? "border-[#00416A]/30 bg-[#00416A]/5" : "border-black/8 bg-white"}`}>
        <p className={`text-lg font-bold mb-4 ${isToday ? "text-[#00416A]" : "text-black/70"}`}>
          {WEEKDAYS_LONG[(date.getDay() + 6) % 7]}, {date.getDate()}. {MONTHS[date.getMonth()]} {date.getFullYear()}
          {isToday && <span className="ml-2 text-xs font-semibold text-[#00416A]/50">Heute</span>}
        </p>

        {dayPieces.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-bold text-black/30 uppercase mb-2">Feed-Beiträge</p>
            <div className="space-y-2">
              {dayPieces.map(p => (
                <div key={p.id} onClick={() => onSelect(p)}
                  className={`cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold hover:opacity-80 transition flex items-center gap-2 ${TYPE_PILL_COLORS[p.type] || "bg-gray-100 text-gray-600"}`}>
                  <span className="text-[10px] opacity-60">{p.type}</span>
                  <span className="flex-1 truncate">{p.title}</span>
                  {p.status && <span className="text-[9px] opacity-60 flex-shrink-0">{p.status}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {dayStories.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-black/30 uppercase mb-2">Stories</p>
            <div className="space-y-2">
              {dayStories.map(s => (
                <div key={s.id}
                  className={`rounded-xl px-3 py-2 text-xs flex items-start gap-2 ${STORY_FORMAT_COLORS[s.format] || "bg-gray-100 text-gray-600"}`}>
                  <div className="flex-1">
                    <p className="font-bold text-[10px] mb-0.5">{s.format}</p>
                    {s.content && <p className="opacity-70 leading-relaxed">{s.content}</p>}
                  </div>
                  <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[s.status] || "bg-gray-300"}`} title={s.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {dayPieces.length === 0 && dayStories.length === 0 && (
          <p className="text-sm text-black/30 text-center py-8">Keine Inhalte für diesen Tag</p>
        )}
      </div>
    </div>
  );
}

// =====================
// MAIN COMPONENT
// =====================
export default function ContentCalendarView({ pieces, onSelect, onDateChange }) {
  const today = new Date();
  const [calView, setCalView] = useState("month"); // "month" | "week" | "day"
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(today));
  const [currentDay, setCurrentDay] = useState(today);

  const allStorySlots = useStorySlotsForRange(null, null);
  const storyByDate = storySlotsToDateMap(allStorySlots);

  // Navigation helpers
  const prevPeriod = () => {
    if (calView === "month") {
      if (month === 0) { setMonth(11); setYear(y => y - 1); }
      else setMonth(m => m - 1);
    } else if (calView === "week") {
      const d = new Date(currentMonday); d.setDate(d.getDate() - 7); setCurrentMonday(d);
    } else {
      const d = new Date(currentDay); d.setDate(d.getDate() - 1); setCurrentDay(d);
    }
  };
  const nextPeriod = () => {
    if (calView === "month") {
      if (month === 11) { setMonth(0); setYear(y => y + 1); }
      else setMonth(m => m + 1);
    } else if (calView === "week") {
      const d = new Date(currentMonday); d.setDate(d.getDate() + 7); setCurrentMonday(d);
    } else {
      const d = new Date(currentDay); d.setDate(d.getDate() + 1); setCurrentDay(d);
    }
  };

  const navLabel = () => {
    if (calView === "month") return `${MONTHS[month]} ${year}`;
    if (calView === "week") {
      const end = new Date(currentMonday); end.setDate(end.getDate() + 6);
      return `KW ${getWeekKey(currentMonday).split("-")[1]} · ${currentMonday.getDate()}.${currentMonday.getMonth()+1}. – ${end.getDate()}.${end.getMonth()+1}.`;
    }
    return `${WEEKDAYS_LONG[(currentDay.getDay() + 6) % 7]}, ${currentDay.getDate()}. ${MONTHS[currentDay.getMonth()]}`;
  };

  return (
    <div>
      {/* Nav bar */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <button onClick={prevPeriod} className="p-2 rounded-lg hover:bg-black/5 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 flex-1 justify-center">
          <h3 className="font-bold text-[#00416A] text-sm">{navLabel()}</h3>
        </div>
        <button onClick={nextPeriod} className="p-2 rounded-lg hover:bg-black/5 transition">
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* View toggle */}
        <div className="flex gap-0.5 bg-black/5 rounded-lg p-0.5 ml-2">
          {["month","week","day"].map(v => (
            <button key={v} onClick={() => setCalView(v)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${calView === v ? "bg-white text-[#00416A] shadow-sm" : "text-black/40 hover:text-black/60"}`}>
              {v === "month" ? "Monat" : v === "week" ? "Woche" : "Tag"}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-1.5 mb-3 items-center">
        <span className="text-[9px] text-black/30 font-semibold uppercase">Stories:</span>
        {["Talk to camera","Repost Feed","Training","Essen/Nutrilize"].map(f => (
          <span key={f} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${STORY_FORMAT_COLORS[f]}`}>
            <span className="opacity-60">▸</span>{f}
          </span>
        ))}
        <span className="text-[9px] text-black/20">…</span>
      </div>

      {/* Content */}
      {calView === "month" && (
        <MonthView pieces={pieces} storyByDate={storyByDate} year={year} month={month} onSelect={onSelect} onDateChange={onDateChange} />
      )}
      {calView === "week" && (
        <WeekView pieces={pieces} storyByDate={storyByDate} monday={currentMonday} onSelect={onSelect} onDateChange={onDateChange} />
      )}
      {calView === "day" && (
        <DayView pieces={pieces} storyByDate={storyByDate} date={currentDay} onSelect={onSelect} />
      )}
    </div>
  );
}