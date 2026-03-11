export function generateDefaultWeeks() {
  const weeks = [];

  weeks.push({
    week: 0,
    phase: "Vorbereitung",
    note: "",
    groups: [
      {
        name: "Onboarding",
        tasks: [
          { id: "w0_1", label: "Onboarding durchgeführt", status: "offen", note: "", date: "" },
        ]
      },
      {
        name: "Tools einrichten",
        tasks: [
          { id: "w0_2", label: "Withings Waage eingerichtet", status: "offen", note: "", date: "" },
          { id: "w0_3", label: "Helio Strap eingerichtet", status: "offen", note: "", date: "" },
          { id: "w0_4", label: "Tracking Apps eingerichtet", status: "offen", note: "", date: "" },
        ]
      },
      {
        name: "Tracking erklären",
        tasks: [
          { id: "w0_5", label: "Nutrilize Tracking erklärt", status: "offen", note: "", date: "" },
          { id: "w0_6", label: "Kalorien-Tracking erklärt", status: "offen", note: "", date: "" },
          { id: "w0_7", label: "Protein-Tracking erklärt", status: "offen", note: "", date: "" },
        ]
      },
      {
        name: "Startwerte festhalten",
        tasks: [
          { id: "w0_8", label: "Startwert: Gewicht", status: "offen", note: "", date: "" },
          { id: "w0_9", label: "Startwert: Körperfett", status: "offen", note: "", date: "" },
          { id: "w0_10", label: "Startwert: Ruhepuls", status: "offen", note: "", date: "" },
          { id: "w0_11", label: "Startwert: HRV", status: "offen", note: "", date: "" },
        ]
      },
      {
        name: "Coachingstruktur erklären",
        tasks: [
          { id: "w0_12", label: "Trainingssystem erklärt", status: "offen", note: "", date: "" },
          { id: "w0_13", label: "Ernährungsrahmen erklärt", status: "offen", note: "", date: "" },
          { id: "w0_14", label: "Wochenstruktur erklärt", status: "offen", note: "", date: "" },
          { id: "w0_15", label: "Fact Sheet erstellt & versendet", status: "offen", note: "", date: "" },
        ]
      }
    ]
  });

  const phaseNames = {
    1: "Phase 1 – Fundament", 2: "Phase 1 – Fundament", 3: "Phase 1 – Fundament", 4: "Phase 1 – Fundament",
    5: "Phase 2 – Aufbau", 6: "Phase 2 – Aufbau", 7: "Phase 2 – Aufbau", 8: "Phase 2 – Aufbau",
    9: "Phase 3 – Optimierung", 10: "Phase 3 – Optimierung", 11: "Phase 3 – Optimierung", 12: "Phase 3 – Optimierung",
    13: "Phase 4 – Konsolidierung", 14: "Phase 4 – Konsolidierung", 15: "Phase 4 – Konsolidierung", 16: "Phase 4 – Konsolidierung",
  };

  for (let w = 1; w <= 16; w++) {
    weeks.push({
      week: w,
      phase: phaseNames[w],
      note: "",
      groups: [
        {
          name: "Montag",
          tasks: [
            { id: `w${w}_m1`, label: "Motivationsnachricht gesendet", status: "offen", note: "", date: "" },
            { id: `w${w}_m2`, label: "Fokus der Woche kommuniziert", status: "offen", note: "", date: "" },
            { id: `w${w}_m3`, label: "Wichtigste Aufgabe definiert", status: "offen", note: "", date: "" },
          ]
        },
        {
          name: "Mittwoch – Wochenreview",
          tasks: [
            { id: `w${w}_w1`, label: "Kalorienziel überprüft", status: "offen", note: "", date: "" },
            { id: `w${w}_w2`, label: "Proteinziel überprüft", status: "offen", note: "", date: "" },
            { id: `w${w}_w3`, label: "Trainings überprüft", status: "offen", note: "", date: "" },
            { id: `w${w}_w4`, label: "Gewichtsentwicklung notiert", status: "offen", note: "", date: "" },
          ]
        },
        {
          name: "Freitag – Reflexions-Call",
          tasks: [
            { id: `w${w}_f1`, label: "Reflexions-Call durchgeführt", status: "offen", note: "", date: "" },
            { id: `w${w}_f2`, label: "Woche reflektiert", status: "offen", note: "", date: "" },
            { id: `w${w}_f3`, label: "Probleme identifiziert", status: "offen", note: "", date: "" },
            { id: `w${w}_f4`, label: "Nächsten Fokus definiert", status: "offen", note: "", date: "" },
            { id: `w${w}_f5`, label: "Anpassungen vorgenommen (falls nötig)", status: "offen", note: "", date: "" },
          ]
        }
      ]
    });
  }

  return weeks;
}

export const STATUS_CONFIG = {
  offen:      { label: "Offen",      color: "bg-gray-100 text-gray-500",    dot: "bg-gray-300"  },
  erledigt:   { label: "Erledigt",   color: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  verschoben: { label: "Verschoben", color: "bg-amber-100 text-amber-700",  dot: "bg-amber-400" },
  problem:    { label: "Problem",    color: "bg-red-100 text-red-700",      dot: "bg-red-500"   },
};

export const STATUS_CYCLE = ["offen", "erledigt", "verschoben", "problem"];