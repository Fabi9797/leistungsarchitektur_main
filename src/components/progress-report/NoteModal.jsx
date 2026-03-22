import React, { useState } from 'react';
import { X } from 'lucide-react';
import { calculateDummy } from '@/lib/nutrilize-parser';

export default function NoteModal({ day, metric, values, anomalies, existingNote, onSave, onDelete, onClose }) {
  const [text, setText] = useState(existingNote?.text || '');
  const [useDummy, setUseDummy] = useState(existingNote?.useDummy || false);

  const index = values.indexOf(day.rawValue);
  // Find index by date
  const dayIndex = day.index;

  const handleSave = () => {
    if (!text.trim() && !useDummy) {
      onDelete?.();
      return;
    }
    let dummyValue = null;
    if (useDummy) {
      dummyValue = calculateDummy(values, dayIndex, anomalies);
    }
    onSave({ text, useDummy, dummyValue });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-base">Notiz hinzufügen</h3>
            <p className="text-white/40 text-xs mt-0.5">{day.date} · {metric}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {day.value !== null && (
          <div className="mb-4 px-3 py-2 bg-white/5 rounded-lg">
            <span className="text-white/50 text-xs">Wert: </span>
            <span className="text-white text-sm font-mono">{day.displayValue}</span>
          </div>
        )}

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="z.B. Tracking heute nicht möglich, Restaurant..."
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm resize-none h-28 focus:outline-none focus:border-[#3ecf8e]/50 placeholder-white/20"
        />

        <label className="flex items-center gap-3 mt-4 cursor-pointer group">
          <div
            onClick={() => setUseDummy(!useDummy)}
            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${useDummy ? 'bg-orange-400 border-orange-400' : 'border-white/20 bg-white/5'}`}
          >
            {useDummy && <span className="text-white text-xs">✓</span>}
          </div>
          <div>
            <span className="text-white/70 text-sm group-hover:text-white transition-colors">Dummy-Wert berechnen</span>
            <p className="text-white/30 text-xs mt-0.5">Ersetzt den Wert durch den Ø der 3 umliegenden Tage</p>
          </div>
        </label>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-[#3ecf8e] text-black text-sm font-semibold rounded-xl hover:bg-[#2eaf74] transition-colors"
          >
            Speichern
          </button>
          {existingNote && (
            <button
              onClick={onDelete}
              className="px-4 py-2.5 bg-red-500/20 text-red-400 text-sm font-semibold rounded-xl hover:bg-red-500/30 transition-colors"
            >
              Löschen
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 text-white/60 text-sm font-semibold rounded-xl hover:bg-white/10 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}