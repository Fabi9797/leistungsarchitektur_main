import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { RefreshCw } from 'lucide-react';

const FRAGEN = {
  1: "Beruf & Arbeitszeit",
  2: "Was lief früher besser?",
  3: "Ziel",
  4: "Wo braucht er Unterstützung?",
};

export default function Step1({ call, onNotesChange }) {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(call.step_notes_json || '{}').step_1 || ''; } catch { return ''; }
  });

  const handleNotesChange = (value) => {
    setNotes(value);
    onNotesChange('step_1', value);
  };

  let answers = {};
  try { answers = JSON.parse(call.lead_analyse_json || '{}'); } catch {}

  // Kontaktdaten aus Schritt 5
  const contact = answers[5] || {};

  const renderAnswer = (key) => {
    const val = answers[key];
    if (!val) return <span className="text-gray-400 italic text-sm">Keine Antwort</span>;

    if (key === 3) {
      // Multiselect (Ziele)
      const selected = val.selected || [];
      const other = val.other || '';
      const all = [...selected, other].filter(Boolean);
      return (
        <div className="flex flex-wrap gap-2">
          {all.map((z, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: '#1B365D' }}
            >
              {z}
            </span>
          ))}
        </div>
      );
    }

    return <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{String(val)}</p>;
  };

  const [einstiege, setEinstiege] = useState([]);
  const [loadingEinstiege, setLoadingEinstiege] = useState(false);

  const generateEinstiege = async () => {
    setLoadingEinstiege(true);
    try {
      const beruf = answers[1] || '';
      const frueher = answers[2] || '';
      const ziele = [...(answers[3]?.selected || []), answers[3]?.other || ''].filter(Boolean).join(', ');
      const unterstuetzung = answers[4] || '';

      const prompt = `Du bist ein erfahrener Fitness-Sales-Coach und hilfst mir, ein Verkaufsgespräch zu eröffnen.

Der Lead heißt ${call.lead_name} und hat folgendes angegeben:
- Beruf: ${beruf}
- Was früher besser lief: ${frueher}
- Ziele: ${ziele}
- Wo er Unterstützung braucht: ${unterstuetzung}

Generiere 3 individuelle Gesprächseinstiege für einen Coaching-Sales-Call. Jeder Einstieg soll:
1. Persönlich und wertschätzend sein
2. Auf eine konkrete Angabe des Leads eingehen
3. Neugier wecken und zum Gespräch einladen
4. Kurz sein (2-3 Sätze)

Antworte als JSON: {"einstiege": ["...", "...", "..."]}`;

      const result = await base44.functions.invoke('generateSalesAI', { prompt });
      const data = result.data;
      if (data?.einstiege) setEinstiege(data.einstiege);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEinstiege(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Kontaktdaten */}
        <Card className="p-6" style={{ borderTop: '3px solid #1B365D' }}>
          <h3 className="font-bold text-base mb-4" style={{ color: '#1B365D' }}>Kontakt</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Name</p>
              <p className="font-semibold text-gray-900 text-sm">{call.lead_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">E-Mail</p>
              <p className="text-gray-700 text-sm">{call.lead_email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Telefon</p>
              <p className="text-gray-700 text-sm">{call.lead_phone || '-'}</p>
            </div>
          </div>
        </Card>

        {/* Gesprächseinstieg */}
        <Card className="p-6 lg:col-span-2" style={{ borderTop: '3px solid #C9A84C' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base" style={{ color: '#1B365D' }}>Gesprächseinstieg</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={generateEinstiege}
              disabled={loadingEinstiege}
              className="flex items-center gap-2 text-xs"
              style={{ borderColor: '#C9A84C', color: '#C9A84C' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingEinstiege ? 'animate-spin' : ''}`} />
              {loadingEinstiege ? 'Wird generiert...' : einstiege.length > 0 ? 'Aktualisieren' : 'Einstiege generieren'}
            </Button>
          </div>

          {einstiege.length === 0 ? (
            <p className="text-sm text-gray-400 italic mb-4">
              Klicke auf "Einstiege generieren" für 3 individuelle Vorschläge basierend auf den Antworten des Leads.
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {einstiege.map((einstieg, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg text-sm text-gray-700 leading-relaxed italic border-l-2"
                  style={{ backgroundColor: '#FDFAF3', borderColor: '#C9A84C' }}
                >
                  <span className="not-italic text-xs font-bold mr-2" style={{ color: '#C9A84C' }}>
                    Variante {i + 1}
                  </span>
                  "{einstieg}"
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 mt-2">
            <p className="text-xs font-semibold text-gray-600 mb-2">Checkliste vor dem Call:</p>
            <div className="flex gap-6 flex-wrap">
              {['Ruhige Atmosphäre', 'Unterlagen bereit', 'Volle Konzentration'].map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Formular-Antworten */}
      <Card className="p-6" style={{ borderTop: '3px solid #1B365D' }}>
        <h3 className="font-bold text-base mb-5" style={{ color: '#1B365D' }}>
          Formular-Antworten des Leads
        </h3>
        <div className="space-y-5">
          {[1, 2, 3, 4].map((key) => (
            <div key={key} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {FRAGEN[key]}
              </p>
              {renderAnswer(key)}
            </div>
          ))}
        </div>
      </Card>

      {/* Notizfeld */}
      <Card className="p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-3">Meine Notizen zu diesem Schritt</label>
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Deine Notizen..."
          className="min-h-28"
        />
      </Card>
    </div>
  );
}