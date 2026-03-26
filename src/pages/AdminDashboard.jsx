import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Users, CalendarDays, Megaphone, CreditCard, Pill, Utensils,
  TrendingUp, Mic, Phone, LayoutDashboard, ChevronRight,
  CheckCircle2, Clock, AlertCircle, Calendar, FileText
} from "lucide-react";

// ── Tool-Kacheln ──────────────────────────────────────────────────────────────

const TOOLS = [
  { label: "Clients", icon: Users, path: "/Clients832", color: "bg-[#00416A]", desc: "Kundenverwaltung & Profile" },
  { label: "Content Planer", icon: CalendarDays, path: "/ContentPlanning832", color: "bg-violet-600", desc: "Instagram Content & Stories" },
  { label: "Ad Studio", icon: Megaphone, path: "/AdStudio832", color: "bg-orange-500", desc: "Ad-Skripte generieren" },
  { label: "Testimonial Cards", icon: CreditCard, path: "/TestimonialCards832", color: "bg-teal-600", desc: "Social-Proof Karten" },
  { label: "Supplements", icon: Pill, path: "/SupplementAdmin832", color: "bg-emerald-600", desc: "Supplement-Pläne" },
  { label: "Ernährung", icon: Utensils, path: "/NutritionAdmin832", color: "bg-amber-500", desc: "Ernährungsstrategien" },
  { label: "Monatsreport", icon: TrendingUp, path: "/progress", color: "bg-blue-600", desc: "Progress Berichte" },
  { label: "Testimonial Audios", icon: Mic, path: "/TestimonialAdmin832", color: "bg-pink-600", desc: "Audio-Testimonials" },
  { label: "Progress Report", icon: TrendingUp, path: "/progress-report", color: "bg-cyan-600", desc: "Fortschritts-Reports" },
  { label: "Sales Cockpit", icon: Phone, path: "/sales-cockpit", color: "bg-rose-600", desc: "Sales Calls & Leads" },
  { label: "Kundenprofil", icon: FileText, path: "/ClientOverview832", color: "bg-slate-600", desc: "Profil-Übersicht drucken" },
];

// ── Timeline helpers ──────────────────────────────────────────────────────────

