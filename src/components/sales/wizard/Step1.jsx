import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const FRAGEN = {
  1: "Beruf & Arbeitszeit",
  2: "Was lief früher besser?",
  3: "Ziel",
  4: "Wo braucht er Unterstützung?",
};

export default function Step1({ call, onNotesChange }) {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(call.step_notes_json || '{}').step_1 || ''; } catch { return ''; }
  });

  const handleNotesChange = (value) => {
    setNotes(value);
    onNotesChange('step_1', value);
  };

  let answers = {};
  try { answers = JSON.parse(call.lead_analyse_json || '{}'); } catch {}

  // Kontaktdaten aus Schritt 5
  const contact = answers[5] || {};

  const renderAnswer = (key) => {
    const val = answers[key];
    if (!val) return <span className="text-gray-400 italic text-sm">Keine Antwort</span>;

    if (key === 3) {
      // Multiselect (Ziele)
      const selected = val.selected || [];
      const other = val.other || '';
      const all = [...selected, other].filter(Boolean);
      return (
        <div className="flex flex-wrap gap-2">
          {all.map((z, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: '#1B365D' }}
            >
              {z}
            </span>
          ))}
        </div>
      );
    }

    return <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{String(val)}</p>;
  };

  const talkPoints = [
    `Schön, dass du da bist ${call.lead_name}! Ich freue mich auf das Gespräch mit dir.`
  ];
  const ziele = answers[3]?.selected || [];
  if (ziele.length > 0) {
    talkPoints.push(`Ich sehe, dass du ${ziele.join(', ')} als Ziel angegeben hast.`);
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Kontaktdaten */}
        <Card className="p-6" style={{ borderTop: '3px solid #1B365D' }}>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1B365D' }}>Kontakt</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Name</p>
              <p className="font-semibold text-gray-900 text-sm">{call.lead_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">E-Mail</p>
              <p className="text-gray-700 text-sm">{call.lead_email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Telefon</p>
              <p className="text-gray-700 text-sm">{call.lead_phone || '-'}</p>
            </div>
          </div>
        </Card>

        {/* Gesprächseinstieg */}
        <Card className="p-6 lg:col-span-2" style={{ borderTop: '3px solid #C9A84C' }}>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1B365D' }}>Gesprächseinstieg</h3>
          <div className="space-y-3 mb-4">
            {talkPoints.map((point, i) => (
              <p key={i} className="text-sm text-gray-700 leading-relaxed italic">
                "{point}"
              </p>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs font-semibold text-gray-600 mb-2">Checkliste vor dem Call:</p>
            <div className="flex gap-6">
              {['Ruhige Atmosphäre', 'Unterlagen bereit', 'Volle Konzentration'].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Formular-Antworten */}
      <Card className="p-6" style={{ borderTop: '3px solid #1B365D' }}>
        <h3 className="font-bold text-base mb-5" style={{ color: '#1B365D' }}>
          Formular-Antworten des Leads
        </h3>
        <div className="space-y-5">
          {[1, 2, 3, 4].map((key) => (
            <div key={key} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {FRAGEN[key]}
              </p>
              {renderAnswer(key)}
            </div>
          ))}
        </div>
      </Card>

      {/* Notizfeld */}
      <Card className="p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Meine Notizen zu diesem Schritt</label>
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Deine Notizen..."
          className="min-h-28"
        />
      </Card>
    </div>
  );
}