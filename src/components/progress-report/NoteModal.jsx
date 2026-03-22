import React, { useState } from 'react';
import { detectAnomalies, calculateDummy } from '@/lib/nutrilize-parser';

export default function NoteModal({ day, metricKey, metricLabel, currentValue, notes, allData, onSave, onClose }) {
  const noteKey = `${metricKey}_${day.date}`;
  const existing = notes[noteKey] || {};
  const [text, setText] = useState(existing.note || '');
  const [isDummy, setIsDummy] = useState(existing.isDummy || false);

  const dummyVal = (() => {
    const idx = allData.findIndex(d => d.date === day.date);
    if (idx === -1) return null;
    const values = allData.map(d => d[metricKey]);
    const anomalies = detectAnomalies(values);
    return calculateDummy(values, idx, anomalies);
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white font-semibold text-sm">{metricLabel} · {day.dateLabel || day.date}</p>
            <p className="text-white/40 text-xs mt-0.5">
              Wert: {currentValue !== null && currentValue !== undefined ? (typeof currentValue === 'number' ? currentValue.toFixed(1) : currentValue) : '–'}
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-lg leading-none">✕</button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Notiz hinzufügen..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm resize-none h-24 outline-none focus:border-[#3ecf8e]/50 mb-3"
        />
        {dummyVal !== null && (
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input type="checkbox" checked={isDummy} onChange={e => setIsDummy(e.target.checked)} className="w-4 h-4 accent-orange-400" />
            <span className="text-white/60 text-xs">Dummy-Wert berechnen ({dummyVal.toFixed(1)})</span>
          </label>
        )}
        <div className="flex gap-2 mt-2">
          {existing.note !== undefined && (
            <button onClick={() => { onSave(noteKey, null); onClose(); }}
              className="flex-1 py-2 rounded-xl border border-white/10 text-white/40 hover:text-red-400 hover:border-red-400/30 text-xs transition-colors">
              Löschen
            </button>
          )}
          <button onClick={() => { onSave(noteKey, { note: text, isDummy, dummyVal }); onClose(); }}
            className="flex-1 py-2 rounded-xl bg-[#3ecf8e] text-black font-semibold text-xs hover:bg-[#2ebd7e] transition-colors">
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}