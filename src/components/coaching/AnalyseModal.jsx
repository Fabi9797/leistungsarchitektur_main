import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const GOALS = ["Abnehmen", "Muskelaufbau", "Leistungssteigerung"];

const STEPS = [
  {
    id: 1,
    question: "Welchen Beruf übst du aus & wie viele Stunden pro Tag nimmt er ein?",
    type: "textarea",
    placeholder: "z.B. Bürojob, ca. 8–9 Stunden täglich am Schreibtisch...",
  },
  {
    id: 2,
    question: "Was lief früher besser und was hat sich geändert, dass es zur aktuellen Situation gekommen ist?",
    type: "textarea",
    placeholder: "z.B. Früher habe ich regelmäßig Sport gemacht, aber seit...",
  },
  {
    id: 3,
    question: "Welches Ziel möchtest du erreichen?",
    type: "multiselect",
    options: GOALS,
  },
  {
    id: 4,
    question: "Wobei benötigst du am meisten Unterstützung?",
    type: "textarea",
    placeholder: "z.B. Ich finde es schwer, konsequent zu bleiben und...",
  },
  {
    id: 5,
    question: "Wie können wir dich erreichen?",
    type: "contact",
  },
];

export default function AnalyseModal({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ 3: { selected: [], other: "" }, 5: { name: "", phone: "", email: "", consent: false } });
  const [done, setDone] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const getAnswer = () => {
    if (current.type === "multiselect") return answers[current.id] || { selected: [], other: "" };
    if (current.type === "contact") return answers[current.id] || { name: "", phone: "", email: "", consent: false };
    return answers[current.id] || "";
  };

  const setAnswer = (val) => setAnswers(a => ({ ...a, [current.id]: val }));

  const canProceed = () => {
    if (current.type === "multiselect") {
      const a = getAnswer();
      return a.selected.length > 0 || a.other.trim().length > 0;
    }
    if (current.type === "contact") {
      const a = getAnswer();
      return a.name.trim().length > 0 && a.phone.trim().length > 0 && a.email.trim().length > 0 && a.consent;
    }
    return (getAnswer() || "").trim().length > 0;
  };

  const handleNext = async () => {
    if (isLast) {
      const contact = answers[5] || {};
      const zielAnswer = answers[3] || {};
      const ziel = [...(zielAnswer.selected || []), zielAnswer.other].filter(Boolean).join(", ");
      await base44.entities.Lead.create({
        name: contact.name || "Unbekannt",
        phone: contact.phone || "",
        email: contact.email || "",
        status: "Neu",
        source: "Website",
        ziel,
        analyse_answers: JSON.stringify(answers),
      });
      setDone(true);
      return;
    }
    setStep(s => s + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90dvh" }}
      >


        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 sm:py-4 border-b border-black/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#00416A]/40 uppercase tracking-widest">Analyse</span>
            {!done && (
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-[#00416A]" : i < step ? "w-3 bg-[#00416A]/40" : "w-3 bg-black/10"}`} />
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-black/30 hover:text-black/60 hover:bg-black/5 transition -mr-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 sm:py-8">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-[#00416A]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-[#00416A]" />
                </div>
                <h3 className="text-xl font-bold text-[#00416A] mb-2">Danke für deine Antworten!</h3>
                <p className="text-black/50 text-sm leading-relaxed mb-6">
                  Ich werde deine Situation analysieren und mich in Kürze bei dir melden.
                </p>
                <button onClick={onClose} className="px-6 py-3 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] transition w-full sm:w-auto">
                  Schließen
                </button>
              </motion.div>
            ) : (
              <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                <p className="text-[11px] font-bold text-[#00416A]/40 uppercase tracking-widest mb-3">Frage {step + 1} von {STEPS.length}</p>
                <h2 className="text-base sm:text-lg font-bold text-black leading-snug mb-5">{current.question}</h2>

                {current.type === "textarea" && (
                  <textarea
                    value={getAnswer()}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder={current.placeholder}
                    rows={4}
                    className="w-full border border-black/10 rounded-xl px-4 py-3 text-base text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#00416A]/20 resize-none"
                    autoFocus
                  />
                )}

                {current.type === "contact" && (
                  <div className="space-y-3">
                    <input
                      value={getAnswer().name}
                      onChange={e => setAnswer({ ...getAnswer(), name: e.target.value })}
                      placeholder="Vollständiger Name *"
                      autoComplete="name"
                      className="w-full border border-black/10 rounded-xl px-4 py-3.5 text-base text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
                    />
                    <input
                      value={getAnswer().phone}
                      onChange={e => setAnswer({ ...getAnswer(), phone: e.target.value })}
                      placeholder="Telefonnummer *"
                      type="tel"
                      autoComplete="tel"
                      className="w-full border border-black/10 rounded-xl px-4 py-3.5 text-base text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
                    />
                    <input
                      value={getAnswer().email}
                      onChange={e => setAnswer({ ...getAnswer(), email: e.target.value })}
                      placeholder="E-Mail-Adresse *"
                      type="email"
                      autoComplete="email"
                      className="w-full border border-black/10 rounded-xl px-4 py-3.5 text-base text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
                    />
                    <label className="flex items-start gap-3 cursor-pointer mt-2">
                      <div
                        onClick={() => setAnswer({ ...getAnswer(), consent: !getAnswer().consent })}
                        className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition ${getAnswer().consent ? "bg-[#00416A] border-[#00416A]" : "border-black/20 bg-white"}`}
                      >
                        {getAnswer().consent && <div className="w-2.5 h-2 border-b-2 border-r-2 border-white rotate-45 mb-0.5" />}
                      </div>
                      <span className="text-xs text-black/50 leading-relaxed">
                        Ich bin damit einverstanden, dass mich der Coach auf Basis meiner Angaben per Telefon oder E-Mail kontaktiert. *
                      </span>
                    </label>
                  </div>
                )}

                {current.type === "multiselect" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                      {current.options.map(opt => {
                        const sel = getAnswer().selected.includes(opt);
                        return (
                          <button key={opt} onClick={() => {
                            const cur = getAnswer();
                            const isSel = cur.selected.includes(opt);
                            setAnswer({ ...cur, selected: isSel ? cur.selected.filter(x => x !== opt) : [...cur.selected, opt] });
                          }}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition text-left ${sel ? "bg-[#00416A] text-white border-[#00416A]" : "bg-white text-black border-black/10 hover:border-[#00416A]/30"}`}>
                            <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${sel ? "bg-white border-white" : "border-black/20"}`}>
                              {sel && <div className="w-2 h-2 rounded-sm bg-[#00416A]" />}
                            </div>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      value={getAnswer().other}
                      onChange={e => setAnswer({ ...getAnswer(), other: e.target.value })}
                      placeholder="Oder eigene Antwort eingeben..."
                      className="w-full border border-black/10 rounded-xl px-4 py-3.5 text-base text-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#00416A]/20"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer — sticky at bottom */}
        {!done && (
          <div className="px-5 sm:px-6 py-4 border-t border-black/5 flex items-center justify-between flex-shrink-0 bg-white">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="flex items-center gap-2 px-4 py-3 text-sm text-black/40 hover:text-black/70 disabled:opacity-0 transition min-h-[48px]">
              <ArrowLeft className="w-4 h-4" /> Zurück
            </button>
            <button onClick={handleNext} disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-[#00416A] text-white rounded-xl text-sm font-semibold hover:bg-[#003356] disabled:opacity-30 disabled:cursor-not-allowed transition min-h-[48px]">
              {isLast ? "Absenden" : "Weiter"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}