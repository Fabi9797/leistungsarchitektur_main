import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import Step1ClientMonth from "./Step1ClientMonth";
import Step2Subjektiv from "./Step2Subjektiv";
import Step3Koerper from "./Step3Koerper";
import Step4Training from "./Step4Training";
import Step5Coach from "./Step5Coach";

const STEPS = ["Klient & Monat", "Wahrnehmung", "Körper & Vital", "Training & Ernährung", "Coach-Bewertung"];

const empty = {
  client_id: "", client_name: "", report_month: "", report_label: "",
  gefuehl_vorher: "", gefuehl_nachher: "",
  energie_vorher: 5, energie_nachher: 5,
  stress_vorher: 5, stress_nachher: 5,
  schlaf_vorher: 5, schlaf_nachher: 5,
  highlight_des_monats: "", reflexion_kunde: "",
  gewicht_start: "", gewicht_end: "", kfa_start: "", kfa_end: "",
  umfaenge_json: "", gewicht_verlauf_json: "",
  hrv_avg: "", hrv_trend: "Stabil", ruhepuls_avg: "", ruhepuls_trend: "Stabil", schlafdauer_avg: "",
  uebungen_json: "", training_compliance: 80,
  kalorien_avg: "", protein_avg: "", ernaehrung_compliance: 80, supplement_compliance: 80,
  coach_kommentar: "", fokus_naechster_monat: "", gesamtbewertung: 8
};

export default function ReportWizard({ editReport, onSaved, onCancel }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(editReport || empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editReport) setData(editReport);
  }, [editReport]);

  const update = (fields) => setData(prev => ({ ...prev, ...fields }));

  const handleSave = async () => {
    setSaving(true);
    if (editReport?.id) {
      await base44.entities.MonthlyReport.update(editReport.id, data);
    } else {
      await base44.entities.MonthlyReport.create(data);
    }
    setSaving(false);
    onSaved();
  };

  const stepProps = { data, update };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      {/* Step indicator */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  i === step ? "text-amber-400" : i < step ? "text-amber-400/60" : "text-white/30"
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-all ${
                  i < step ? "bg-amber-400 border-amber-400 text-black" :
                  i === step ? "border-amber-400 text-amber-400" : "border-white/20 text-white/30"
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-amber-400/40" : "bg-white/10"}`} />}
            </React.Fragment>
          ))}
        </div>
        <h2 className="text-xl font-bold text-white">{STEPS[step]}</h2>
      </div>

      <div className="max-w-3xl mx-auto">
        {step === 0 && <Step1ClientMonth {...stepProps} />}
        {step === 1 && <Step2Subjektiv {...stepProps} />}
        {step === 2 && <Step3Koerper {...stepProps} />}
        {step === 3 && <Step4Training {...stepProps} />}
        {step === 4 && <Step5Coach {...stepProps} />}

        <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-all text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Abbrechen" : "Zurück"}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-300 transition-all text-sm"
            >
              Weiter <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-300 transition-all text-sm disabled:opacity-50"
            >
              {saving ? "Speichern..." : "Bericht speichern"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}