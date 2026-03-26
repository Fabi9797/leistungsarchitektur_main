import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FRAGEN = {
  1: "Beruf & Arbeitszeit",
  2: "Was lief früher besser?",
  3: "Ziele",
  4: "Wo braucht er Unterstützung?",
};

export default function LeadAnswersCard({ call }) {
  const [open, setOpen] = useState(false);

  let answers = {};
  try { answers = JSON.parse(call.lead_analyse_json || '{}'); } catch {}

  const renderAnswer = (key) => {
    const val = answers[key];
    if (!val) return <span className="text-gray-400 italic text-sm">Keine Antwort</span>;

    if (key === 3) {
      const selected = val.selected || [];
      const other = val.other || '';
      const all = [...selected, other].filter(Boolean);
      return (
        <div className="flex flex-wrap gap-2">
          {all.map((z, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#1B365D' }}>
              {z}
            </span>
          ))}
        </div>
      );
    }

    return <p className="text-gray-700 text-sm whitespace-pre-wrap">{String(val)}</p>;
  };

  return (
    <Card className="overflow-hidden" style={{ borderTop: '3px solid #1B365D' }}>
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-sm" style={{ color: '#1B365D' }}>
          Antworten von {call.lead_name}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="px-6 pb-5 space-y-4 border-t border-gray-100">
          {[1, 2, 3, 4].map((key) => (
            <div key={key}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{FRAGEN[key]}</p>
              {renderAnswer(key)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}