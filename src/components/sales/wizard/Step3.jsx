import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const suggestedQuestions = [
  'Was ist dir wichtig, wenn es um Training geht?',
  'Worauf legst du Wert, wenn du eine Ernährungsstrategie planst?',
  'Was noch, das ich wissen sollte?',
  'Was genau meinst du mit "Fitnessziele"?'
];

export default function Step3({ call, onNotesChange }) {
  const [notes, setNotes] = useState(call.step_notes_json ? JSON.parse(call.step_notes_json).step_3 || '' : '');

  const handleNotesChange = (value) => {
    setNotes(value);
    onNotesChange('step_3', value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          Setze <strong>offene W-Fragen</strong> ein und höre aktiv zu.
        </p>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4" style={{ color: '#1B365D' }}>Vorgeschlagene Fragen</h3>
        <div className="space-y-2">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              className="w-full text-left p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
              onClick={() => {
                const newNotes = notes + (notes ? '\n\n' : '') + q;
                handleNotesChange(newNotes);
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Genannte Bedürfnisse & Hidden Needs
        </label>
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Notiere die Bedürfnisse des Leads..."
          className="min-h-48"
        />
      </Card>
    </div>
  );
}