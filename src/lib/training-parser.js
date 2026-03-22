import * as XLSX from 'xlsx';

/**
 * Parse a Nutrilize Training export Excel file.
 * Returns: { sessions: [{date, type, exercises: {name: {sets: [{weight,reps,e1rm}], bestE1RM}}}], summary }
 */
export function parseTrainingFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        if (!rows.length) { resolve({ sessions: [] }); return; }

        // First row = headers
        const headers = rows[0].map(h => String(h).trim());

        // Find exercise columns: skip first col ("Übung/Satz") and "Unnamed:*"
        // Each exercise has 6 consecutive columns: Gew., Wdh., Dauer, Watt, Stufe, E1RM
        const exerciseGroups = [];
        let i = 1;
        while (i < headers.length) {
          const h = headers[i];
          if (!h || h.startsWith('Unnamed:')) { i++; continue; }
          // This is an exercise name — next 6 cols are its metrics
          exerciseGroups.push({ name: h, startCol: i });
          i += 6;
        }

        const sessions = [];
        let currentSession = null;

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          const firstCell = String(row[0] || '').trim();
          if (!firstCell) continue;

          // Session header row: "Einheit: GK 2 19.03." or "Einheit: LISS  20.03."
          if (firstCell.startsWith('Einheit:')) {
            const rest = firstCell.replace('Einheit:', '').trim();
            // Extract date: last token matching DD.MM. or DD.MM.YYYY
            const dateMatch = rest.match(/(\d{1,2})\.(\d{2})\.(\d{4})?/);
            let date = null;
            if (dateMatch) {
              const day = dateMatch[1].padStart(2, '0');
              const month = dateMatch[2].padStart(2, '0');
              const year = dateMatch[3] || new Date().getFullYear();
              date = `${year}-${month}-${day}`;
            }
            const typeMatch = rest.replace(/\d{1,2}\.\d{2}\.(\d{4})?/, '').trim();
            const sessionType = typeMatch.trim() || 'Training';

            currentSession = { date, type: sessionType, exercises: {} };
            sessions.push(currentSession);
            continue;
          }

          // Set row: "1. Satz", "2. Satz", etc.
          if (currentSession && /^\d+\.\s*Satz/.test(firstCell)) {
            for (const eg of exerciseGroups) {
              const colBase = eg.startCol;
              const weight = parseTrainNum(row[colBase]);
              const reps = parseTrainNum(row[colBase + 1]);
              const e1rm = parseTrainNum(row[colBase + 5]);

              if (e1rm === null && weight === null) continue;

              if (!currentSession.exercises[eg.name]) {
                currentSession.exercises[eg.name] = { sets: [], bestE1RM: null };
              }
              const setData = { weight, reps, e1rm };
              currentSession.exercises[eg.name].sets.push(setData);

              if (e1rm !== null) {
                const ex = currentSession.exercises[eg.name];
                ex.bestE1RM = ex.bestE1RM === null ? e1rm : Math.max(ex.bestE1RM, e1rm);
              }
            }
          }
        }

        // Filter sessions that have at least some data
        const validSessions = sessions.filter(s => s.date && Object.keys(s.exercises).length > 0);

        resolve({ sessions: validSessions });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseTrainNum(val) {
  if (val === '' || val === null || val === undefined) return null;
  const str = String(val).replace(',', '.').replace(/[^\d.-]/g, '');
  const n = parseFloat(str);
  return isNaN(n) ? null : n;
}

/**
 * Build per-exercise E1RM progression data from sessions.
 * Returns array of { name, dataPoints: [{date, e1rm, sessionType}], progressPct }
 */
export function buildExerciseProgression(sessions) {
  const byExercise = {};

  for (const session of sessions) {
    for (const [exName, exData] of Object.entries(session.exercises)) {
      if (exData.bestE1RM === null) continue;
      if (!byExercise[exName]) byExercise[exName] = [];
      byExercise[exName].push({
        date: session.date,
        e1rm: exData.bestE1RM,
        sessionType: session.type,
      });
    }
  }

  return Object.entries(byExercise)
    .map(([name, points]) => {
      points.sort((a, b) => new Date(a.date) - new Date(b.date));
      const first = points[0]?.e1rm;
      const last = points[points.length - 1]?.e1rm;
      const progressPct = first && last ? ((last - first) / first * 100) : 0;
      return { name, dataPoints: points, progressPct };
    })
    .filter(e => e.dataPoints.length >= 2)
    .sort((a, b) => b.dataPoints.length - a.dataPoints.length);
}