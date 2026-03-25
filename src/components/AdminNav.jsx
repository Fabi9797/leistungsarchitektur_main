import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { LayoutDashboard, Users, Pill, Utensils, CalendarDays, ChevronRight, X, TrendingUp, Mic, Phone } from "lucide-react";

const TOOLS = [
  { label: "Clients", icon: Users, path: "/Clients832" },
  { label: "Content Planer", icon: CalendarDays, path: "/ContentPlanning832" },
  { label: "Supplements", icon: Pill, path: "/SupplementAdmin832" },
  { label: "Ernährung", icon: Utensils, path: "/NutritionAdmin832" },
  { label: "Dashboard", icon: LayoutDashboard, path: "/ClientOverview832" },
  { label: "Monatsreport", icon: TrendingUp, path: "/progress" },
  { label: "Testimonial Audios", icon: Mic, path: "/TestimonialAdmin832" },
  { label: "Progress Report", icon: TrendingUp, path: "/progress-report" },
  { label: "Sales Cockpit", icon: Phone, path: "/sales-cockpit" },
];

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hide on public pages
  const isPublic = location.pathname === "/" || location.pathname.startsWith("/kunde/");
  if (isPublic) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#00416A] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#003356] transition"
        title="Admin Tools"
      >
        {open ? <X className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
      </button>

      {/* Menu */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-black/8 overflow-hidden min-w-[200px]">
          <div className="px-4 py-2.5 border-b border-black/6">
            <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider">Admin Tools</p>
          </div>
          <div className="py-1.5">
            {TOOLS.map(({ label, icon: Icon, path }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                    active
                      ? "bg-[#00416A]/8 text-[#00416A] font-semibold"
                      : "text-black/70 hover:bg-black/4 hover:text-black"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </>
  );
}