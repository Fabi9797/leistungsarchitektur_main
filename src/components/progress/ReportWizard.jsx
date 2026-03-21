import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import Step1ClientMonth from "./Step1ClientMonth";
import Step2Subjektiv from "./Step2Subjektiv";
import Step3Koerper from "./Step3Koerper";
import Step4Training from "./Step4Training";
import Step5Coach from "./Step5Coach";

const LOGO_URL = "https://media.base44.com/images/public/69b064c89953b727c5202e21/a128f5dab_ChatGPTImage19Marz202616_44_51.png";
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
    <div className="min-h-screen bg-[#F0EAD6]/30">
      {/* Header */}
      <div className="bg-white border-b border-black/8 px-8 py-5 flex items-center gap-3">
        <img src={LOGO_URL} alt="Logo" className="w-9 h-9 rounded-lg object-contain" />
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#00416A]/50 uppercase">Leistungsarchitektur</p>
          <h1 className="text-xl font-bold text-[#00416A]">Monatsreport {editReport ? "bearbeiten" : "erstellen"}</h1>
        </div>
      </div>

      {/* Step indicator */}
      <div className="bg-white border-b border-black/8 px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    i === step ? "text-[#00416A]" : i < step ? "text-[#00416A]/60" : "text-black/25"
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-all ${
                    i < step ? "bg-[#00416A] border-[#00416A] text-white" :
                    i === step ? "border-[#00416A] text-[#00416A]" : "border-black/20 text-black/30"
                  }`}>
                    {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
                {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-[#00416A]/40" : "bg-black/10"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-lg font-bold text-[#00416A] mb-6">{STEPS[step]}</h2>

        {step === 0 && <Step1ClientMonth {...stepProps} />}
        {step === 1 && <Step2Subjektiv {...stepProps} />}
        {step === 2 && <Step3Koerper {...stepProps} />}
        {step === 3 && <Step4Training {...stepProps} />}
        {step === 4 && <Step5Coach {...stepProps} />}

        <div className="flex justify-between mt-8 pt-6 border-t border-black/8">
          <button
            onClick={step === 0 ? onCancel : () => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-black/15 text-black/60 hover:border-[#00416A]/30 hover:text-[#00416A] transition-all text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Abbrechen" : "Zurück"}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00416A] text-white font-semibold hover:bg-[#003356] transition-all text-sm"
            >
              Weiter <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00416A] text-white font-semibold hover:bg-[#003356] transition-all text-sm disabled:opacity-50"
            >
              {saving ? "Speichern..." : "Bericht speichern"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}