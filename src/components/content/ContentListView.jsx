import React from "react";
import { TypeBadge, CategoryBadge, StatusBadge } from "./ContentBadge";
import { Calendar, FileText } from "lucide-react";

export default function ContentListView({ pieces, onSelect }) {
  if (pieces.length === 0) {
    return <div className="text-center py-16 text-black/30 text-sm">Noch keine Content Pieces vorhanden.</div>;
  }

  return (
    <div className="space-y-2">
      {pieces.map(p => (
        <div key={p.id} onClick={() => onSelect(p)}
          className="bg-white rounded-2xl px-5 py-4 shadow-sm cursor-pointer hover:shadow-md hover:translate-y-[-1px] transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <TypeBadge type={p.type} />
                <CategoryBadge category={p.category} />
                <StatusBadge status={p.status} />
              </div>
              <p className="font-bold text-[#00416A] text-sm truncate">{p.title}</p>
              {p.hook && (
                <p className="text-xs text-black/40 mt-1 line-clamp-1 italic">🎣 {p.hook}</p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              {p.planned_date && (
                <div className="flex items-center gap-1 text-xs text-black/30 justify-end">
                  <Calendar className="w-3 h-3" />
                  {new Date(p.planned_date).toLocaleDateString("de-DE", { day: "2-digit", month: "short" })}
                </div>
              )}
              {p.script && <div className="text-xs text-black/20 mt-1 flex items-center gap-1 justify-end"><FileText className="w-3 h-3" /> Skript</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}