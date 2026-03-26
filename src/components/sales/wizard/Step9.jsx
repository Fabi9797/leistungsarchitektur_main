import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import StepGoalCard from './StepGoalCard';

export default function Step9({ call, stepGoal, onDataChange, onComplete }) {
  const [preisReaction, setPreisReaction] = useState(call.preis_reaktion || '');
  const [followUpDate, setFollowUpDate] = useState(call.follow_up_date || '');
  const [ergebnis, setErgebnis] = useState(call.ergebnis || '');
  const [einwand, setEinwand] = useState('');

  const handlePriceReaction = (reaction) => {
    setPreisReaction(reaction);
    onDataChange('preis_reaktion', reaction);
  };

  const handleErgebnis = (result) => {
    setErgebnis(result);
    onDataChange('ergebnis', result);
  };

  const handleFollowUp = (date) => {
    setFollowUpDate(date);
    onDataChange('follow_up_date', date);
  };

  return (
    <div className="space-y-6">
      <StepGoalCard goal={stepGoal} />
      {/* Preisnennung */}
      <Card className="p-6 bg-red-50 border-2 border-red-200">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-900 font-semibold">
            Preis nennen, dann SCHWEIGEN. Auf keinen Fall weiterreden!
          </p>
        </div>
        <div className="bg-white p-4 rounded text-gray-700 font-medium">
          "Für mein 16-Wochen-Programm, welches komplett auf dich abgestimmt sein wird, liegt die Investition bei <span style={{ color: '#C9A84C' }}>€2.999</span>."
        </div>
      </Card>

      {/* Preisreaktion */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4" style={{ color: '#1B365D' }}>Preisreaktion</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {['Sofort Ja', 'Nachdenken', 'Einwand', 'Absage'].map((reaction) => (
            <Button
              key={reaction}
              onClick={() => handlePriceReaction(reaction)}
              variant={preisReaction === reaction ? 'default' : 'outline'}
              style={
                preisReaction === reaction
                  ? {
                      backgroundColor: reaction === 'Sofort Ja' ? '#2D5A3D' : '#1B365D'
                    }
                  : {}
              }
              className={preisReaction === reaction ? 'text-white' : ''}
            >
              {reaction}
            </Button>
          ))}
        </div>

        {preisReaction === 'Sofort Ja' && (
          <Button
            style={{ backgroundColor: '#2D5A3D' }}
            className="w-full text-white mb-6"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Vertragsunterlagen per Mail senden
          </Button>
        )}

        {preisReaction === 'Nachdenken' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Rückmeldung bis:
            </label>
            <Input
              type="date"
              value={followUpDate}
              onChange={(e) => handleFollowUp(e.target.value)}
            />
          </div>
        )}

        {preisReaction === 'Einwand' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Der Einwand:
            </label>
            <Textarea
              value={einwand}
              onChange={(e) => setEinwand(e.target.value)}
              placeholder="Welchen Einwand hat der Lead?"
              className="min-h-24 mb-3"
            />
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-900">
              <strong>Tipp:</strong> Nutze die Sandwich-Methode: Zustimmung → Entkräftung → Abschluss
            </div>
          </div>
        )}
      </Card>

      {/* Ergebnis */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4" style={{ color: '#1B365D' }}>Ergebnis</h3>
        <Select value={ergebnis} onValueChange={handleErgebnis}>
          <SelectTrigger>
            <SelectValue placeholder="Ergebnis auswählen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Abschluss">Abschluss</SelectItem>
            <SelectItem value="Bedenkzeit">Bedenkzeit</SelectItem>
            <SelectItem value="Absage">Absage</SelectItem>
            <SelectItem value="Follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Finish Button */}
      <Button
        onClick={onComplete}
        disabled={!ergebnis}
        style={{ backgroundColor: '#1B365D' }}
        className="w-full text-white py-6 text-base font-semibold"
      >
        Gespräch abschließen
      </Button>
    </div>
  );
}