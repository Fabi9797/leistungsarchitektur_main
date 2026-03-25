import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function Step1({ call, onNotesChange }) {
  const [notes, setNotes] = useState(call.step_notes_json ? JSON.parse(call.step_notes_json).step_1 || '' : '');

  const handleNotesChange = (value) => {
    setNotes(value);
    onNotesChange('step_1', value);
  };

  let leadProfile = {};
  if (call.lead_analyse_json) {
    try {
      leadProfile = JSON.parse(call.lead_analyse_json);
    } catch {}
  }

  const talkPoints = [
    `Schön, dass du da bist ${call.lead_name}! Ich freue mich auf das Gespräch mit dir.`
  ];

  if (leadProfile.hobby) {
    talkPoints.push(`Ich sehe, dass du ${leadProfile.hobby} machst – schön!`);
  }

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lead-Profil */}
        <Card className="p-6" style={{ borderLeft: '4px solid #1B365D' }}>
          <h3 className="font-bold text-lg mb-4" style={{ color: '#1B365D' }}>Lead-Profil</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Name</p>
              <p className="font-semibold text-gray-900">{call.lead_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">E-Mail</p>
              <p className="text-gray-700">{call.lead_email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Telefon</p>
              <p className="text-gray-700">{call.lead_phone || '-'}</p>
            </div>
            {leadProfile.coaching_ziel && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Ziel</p>
                <p className="text-gray-700">{leadProfile.coaching_ziel}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Gesprächseinstieg */}
        <Card className="p-6" style={{ borderLeft: '4px solid #C9A84C' }}>
          <h3 className="font-bold text-lg mb-4" style={{ color: '#1B365D' }}>Gesprächseinstieg</h3>
          <div className="space-y-4">
            {talkPoints.map((point, i) => (
              <div key={i} className="text-sm text-gray-700 leading-relaxed">
                "{point}"
              </div>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-xs font-semibold text-gray-700 mb-3">Checkliste:</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Ruhige Atmosphäre</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Unterlagen bereit</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Volle Konzentration</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Notizfeld */}
      <Card className="p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Notizen zu diesem Schritt</label>
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Deine Notizen..."
          className="min-h-32"
        />
      </Card>
    </div>
  );
}