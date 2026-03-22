import React, { useState } from 'react';
import { detectAnomalies } from '@/lib/nutrilize-parser';
import NoteModal from './NoteModal';

export default function DayButtons({ data, metricKey, metricLabel, notes, onNoteChange }) {
  const [modal, setModal] = useState(null);
  const values = data.map(d => d[metricKey]);
  const anomalies = detectAnomalies(values);

  return (
    <>
      <div className="flex flex-wrap gap-1 mt-3">
        {data.map((d, i) => {
          const noteKey = `${metricKey}_${d.date}`;
          const hasNote = !!notes[noteKey];
          const isAnom = anomalies[i];
          return (
            <button key={d.date} onClick={() => setModal({ day: d, index: i })}
              title={`${d.dateLabel || d.date}: ${values[i] ?? '–'}`}
              className={`w-5 h-5 rounded text-[9px] font-mono border transition-all ${
                hasNote ? 'bg-orange-400/20 border-orange-400/50 text-orange-300' :
                isAnom ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                'bg-white/4 border-white/8 text-white/20 hover:border-white/20'
              }`}>
              {hasNote ? '✎' : isAnom ? '!' : ''}
            </button>
          );
        })}
      </div>
      {modal && (
        <NoteModal
          day={modal.day}
          metricKey={metricKey}
          metricLabel={metricLabel}
          currentValue={data[modal.index]?.[metricKey]}
          notes={notes}
          allData={data}
          onSave={onNoteChange}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}