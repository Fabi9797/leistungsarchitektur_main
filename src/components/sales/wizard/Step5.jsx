import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import StepGoalCard from './StepGoalCard';

export default function Step5({ call, stepGoal, onDataChange }) {
  const [zusammenfassung, setZusammenfassung] = useState(call.zusammenfassung || '');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const stepNotes = call.step_notes_json ? JSON.parse(call.step_notes_json) : {};

  const generateSummary = async () => {
    setLoading(true);
    try {
      const prompt = `Fasse die folgenden Gesprächsnotizen eines Verkaufsgesprächs zusammen. Der Lead heißt ${call.lead_name}. GVZ-Notizen: Gegenwart: ${call.gvz_gegenwart || ''}, Vergangenheit: ${call.gvz_vergangenheit || ''}, Zukunft: ${call.gvz_zukunft || ''}. Bedürfnisse: ${stepNotes.step_3 || ''}. Konkretisiert: ${stepNotes.step_4 || ''}. Formuliere eine natürliche Zusammenfassung die ich dem Kunden vorlesen kann, beginnend mit: 'Damit am Ende nichts Entscheidendes vergessen wird, fasse ich deine wichtigen Punkte zusammen...'. Antworte nur mit dem Text der Zusammenfassung.`;

      const result = await base44.functions.invoke('generateSalesAI', {
        prompt,
        type: 'summary'
      });

      const summary = result.data.raw || Object.values(result.data)[0] || '';
      setZusammenfassung(summary);
      onDataChange('zusammenfassung', summary);
      setEditing(false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StepGoalCard goal={stepGoal} />

      {!zusammenfassung ? (
        <div className="flex justify-center">
          <Button
            onClick={generateSummary}
            disabled={loading}
            style={{ backgroundColor: '#C9A84C' }}
            className="text-gray-900"
          >
            {loading ? 'Wird generiert...' : 'Zusammenfassung generieren'}
          </Button>
        </div>
      ) : (
        <Card className="p-6" style={{ borderLeft: '4px solid #C9A84C' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ color: '#1B365D' }}>Zusammenfassung</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Fertig' : 'Bearbeiten'}
            </Button>
          </div>
          {editing ? (
            <Textarea
              value={zusammenfassung}
              onChange={(e) => {
                setZusammenfassung(e.target.value);
                onDataChange('zusammenfassung', e.target.value);
              }}
              className="min-h-48"
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {zusammenfassung}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}