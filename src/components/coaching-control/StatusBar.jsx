import React from "react";
import { AlertTriangle, CheckCircle2, Circle, Zap } from "lucide-react";

export default function StatusBar({ weeks, currentWeek }) {
  const allTasks = weeks.flatMap(w => w.groups.flatMap(g => g.tasks));
  const total = allTasks.length;
  const done = allTasks.filter(t => t.status === "erledigt").length;
  const open = allTasks.filter(t => t.status === "offen").length;
  const problems = allTasks.filter(t => t.status === "problem").length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Warning logic
  const warnings = [];
  for (let w = 1; w <= currentWeek; w++) {
    const wk = weeks.find(x => x.week === w);
    if (!wk) continue;
    const tasks = wk.groups.flatMap(g => g.tasks);
    const kalorien = tasks.filter(t => t.label.toLowerCase().includes("kalorienziel") && t.status === "problem");
    const trainings = tasks.filter(t => t.label.toLowerCase().includes("trainings") && t.status === "problem");
    if (kalorien.length > 0) warnings.push(`Kalorien W${w}`);
    if (trainings.length > 0) warnings.push(`Training W${w}`);
  }

  // Find next open task
  const currentWeekData = weeks.find(w => w.week === currentWeek);
  const nextTask = currentWeekData?.groups.flatMap(g => g.tasks).find(t => t.status === "offen");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-0.5">Coaching-Fortschritt</p>
          <p className="text-2xl font-black text-[#00416A]">Woche {currentWeek} <span className="text-base font-medium text-black/30">/ 16</span></p>
        </div>
        <div className="flex gap-5">
          <div className="text-center">
            <p className="text-xl font-black text-green-600">{done}</p>
            <p className="text-[10px] text-black/30 uppercase tracking-wider">Erledigt</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-black/40">{open}</p>
            <p className="text-[10px] text-black/30 uppercase tracking-wider">Offen</p>
          </div>
          {problems > 0 && (
            <div className="text-center">
              <p className="text-xl font-black text-red-600">{problems}</p>
              <p className="text-[10px] text-black/30 uppercase tracking-wider">Probleme</p>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-black/8 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#00416A] to-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-black/30 mb-3">{pct}% des Programms abgeschlossen</p>

      {/* Next action */}
      {nextTask && (
        <div className="flex items-center gap-2 bg-[#00416A]/5 rounded-xl px-4 py-2.5">
          <Zap className="w-4 h-4 text-[#00416A] flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider">Nächste Aktion</p>
            <p className="text-sm font-semibold text-[#00416A]">{nextTask.label}</p>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700">Intervention sinnvoll</p>
            <p className="text-xs text-red-600">{warnings.join(" · ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}