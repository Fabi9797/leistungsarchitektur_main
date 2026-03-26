import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import StepGoalCard from './StepGoalCard';
import LeadAnswersCard from './LeadAnswersCard';

export default function Step5({ call, stepGoal, onDataChange }) {
  const [zusammenfassung, setZusammenfassung] = useState(call.zusammenfassung || '');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const stepNotes = call.step_notes_json ? JSON.parse(call.step_notes_json) : {};

  const allNotes = [
    call.gvz_gegenwart && `**Gegenwart:** ${call.gvz_gegenwart}`,
    call.gvz_vergangenheit && `**Vergangenheit:** ${call.gvz_vergangenheit}`,
    call.gvz_zukunft && `**Zukunft:** ${call.gvz_zukunft}`,
    stepNotes.step_3 && `**Bedürfnisse:** ${stepNotes.step_3}`,
    stepNotes.step_4 && `**Konkretisiert:** ${stepNotes.step_4}`,
  ].filter(Boolean).join('\n\n');

  const [manualNotes, setManualNotes] = useState(
    call.step_notes_json ? (JSON.parse(call.step_notes_json).step_5_manual || allNotes) : allNotes
  );

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

      {/* Notizen-Übersicht aus vorherigen Schritten */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-bold text-sm mb-3 text-gray-700">Festgehaltene Punkte (alle Schritte)</h3>
        <Textarea
          value={manualNotes}
          onChange={(e) => {
            setManualNotes(e.target.value);
            const stepNotesUpdated = call.step_notes_json ? JSON.parse(call.step_notes_json) : {};
            stepNotesUpdated.step_5_manual = e.target.value;
            onDataChange('step_notes_json', JSON.stringify(stepNotesUpdated));
          }}
          className="min-h-48 bg-white text-sm"
          placeholder="Hier stehen alle bisherigen Notizen..."
        />
      </Card>

      {/* KI Zusammenfassung */}
      {!zusammenfassung ? (
        <div className="flex justify-center">
          <Button
            onClick={generateSummary}
            disabled={loading}
            style={{ backgroundColor: '#C9A84C' }}
            className="text-gray-900"
          >
            {loading ? 'Wird generiert...' : 'KI-Zusammenfassung generieren'}
          </Button>
        </div>
      ) : (
        <Card className="p-6" style={{ borderLeft: '4px solid #C9A84C' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg" style={{ color: '#1B365D' }}>KI-Zusammenfassung</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={generateSummary} disabled={loading}>
                {loading ? '...' : 'Neu generieren'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(!editing)}>
                {editing ? 'Fertig' : 'Bearbeiten'}
              </Button>
            </div>
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
      <LeadAnswersCard call={call} />
    </div>
  );
}