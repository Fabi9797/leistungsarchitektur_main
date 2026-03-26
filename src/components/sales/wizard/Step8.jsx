import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import StepGoalCard from './StepGoalCard';
import LeadAnswersCard from './LeadAnswersCard';

export default function Step8({ call, stepGoal, onDataChange }) {
  const [loading, setLoading] = useState(false);
  const [pueukChains, setPueukChains] = useState(
    call.puek_json ? JSON.parse(call.puek_json) : null
  );

  const kaufmotive = call.kaufmotive_json ? JSON.parse(call.kaufmotive_json) : [];

  const generatePueuk = async () => {
    setLoading(true);
    try {
      const prompt = `Generiere PÜK-Ketten (Produktmerkmal – Übersetzer – Kundennutzen) für ein Fitness-Coaching. Der Kunde heißt ${call.lead_name} und hat folgende Kaufmotive: ${JSON.stringify(kaufmotive)}.

Mein Coaching "Leistungsarchitektur" umfasst diese 4 Säulen:
1. TRAININGSPLAN: Individueller Trainingsplan, auf den persönlichen Alltag abgestimmt, damit Beruf und Sport in Einklang kommen
2. ERNÄHRUNG: Optimale Anpassung der Ernährung innerhalb einer Rahmenvorgabe – ganz ohne Verbote und Hungern
3. NAHRUNGSERGÄNZUNG: Zielführende und bedarfsorientierte Supplements, um die Entwicklung bestmöglich zu unterstützen
4. STEUERUNG: Begleitung anhand echter Daten – Anpassungen erfolgen dann, wenn sie sinnvoll sind, nicht nach starrem Takt

Erstelle für jedes Kaufmotiv eine PÜK-Kette im Format:
"[Produktmerkmal aus meinen 4 Säulen] (P) → das bedeutet für dich (Ü) → [konkreter Kundennutzen bezogen auf sein Kaufmotiv] (K)"

Antworte als JSON Array mit objects: {kaufmotiv, produktmerkmal, uebersetzer, kundennutzen, formulierung_komplett}`;

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
            <p className="text-green-900 font-semibold">
              Abschluss-Formulierung: "Ich biete dir somit ein Rundum-Sorglos-Paket an, um dich wieder zu alter Stärke zu führen!"
            </p>
          </Card>
        </div>
      )}
      <LeadAnswersCard call={call} />
    </div>
  );
}