function getWeekMonday(startDate, weekNumber) {
  if (!startDate) return null;
  const d = new Date(startDate);
  d.setDate(d.getDate() + weekNumber * 7);
  // Align to Monday
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatDate(d) {
  if (!d) return "";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function isThisWeek(date) {
  if (!date) return false;
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return date >= monday && date <= sunday;
}

function isPast(date) {
  return date && date < new Date(new Date().setHours(0, 0, 0, 0));
}

function isNext7Days(date) {
  if (!date) return false;
  const now = new Date();
  const in7 = new Date(now);
  in7.setDate(now.getDate() + 7);
  return date >= now && date <= in7;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [timelines, setTimelines] = useState([]);
  const [clients, setClients] = useState([]);
  const [contentPieces, setContentPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming"); // "upcoming" | "thisweek" | "all"

  useEffect(() => {
    Promise.all([
      base44.entities.CoachingTimeline.list(),
      base44.entities.ClientProfile.list(),
      base44.entities.ContentPiece.list(),
    ]).then(([tl, cl, cp]) => {
      setTimelines(tl);
      setClients(cl);
      setContentPieces(cp);
      setLoading(false);
    });
  }, []);

  // Build unified timeline events
  const events = useMemo(() => {
    const list = [];

    // Client coaching week tasks
    timelines.forEach(timeline => {
      if (!timeline.coaching_start_date || !timeline.weeks_json) return;
      let weeks = [];
      try { weeks = JSON.parse(timeline.weeks_json); } catch { return; }

      weeks.forEach(week => {
        if (week.week < (timeline.current_week || 0)) return; // skip past weeks
        const monday = getWeekMonday(timeline.coaching_start_date, week.week);
        if (!monday) return;
        const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
        const wednesday = new Date(monday); wednesday.setDate(monday.getDate() + 2);

        // Add one entry per week per client for visibility
        const openTasks = (week.groups || []).flatMap(g => g.tasks || []).filter(t => t.status === "offen").length;
        const totalTasks = (week.groups || []).flatMap(g => g.tasks || []).length;

        if (totalTasks > 0) {
          list.push({
            id: `${timeline.id}-w${week.week}`,
            date: monday,
            endDate: friday,
            type: "coaching",
            title: `${timeline.client_name} – Woche ${week.week}`,
            subtitle: week.phase,
            detail: `${openTasks} von ${totalTasks} Aufgaben offen`,
            status: openTasks === 0 ? "done" : openTasks === totalTasks ? "open" : "partial",
            link: `/CoachingDashboard832?clientId=${timeline.client_id}&name=${encodeURIComponent(timeline.client_name)}`,
            clientName: timeline.client_name,
          });

          // Monday task
          list.push({
            id: `${timeline.id}-w${week.week}-mo`,
            date: monday,
            type: "coaching-task",
            title: `${timeline.client_name} – Montag`,
            subtitle: "Motivationsnachricht + Wochenfokus",
            status: (week.groups?.[0]?.tasks || []).every(t => t.status === "erledigt") ? "done" : "open",
            link: `/CoachingDashboard832?clientId=${timeline.client_id}&name=${encodeURIComponent(timeline.client_name)}`,
            clientName: timeline.client_name,
          });

          // Wednesday review
          list.push({
            id: `${timeline.id}-w${week.week}-mi`,
            date: wednesday,
            type: "coaching-task",
            title: `${timeline.client_name} – Mittwoch-Review`,
            subtitle: "Kalorien, Protein, Training überprüfen",
            status: (week.groups?.[1]?.tasks || []).every(t => t.status === "erledigt") ? "done" : "open",
            link: `/CoachingDashboard832?clientId=${timeline.client_id}&name=${encodeURIComponent(timeline.client_name)}`,
            clientName: timeline.client_name,
          });

          // Friday call
          list.push({
            id: `${timeline.id}-w${week.week}-fr`,
            date: friday,
            type: "coaching-task",
            title: `${timeline.client_name} – Reflexions-Call`,
            subtitle: "Freitag: Woche reflektieren & anpassen",
            status: (week.groups?.[2]?.tasks || []).every(t => t.status === "erledigt") ? "done" : "open",
            link: `/CoachingDashboard832?clientId=${timeline.client_id}&name=${encodeURIComponent(timeline.client_name)}`,
            clientName: timeline.client_name,
          });
        }
      });
    });

    // Content pieces with planned dates
    contentPieces.forEach(cp => {
      if (!cp.planned_date) return;
      const d = new Date(cp.planned_date);
      list.push({
        id: `cp-${cp.id}`,
        date: d,
        type: "content",
        title: cp.title,
        subtitle: `${cp.type || ""} · ${cp.category || ""}`,
        detail: cp.status,
        status: cp.status === "Veröffentlicht" ? "done" : cp.status === "Übersprungen" ? "skipped" : "open",
        link: "/ContentPlanning832",
      });
    });

    return list.sort((a, b) => a.date - b.date);
  }, [timelines, contentPieces]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return events.filter(e => {
      if (filter === "thisweek") return isThisWeek(e.date);
      if (filter === "upcoming") return e.date >= now && isNext7Days(e.date);
      return true; // "all" — last 7 days + next 14
    }).slice(0, filter === "all" ? 80 : 40);
  }, [events, filter]);

  // Group by date
  const grouped = useMemo(() => {
    const map = {};
    filteredEvents.forEach(e => {
      const key = e.date.toISOString().split("T")[0];
      if (!map[key]) map[key] = { date: e.date, items: [] };
      map[key].items.push(e);
    });
    return Object.values(map).sort((a, b) => a.date - b.date);
  }, [filteredEvents]);

  const TYPE_CONFIG = {
    coaching: { color: "border-l-[#00416A] bg-[#00416A]/5", icon: Users, iconColor: "text-[#00416A]" },
    "coaching-task": { color: "border-l-blue-300 bg-blue-50/60", icon: CheckCircle2, iconColor: "text-blue-400" },
    content: { color: "border-l-violet-400 bg-violet-50/60", icon: CalendarDays, iconColor: "text-violet-500" },
  };

  const STATUS_ICON = {
    done: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    partial: <Clock className="w-3.5 h-3.5 text-amber-500" />,
    open: <Clock className="w-3.5 h-3.5 text-black/25" />,
    skipped: <AlertCircle className="w-3.5 h-3.5 text-black/20" />,
  };

  const today = new Date();

  return (
    <div className="min-h-screen bg-[#F0EAD6]">
      {/* Header */}
      <div className="bg-[#00416A] text-white px-6 lg:px-10 py-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">Leistungsarchitektur</p>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">{today.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-10">

        {/* ── Tool Grid ── */}
        <section>
          <h2 className="text-[10px] font-black text-black/30 uppercase tracking-[0.18em] mb-4">Tools & Module</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {TOOLS.map(({ label, icon: Icon, path, color, desc }) => (
              <Link key={path} to={path}
                className="group bg-white rounded-2xl border border-black/5 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col gap-3">
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-black/80 leading-tight">{label}</p>
                  <p className="text-[10px] text-black/35 mt-0.5 leading-snug">{desc}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-black/15 group-hover:text-black/30 mt-auto transition" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── Timeline ── */}
        <section>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-[10px] font-black text-black/30 uppercase tracking-[0.18em]">Aufgaben-Timeline</h2>
            <div className="flex gap-1 bg-black/8 rounded-xl p-1">
              {[
                { key: "upcoming", label: "Nächste 7 Tage" },
                { key: "thisweek", label: "Diese Woche" },
                { key: "all", label: "Alle" },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter === f.key ? "bg-white text-[#00416A] shadow-sm" : "text-black/40 hover:text-black/60"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-black/25 text-sm">Lade Timeline...</div>
          ) : grouped.length === 0 ? (
            <div className="text-center py-12 bg-white/50 rounded-2xl border border-black/5">
              <Calendar className="w-8 h-8 text-black/15 mx-auto mb-3" />
              <p className="text-sm text-black/30 font-semibold">Keine Aufgaben im gewählten Zeitraum</p>
              <p className="text-xs text-black/20 mt-1">Wechsle den Filter oder überprüfe die Coaching-Timelines</p>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(({ date, items }) => {
                const isToday = date.toDateString() === today.toDateString();
                const isTomorrow = (() => { const t = new Date(today); t.setDate(t.getDate() + 1); return date.toDateString() === t.toDateString(); })();
                const dayLabel = isToday ? "Heute" : isTomorrow ? "Morgen" : date.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });

                return (
                  <div key={date.toISOString()}>
                    {/* Day header */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isToday ? "bg-[#00416A] text-white" : "bg-black/8 text-black/50"}`}>
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-white/70" />}
                        {dayLabel}
                      </div>
                      <div className="flex-1 h-px bg-black/8" />
                    </div>

                    {/* Events */}
                    <div className="space-y-1.5 ml-2">
                      {items.map(event => {
                        const tc = TYPE_CONFIG[event.type] || TYPE_CONFIG.content;
                        return (
                          <Link key={event.id} to={event.link}
                            className={`flex items-center gap-3 rounded-xl border-l-2 px-3 py-2.5 hover:brightness-95 transition ${tc.color}`}>
                            <tc.icon className={`w-3.5 h-3.5 flex-shrink-0 ${tc.iconColor}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-black/75 truncate">{event.title}</p>
                              {event.subtitle && (
                                <p className="text-[10px] text-black/40 truncate">{event.subtitle}</p>
                              )}
                            </div>
                            {event.detail && (
                              <span className="text-[10px] text-black/35 flex-shrink-0">{event.detail}</span>
                            )}
                            {STATUS_ICON[event.status]}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}