import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import Step1 from '@/components/sales/wizard/Step1';
import Step2 from '@/components/sales/wizard/Step2';
import Step3 from '@/components/sales/wizard/Step3';
import Step4 from '@/components/sales/wizard/Step4';
import Step5 from '@/components/sales/wizard/Step5';
import Step6 from '@/components/sales/wizard/Step6';
import Step7 from '@/components/sales/wizard/Step7';
import Step8 from '@/components/sales/wizard/Step8';
import Step9 from '@/components/sales/wizard/Step9';

const steps = [
  { num: 1, title: 'Vorbereitung & Vertrauen schaffen', component: Step1, goal: 'Vertrauen schaffen (Einstieg)' },
  { num: 2, title: 'Klarheit über die Situation (GVZ)', component: Step2, goal: 'Situation mit GVZ verstehen' },
  { num: 3, title: 'Bedürfnisse ergründen', component: Step3, goal: 'Hidden Needs identifizieren' },
  { num: 4, title: 'Bedürfnisse konkretisieren', component: Step4, goal: 'Bedürfnisse konkretisieren' },
  { num: 5, title: 'Zusammenfassung', component: Step5, goal: 'Situation zusammenfassen' },
  { num: 6, title: 'Entscheidende Kaufmotive', component: Step6, goal: 'Entscheidendes Kaufmotiv finden' },
  { num: 7, title: 'Kaufmotive bedienen (PÜK-Ketten)', component: Step8, goal: 'PÜK-Ketten präsentieren' },
  { num: 8, title: 'Provisorischer Vorabschluss', component: Step7, goal: 'Provisorischen Vorabschluss einholen' },
  { num: 9, title: 'Verkaufsabschluss', component: Step9, goal: 'Preis nennen & abschließen' },
];

export default function SalesWizard() {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCall();
  }, [callId]);

  const loadCall = async () => {
    try {
      const data = await base44.entities.SalesCall.get(callId);
      setCall(data);
      setCurrentStep(data.current_step || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error loading call:', error);
      setLoading(false);
    }
  };

  const pendingUpdates = useRef({});
  const debounceTimer = useRef(null);

  const flushUpdates = useCallback(async () => {
    if (Object.keys(pendingUpdates.current).length === 0) return;
    const updates = { ...pendingUpdates.current };
    pendingUpdates.current = {};
    await base44.entities.SalesCall.update(callId, updates);
  }, [callId]);

  const handleDataChange = (field, value) => {
    const updated = { ...call, [field]: value };
    setCall(updated);
    pendingUpdates.current[field] = value;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(flushUpdates, 800);
  };

  const handleNotesChange = (stepKey, notes) => {
    const stepNotes = call.step_notes_json ? JSON.parse(call.step_notes_json) : {};
    stepNotes[stepKey] = notes;
    handleDataChange('step_notes_json', JSON.stringify(stepNotes));
  };

  const handleNext = async () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
      await base44.entities.SalesCall.update(callId, { current_step: currentStep + 1 });
    }
  };

  const handlePrev = async () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      await base44.entities.SalesCall.update(callId, { current_step: currentStep - 1 });
    }
  };

  const handleComplete = async () => {
    await base44.entities.SalesCall.update(callId, {
      status: 'Abgeschlossen'
    });
    navigate('/sales-cockpit');
  };

  if (loading || !call) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const CurrentStep = steps[currentStep - 1].component;
  const progress = (currentStep / 9) * 100;

  return (
    <div className="min-h-screen bg-white" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#1B365D' }}>
                {call.lead_name}
              </h1>
              <p className="text-sm text-gray-600">
                {steps[currentStep - 1].title}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/sales-cockpit')}
            >
              Zurück zum Cockpit
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-700">
                Schritt {currentStep} von 9
              </span>
              <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: '#1B365D' }}
              />
            </div>
          </div>

          {/* Step circles */}
          <div className="flex justify-between mt-6 gap-2">
            {steps.map((step) => (
              <div key={step.num} className="flex-1">
                <div
                  className={`w-full h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep === step.num
                      ? 'text-white'
                      : currentStep > step.num
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}
                  style={{
                    backgroundColor:
                      currentStep >= step.num ? '#1B365D' : '#E5E7EB'
                  }}
                >
                  {step.num}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <CurrentStep
          call={call}
          stepGoal={steps[currentStep - 1].goal}
          onDataChange={handleDataChange}
          onNotesChange={handleNotesChange}
          onComplete={handleComplete}
        />
      </div>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
          <Button
            onClick={handlePrev}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Zurück
          </Button>

          <Button
            onClick={currentStep === 9 ? handleComplete : handleNext}
            style={{ backgroundColor: '#1B365D' }}
            className="text-white flex items-center gap-2"
          >
            {currentStep === 9 ? 'Abschließen' : 'Weiter'}
            {currentStep < 9 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}