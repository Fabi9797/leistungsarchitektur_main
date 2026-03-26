import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import StepGoalCard from './StepGoalCard';
import LeadAnswersCard from './LeadAnswersCard';
import { PUEK_KETTEN, PUEK_GESAMTVORTEIL } from '@/lib/salesleitfaden';

export default function Step8({ call, stepGoal, onDataChange }) {
  const [loading, setLoading] = useState(false);
  const [pueukChains, setPueukChains] = useState(
    call.puek_json ? JSON.parse(call.puek_json) : null
  );

  const kaufmotive = call.kaufmotive_json ? JSON.parse(call.kaufmotive_json) : [];

  const generatePueuk = async () => {
    setLoading(true);
    try {
      const puekTexte = PUEK_KETTEN.map(pk => `- ${pk.titel}: P="${pk.p}" | Ü="${pk.ue}" | K="${pk.k}"`).join('\n');

      const prompt = `Wähle für jeden der folgenden Kaufmotive des Kunden ${call.lead_name} die am besten passende PÜK-Kette aus meinen vordefinierten Ketten aus und passe den Kundennutzen leicht auf das spezifische Motiv an.

Kaufmotive: ${JSON.stringify(kaufmotive)}

Meine PÜK-Ketten:
${puekTexte}

Antworte als JSON Array mit objects: {kaufmotiv, produktmerkmal, uebersetzer, kundennutzen, formulierung_komplett}
Die formulierung_komplett soll eine natürliche Sprachformulierung sein: "[P] — [Ü] — [K]"`;

      const result = await base44.functions.invoke('generateSalesAI', {
        prompt,
        type: 'pueuk'
      });

      const chains = Array.isArray(result.data) ? result.data : result.data.data || [];
      setPueukChains(chains);
      onDataChange('puek_json', JSON.stringify(chains));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StepGoalCard goal={stepGoal} />

      {!pueukChains ? (
        <div className="flex justify-center">
          <Button
            onClick={generatePueuk}
            disabled={loading || kaufmotive.length === 0}
            style={{ backgroundColor: '#C9A84C' }}
            className="text-gray-900"
          >
            {loading ? 'Wird generiert...' : 'PÜK-Ketten generieren'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {pueukChains.map((chain, i) => (
            <Card key={i} className="p-6" style={{ borderLeft: '4px solid #1B365D' }}>
              <p className="text-sm font-bold" style={{ color: '#1B365D' }} className="mb-3">
                {chain.kaufmotiv}
              </p>
              <div className="space-y-2 text-sm mb-4">
                <div>
                  <span className="font-semibold text-gray-700">P (Produktmerkmal):</span> {chain.produktmerkmal}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Ü (Übersetzer):</span> {chain.uebersetzer}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">K (Kundennutzen):</span> {chain.kundennutzen}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 italic">
                {chain.formulierung_komplett}
              </div>
            </Card>
          ))}

          <Card className="p-6 bg-green-50 border border-green-200">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Gesamtvorteil</p>
            <p className="text-green-900 font-semibold italic">
              „{PUEK_GESAMTVORTEIL.replace('[HAUPTPROBLEM]', kaufmotive[0] || 'deinen wichtigsten Punkt')}"
            </p>
          </Card>
        </div>
      )}
      <LeadAnswersCard call={call} />
    </div>
  );
}