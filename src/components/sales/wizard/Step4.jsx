import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function Step4({ call, onNotesChange }) {
  const step3Notes = call.step_notes_json ? JSON.parse(call.step_notes_json).step_3 || '' : '';
  const [notes, setNotes] = useState(call.step_notes_json ? JSON.parse(call.step_notes_json).step_4 || '' : '');

  const handleNotesChange = (value) => {
    setNotes(value);
    onNotesChange('step_4', value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          Vertiefe die genannten Bedürfnisse — <strong>Was genau meint er?</strong>
        </p>
      </div>

      {step3Notes && (
        <Card className="p-6 bg-gray-50">
          <h3 className="font-bold text-sm mb-3 text-gray-700">Bisherige Notizen (Schritt 3)</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{step3Notes}</p>
        </Card>
      )}

      <Card className="p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Konkretisierte Bedürfnisse
        </label>
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Halte fest, welche Bedürfnisse konkretisiert wurden..."
          className="min-h-48"
        />
      </Card>
    </div>
  );
}