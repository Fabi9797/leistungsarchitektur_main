import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, LayoutList, Calendar, Filter } from "lucide-react";
import ContentListView from "../components/content/ContentListView";
import ContentCalendarView from "../components/content/ContentCalendarView";
import ContentEditor from "../components/content/ContentEditor";
import { TypeBadge, CategoryBadge, StatusBadge } from "../components/content/ContentBadge";

const CATEGORIES = ["Alle", "Training", "Ernährung", "Supplements", "Steuerung"];
const STATUSES = ["Alle", "Idee", "In Planung", "Gedreht", "Geschnitten", "Veröffentlicht"];

const STATUS_COUNTS_COLORS = {
  "Idee": "text-gray-400",
  "In Planung": "text-blue-500",
  "Gedreht": "text-yellow-500",
  "Geschnitten": "text-orange-500",
  "Veröffentlicht": "text-green-600",
};

export default function ContentPlanning832() {
  const [pieces, setPieces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [filterCat, setFilterCat] = useState("Alle");
  const [filterStatus, setFilterStatus] = useState("Alle");

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ContentPiece.list("-planned_date");
    setPieces(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setSelected(null); setShowEditor(true); };
  const openEdit = (p) => { setSelected(p); setShowEditor(true); };

  const filtered = pieces.filter(p => {
    const catOk = filterCat === "Alle" || p.category === filterCat;
    const statusOk = filterStatus === "Alle" || p.status === filterStatus;
    return catOk && statusOk;
  });

  // Stats
  const stats = ["Idee", "In Planung", "Gedreht", "Geschnitten", "Veröffentlicht"].map(s => ({
    label: s,
    count: pieces.filter(p => p.status === s).length,
  }));

  return (
    <div className="min-h-screen bg-[#F0EAD6] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#00416A]">Content Planung</h1>
            <p className="text-xs text-black/40 mt-1 uppercase tracking-widest">Instagram · Contentkalender</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition">
            <Plus className="w-4 h-4" /> Neues Content Piece
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl px-3 py-3 text-center shadow-sm">
              <p className={`text-2xl font-bold ${STATUS_COUNTS_COLORS[s.label]}`}>{s.count}</p>
              <p className="text-[10px] text-black/40 font-semibold uppercase mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* View toggle */}
          <div className="flex gap-1 bg-black/5 rounded-xl p-1">
            <button onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${view === "list" ? "bg-white text-[#00416A] shadow-sm" : "text-black/40"}`}>
              <LayoutList className="w-4 h-4" /> Liste
            </button>
            <button onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${view === "calendar" ? "bg-white text-[#00416A] shadow-sm" : "text-black/40"}`}>
              <Calendar className="w-4 h-4" /> Kalender
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-black/30" />
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilterCat(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filterCat === c ? "bg-[#00416A] text-white" : "bg-white text-black/40 hover:bg-black/5"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUSES.slice(1).map(s => (
              <button key={s} onClick={() => setFilterStatus(filterStatus === s ? "Alle" : s)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${filterStatus === s ? "bg-[#00416A] text-white" : "bg-white text-black/40 hover:bg-black/5"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-2">
          {loading ? (
            <p className="text-center py-10 text-black/30 text-sm">Laden...</p>
          ) : view === "list" ? (
            <ContentListView pieces={filtered} onSelect={openEdit} />
          ) : (
            <div className="bg-[#F0EAD6]/50 rounded-2xl p-4">
              <ContentCalendarView
                pieces={filtered}
                onSelect={openEdit}
                onDateChange={async (pieceId, dateStr) => {
                  await base44.entities.ContentPiece.update(pieceId, { planned_date: dateStr });
                  load();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {showEditor && (
        <ContentEditor
          piece={selected}
          onClose={() => setShowEditor(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}