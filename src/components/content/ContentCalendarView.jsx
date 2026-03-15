import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TypeBadge, CategoryBadge } from "./ContentBadge";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
}

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function ContentCalendarView({ pieces, onSelect }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Group pieces by date
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

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-black/5 transition"><ChevronLeft className="w-4 h-4" /></button>
        <h3 className="font-bold text-[#00416A]">{MONTHS[month]} {year}</h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-black/5 transition"><ChevronRight className="w-4 h-4" /></button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-black/30 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => (
          <div key={idx} className={`min-h-[80px] rounded-xl p-1.5 ${day ? "bg-white" : ""} ${isToday(day) ? "ring-2 ring-[#00416A]/40" : ""}`}>
            {day && (
              <>
                <div className={`text-xs font-semibold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${isToday(day) ? "bg-[#00416A] text-white" : "text-black/40"}`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {(byDate[day] || []).map(p => (
                    <div key={p.id} onClick={() => onSelect(p)}
                      className="cursor-pointer rounded-md px-1 py-0.5 text-[9px] font-semibold truncate hover:opacity-80 transition bg-[#00416A]/10 text-[#00416A]">
                      {p.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend for pieces without date */}
      {pieces.filter(p => !p.planned_date).length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/5">
          <p className="text-[10px] font-bold text-black/30 uppercase mb-2">Ohne Datum ({pieces.filter(p => !p.planned_date).length})</p>
          <div className="flex flex-wrap gap-1.5">
            {pieces.filter(p => !p.planned_date).map(p => (
              <div key={p.id} onClick={() => onSelect(p)}
                className="cursor-pointer flex items-center gap-1 bg-white rounded-lg px-2 py-1 text-xs text-black/50 hover:shadow-sm transition">
                <TypeBadge type={p.type} /> {p.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}