import React, { useState } from "react";
import { ChevronDown, Pencil, Check } from "lucide-react";
import { STATUS_CONFIG, STATUS_CYCLE } from "./timelineDefaults";

export default function TaskRow({ task, onChange }) {
  const [showDetail, setShowDetail] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.offen;

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(task.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onChange({ status: next });
  }

  return (
    <div className={`rounded-xl border ${task.status === "problem" ? "border-red-200 bg-red-50/40" : "border-black/5 bg-white"}`}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Status dot / toggle */}
        <button
          onClick={cycleStatus}
          className={`w-4 h-4 rounded-full flex-shrink-0 border-2 transition ${
            task.status === "erledigt" ? "bg-green-500 border-green-500" :
            task.status === "problem"  ? "bg-red-500 border-red-500" :
            task.status === "verschoben" ? "bg-amber-400 border-amber-400" :
            "bg-white border-gray-300"
          }`}
          title="Status wechseln"
        />
        <span className={`flex-1 text-sm ${task.status === "erledigt" ? "line-through text-black/30" : "text-black/70"}`}>
          {task.label}
        </span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
            {cfg.label}
          </span>
          <button
            onClick={() => setShowDetail(d => !d)}
            className="text-black/20 hover:text-[#00416A] transition"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showDetail && (
        <div className="px-3 pb-3 grid grid-cols-2 gap-2 border-t border-black/5 pt-2">
          <div>
            <label className="text-[10px] font-bold text-black/30 uppercase tracking-wider block mb-1">Datum</label>
            <input
              type="date"
              value={task.date || ""}
              onChange={e => onChange({ date: e.target.value })}
              className="w-full text-xs border border-black/10 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-black/30 uppercase tracking-wider block mb-1">Status</label>
            <select
              value={task.status}
              onChange={e => onChange({ status: e.target.value })}
              className="w-full text-xs border border-black/10 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 bg-white"
            >
              <option value="offen">Offen</option>
              <option value="erledigt">Erledigt</option>
              <option value="verschoben">Verschoben</option>
              <option value="problem">Problem / Follow-up</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-black/30 uppercase tracking-wider block mb-1">Notiz</label>
            <input
              type="text"
              value={task.note || ""}
              onChange={e => onChange({ note: e.target.value })}
              placeholder="Kurze Notiz…"
              className="w-full text-xs border border-black/10 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}