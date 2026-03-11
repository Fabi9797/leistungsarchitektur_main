import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Calendar, Save, Loader2 } from "lucide-react";
import { generateDefaultWeeks } from "../components/coaching-control/timelineDefaults";
import WeekCard from "../components/coaching-control/WeekCard";
import StatusBar from "../components/coaching-control/StatusBar";

export default function CoachingDashboard832() {
  const params = new URLSearchParams(window.location.search);
  const clientId = params.get("clientId");
  const clientName = params.get("name") || "Kunde";

  const [timeline, setTimeline] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    load();
  }, [clientId]);

  async function load() {
    setLoading(true);
    const all = await base44.entities.CoachingTimeline.filter({ client_id: clientId });
    if (all.length > 0) {
      const t = all[0];
      setTimeline(t);
      setCurrentWeek(t.current_week || 0);
      setStartDate(t.coaching_start_date || "");
      setWeeks(t.weeks_json ? JSON.parse(t.weeks_json) : generateDefaultWeeks());
    } else {
      setWeeks(generateDefaultWeeks());
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      client_id: clientId,
      client_name: clientName,
      current_week: currentWeek,
      coaching_start_date: startDate,
      weeks_json: JSON.stringify(weeks),
    };
    if (timeline) {
      await base44.entities.CoachingTimeline.update(timeline.id, data);
    } else {
      const created = await base44.entities.CoachingTimeline.create(data);
      setTimeline(created);
    }
    setSaving(false);
  }

  function updateWeek(weekIdx, updated) {
    setWeeks(ws => ws.map((w, i) => i === weekIdx ? updated : w));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#00416A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EAD6] pb-16">
      {/* Top Bar */}
      <div className="bg-[#00416A] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <a href={createPageUrl("Clients832")} className="text-white/50 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/40">Coaching Control</p>
            <p className="font-bold text-base">{clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-white/40 uppercase tracking-wider hidden sm:block">Aktive Woche</label>
            <select
              value={currentWeek}
              onChange={e => setCurrentWeek(Number(e.target.value))}
              className="bg-white/10 text-white text-sm border border-white/20 rounded-lg px-2 py-1.5 focus:outline-none"
            >
              {Array.from({ length: 17 }, (_, i) => (
                <option key={i} value={i} className="text-black">Woche {i}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/40" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-white/10 text-white text-sm border border-white/20 rounded-lg px-2 py-1.5 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 bg-white text-[#00416A] rounded-lg text-sm font-bold hover:bg-white/90 transition disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Speichern
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <StatusBar weeks={weeks} currentWeek={currentWeek} />

        <div className="space-y-3">
          {weeks.map((w, idx) => (
            <WeekCard
              key={w.week}
              weekData={w}
              isActive={w.week === currentWeek}
              onChange={updated => updateWeek(idx, updated)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}