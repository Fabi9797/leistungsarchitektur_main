import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function Step7({ call, onNotesChange }) {
  const kaufmotive = call.kaufmotive_json ? JSON.parse(call.kaufmotive_json) : [];
  const [reaction, setReaction] = useState('');
  const [notes, setNotes] = useState(call.step_notes_json ? JSON.parse(call.step_notes_json).step_7 || '' : '');

  const handleNotesChange = (value) => {
    setNotes(value);
    onNotesChange('step_7', value);
  };

  const motivsText = kaufmotive.length > 0 ? kaufmotive.join(', ') : '[Kaufmotive]';

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-red-50 border-2 border-red-200">
        <h3 className="font-bold text-lg text-red-900 mb-4">Provisorischer Vorabschluss</h3>
        <div className="bg-white p-4 rounded border-l-4" style={{ borderColor: '#1B365D' }}>
          <p className="text-gray-700 leading-relaxed">
            "Angenommen, wir erfüllen <strong>{motivsText}</strong>, sind wir dann Partner in Sachen Coaching?"
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4" style={{ color: '#1B365D' }}>Reaktion des Leads</h3>
        <div className="flex gap-3 flex-wrap mb-6">
          <Button
            onClick={() => setReaction('Ja')}
            variant={reaction === 'Ja' ? 'default' : 'outline'}
            style={reaction === 'Ja' ? { backgroundColor: '#2D5A3D' } : {}}
            className={reaction === 'Ja' ? 'text-white' : ''}
          >
            Ja
          </Button>
          <Button
            onClick={() => setReaction('Ja, aber...')}
            variant={reaction === 'Ja, aber...' ? 'default' : 'outline'}
            style={reaction === 'Ja, aber...' ? { backgroundColor: '#FFB800' } : {}}
            className={reaction === 'Ja, aber...' ? 'text-gray-900' : ''}
          >
            Ja, aber...
          </Button>
          <Button
            onClick={() => setReaction('Noch unsicher')}
            variant={reaction === 'Noch unsicher' ? 'default' : 'outline'}
            style={reaction === 'Noch unsicher' ? { backgroundColor: '#1B365D' } : {}}
            className={reaction === 'Noch unsicher' ? 'text-white' : ''}
          >
            Noch unsicher
          </Button>
        </div>

        {(reaction === 'Ja, aber...' || reaction === 'Noch unsicher') && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Einwand / Bedenken</label>
            <Textarea
              placeholder="Was ist der Einwand oder die Unsicherheit?"
              className="min-h-24"
            />
          </div>
        )}
      </Card>

      <Card className="p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Notizen</label>
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