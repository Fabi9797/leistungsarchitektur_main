import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ChartCard({ title, subtitle, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold text-sm">{title}</span>
          {subtitle && <span className="text-white/30 text-xs">{subtitle}</span>}
          {badge && (
            <span className="px-2 py-0.5 bg-[#3ecf8e]/15 text-[#3ecf8e] text-xs font-mono rounded-full">{badge}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}