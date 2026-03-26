import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import StepGoalCard from './StepGoalCard';

export default function Step2({ call, stepGoal, onDataChange }) {
  const [gegenwart, setGegenwart] = useState(call.gvz_gegenwart || '');
  const [vergangenheit, setVergangenheit] = useState(call.gvz_vergangenheit || '');
  const [zukunft, setZukunft] = useState(call.gvz_zukunft || '');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const analysisData = call.lead_analyse_json
        ? JSON.parse(call.lead_analyse_json)
        : {};

      const prompt = `Basierend auf folgenden Analyse-Antworten eines Leads generiere 3 spezifische Einstiegsfragen für Gegenwart, Vergangenheit und Zukunft. Der Lead heißt ${call.lead_name} und hat folgende Angaben gemacht: ${JSON.stringify(analysisData)}. Antworte als JSON mit keys gegenwart_fragen, vergangenheit_fragen, zukunft_fragen, jeweils Arrays mit 3 Strings.`;

      const result = await base44.functions.invoke('generateSalesAI', {
        prompt,
        type: 'gvz'
      });

      setSuggestions(result.data);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StepGoalCard goal={stepGoal} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gegenwart */}
        <Card className="p-6">
          <h3 className="font-bold mb-2" style={{ color: '#1B365D' }}>G – Gegenwart</h3>
          <p className="text-sm text-gray-600 mb-4">Wie bewertest du deine aktuelle Situation?</p>
          <Textarea
            value={gegenwart}
            onChange={(e) => {
              setGegenwart(e.target.value);
              onDataChange('gvz_gegenwart', e.target.value);
            }}
            placeholder="Notizen..."
            className="min-h-24 mb-3"
          />
          {suggestions?.gegenwart_fragen && (
            <div className="space-y-2 mt-4 border-t pt-3">
              <p className="text-xs font-semibold text-gray-700">Vorschläge:</p>
              {suggestions.gegenwart_fragen.map((q, i) => (
                <button
                  key={i}
                  className="w-full text-left text-xs p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => setGegenwart(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Vergangenheit */}
        <Card className="p-6">
          <h3 className="font-bold mb-2" style={{ color: '#1B365D' }}>V – Vergangenheit</h3>
          <p className="text-sm text-gray-600 mb-4">Was lief früher besser?</p>
          <Textarea
            value={vergangenheit}
            onChange={(e) => {
              setVergangenheit(e.target.value);
              onDataChange('gvz_vergangenheit', e.target.value);
            }}
            placeholder="Notizen..."
            className="min-h-24 mb-3"
          />
          {suggestions?.vergangenheit_fragen && (
            <div className="space-y-2 mt-4 border-t pt-3">
              <p className="text-xs font-semibold text-gray-700">Vorschläge:</p>
              {suggestions.vergangenheit_fragen.map((q, i) => (
                <button
                  key={i}
                  className="w-full text-left text-xs p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => setVergangenheit(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Zukunft */}
        <Card className="p-6">
          <h3 className="font-bold mb-2" style={{ color: '#1B365D' }}>Z – Zukunft</h3>
          <p className="text-sm text-gray-600 mb-4">Welches Ziel möchtest du erreichen?</p>
          <Textarea
            value={zukunft}
            onChange={(e) => {
              setZukunft(e.target.value);
              onDataChange('gvz_zukunft', e.target.value);
            }}
            placeholder="Notizen..."
            className="min-h-24 mb-3"
          />
          {suggestions?.zukunft_fragen && (
            <div className="space-y-2 mt-4 border-t pt-3">
              <p className="text-xs font-semibold text-gray-700">Vorschläge:</p>
              {suggestions.zukunft_fragen.map((q, i) => (
                <button
                  key={i}
                  className="w-full text-left text-xs p-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => setZukunft(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={generateQuestions}
          disabled={loading}
          style={{ backgroundColor: '#C9A84C' }}
          className="text-gray-900"
        >
          {loading ? 'Wird generiert...' : 'GVZ-Fragen generieren'}
        </Button>
      </div>
    </div>
  );
}