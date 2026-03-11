import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Clock, SkipForward } from "lucide-react";
import { STATUS_CONFIG, STATUS_CYCLE } from "./timelineDefaults";
import TaskRow from "./TaskRow";

const PHASE_COLORS = {
  "Vorbereitung":          "border-[#00416A] bg-[#00416A]/5",
  "Phase 1 – Fundament":   "border-blue-400 bg-blue-50/50",
  "Phase 2 – Aufbau":      "border-indigo-400 bg-indigo-50/50",
  "Phase 3 – Optimierung": "border-purple-400 bg-purple-50/50",
  "Phase 4 – Konsolidierung": "border-emerald-400 bg-emerald-50/50",
};

function getWeekStats(week) {
  const tasks = week.groups.flatMap(g => g.tasks);
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "erledigt").length;
  const problems = tasks.filter(t => t.status === "problem").length;
  const skipped = tasks.filter(t => t.status === "verschoben").length;
  return { total, done, problems, skipped };
}

export default function WeekCard({ weekData, isActive, onChange }) {
  const [open, setOpen] = useState(isActive);
  const [editNote, setEditNote] = useState(false);
  const stats = getWeekStats(weekData);
  const hasProblems = stats.problems > 0;
  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const phaseColor = PHASE_COLORS[weekData.phase] || "border-gray-200 bg-gray-50";

  function updateTask(groupIdx, taskIdx, patch) {
    const newGroups = weekData.groups.map((g, gi) =>
      gi !== groupIdx ? g : {
        ...g,
        tasks: g.tasks.map((t, ti) => ti !== taskIdx ? t : { ...t, ...patch })
      }
    );
    onChange({ ...weekData, groups: newGroups });
  }

  function updateNote(val) {
    onChange({ ...weekData, note: val });
  }

  return (
    <div className={`rounded-2xl border-l-4 ${phaseColor} shadow-sm bg-white overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/2 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isActive ? "bg-[#00416A] text-white" : "bg-black/8 text-black/50"}`}>
            {weekData.week}
          </div>
          <div>
            <p className="font-bold text-[#00416A] text-sm">
              {weekData.week === 0 ? "Woche 0 – Vorbereitung" : `Woche ${weekData.week}`}
              {isActive && <span className="ml-2 text-[10px] font-semibold bg-[#00416A] text-white rounded-full px-2 py-0.5">Aktiv</span>}
            </p>
            <p className="text-[10px] text-black/40 uppercase tracking-wider">{weekData.phase}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasProblems && (
            <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" /> {stats.problems} Problem{stats.problems > 1 ? "e" : ""}
            </div>
          )}
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="w-24 h-1.5 bg-black/8 rounded-full overflow-hidden">
              <div className="h-full bg-[#00416A] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-black/40 font-semibold w-8 text-right">{pct}%</span>
          </div>
          <span className="text-[10px] text-black/30">{stats.done}/{stats.total}</span>
          {open ? <ChevronUp className="w-4 h-4 text-black/30" /> : <ChevronDown className="w-4 h-4 text-black/30" />}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-black/5">
          {weekData.groups.map((group, gi) => (
            <div key={gi} className="mt-4">
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">{group.name}</p>
              <div className="space-y-1">
                {group.tasks.map((task, ti) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onChange={patch => updateTask(gi, ti, patch)}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Wochennotiz */}
          <div className="mt-4 pt-4 border-t border-black/5">
            <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-2">Wochennotiz</p>
            {editNote ? (
              <textarea
                autoFocus
                className="w-full border border-[#00416A]/20 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
                rows={3}
                value={weekData.note}
                onChange={e => updateNote(e.target.value)}
                onBlur={() => setEditNote(false)}
                placeholder="Erkenntnisse, Anpassungen, besondere Ereignisse…"
              />
            ) : (
              <div
                onClick={() => setEditNote(true)}
                className="min-h-[48px] rounded-xl px-3 py-2 text-sm text-black/50 bg-black/3 cursor-text hover:bg-[#00416A]/5 transition"
              >
                {weekData.note || <span className="italic opacity-50">Klicken zum Notiz schreiben…</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}