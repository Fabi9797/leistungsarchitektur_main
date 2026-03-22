import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ChartCard({ title, subtitle, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden mb-4 shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F0EAD6]/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#00416A] font-semibold text-sm">{title}</span>
          {subtitle && <span className="text-black/30 text-xs">{subtitle}</span>}
          {badge && (
            <span className="px-2 py-0.5 bg-[#00416A]/10 text-[#00416A] text-xs font-mono rounded-full">{badge}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-black/30" /> : <ChevronDown className="w-4 h-4 text-black/30" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}