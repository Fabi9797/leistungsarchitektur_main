import * as XLSX from 'xlsx';

/**
 * Parse a Nutrilize .xlsx export into an array of daily data rows.
 * Filters out KW: week summary rows and ∅:/Σ: prefixed values.
 */
export function parseNutrilizeFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        // Use object mode so SheetJS gives us the exact column names as keys
        const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: null });

        const parsed = [];

        for (const row of jsonRows) {
          // Resolve a column value by trying exact key first, then substring fallback
          const getVal = (exactKey, ...fallbackSubstrings) => {
            if (row[exactKey] !== undefined) return row[exactKey];
            for (const sub of fallbackSubstrings) {
              const found = Object.keys(row).find(k => k.includes(sub));
              if (found !== undefined) return row[found];
            }
            return null;
          };

          // --- Datum ---
          const datumRaw = getVal('Datum', 'datum');
          const datumStr = String(datumRaw ?? '').trim();

          // Skip week summary rows and empty rows
          if (!datumStr || datumStr === 'null' || datumStr.startsWith('KW')) continue;

          // Parse date: "19.02." or "19.02.2026"
          const dateMatch = datumStr.match(/(\d{1,2})\.(\d{1,2})\./);
          if (!dateMatch) continue;
          const parsedDate = parseDatum(datumStr);
          if (!parsedDate) continue;

          // Safe numeric getter — handles real numbers, NaN, and ∅:/Σ: strings
          const getNum = (exactKey, ...fallbacks) => {
            return parseNum(getVal(exactKey, ...fallbacks));
          };

          // Sleep: "H:MM" string or Excel decimal fraction
          const sleepRawVal = getVal('Schlafdauer', 'Schlafdauer');

          const entry = {
            date: parsedDate,
            dateLabel: datumStr,
            weight:        getNum('Körpergewicht (kg)', 'rpergewicht'),
            calories:      getNum('Kalorien (kcal)', 'Kalorien'),
            carbs:         getNum('Kohlenhydrate (g)', 'Kohlenhydrate'),
            protein:       getNum('Eiweiß (kcal)', 'wei'),
            fat:           getNum('Fett (g)', 'Fett (g)'),
            sugar:         getNum('Zucker (g)', 'Zucker'),
            saturatedFat:  getNum('Gesättigte Fetts. (g)', 'ttigte'),
            fiber:         getNum('Ballaststoffe (g)', 'Ballaststoffe'),
            salt:          getNum('Salz (g)', 'Salz'),
            activityDuration: getNum('Aktivitätsdauer (min)', 'Aktivit'),
            burnedCalories:   getNum('Verbrannte Kalorien (kcal)', 'Verbrannte'),
            bmi:           getNum('BMI', 'BMI'),
            water:         getNum('Wasserzufuhr (l)', 'Wasserzufuhr'),
            bodyFat:       getNum('Körperfettanteil (%)', 'rfettanteil'),
            hrv:           getNum('Herzfrequenz-Variabilität (HRV) (ms)', 'HRV'),
            restingHR:     getNum('Ruhepuls (bpm)', 'Ruhepuls'),
            sleepMinutes:  parseSleep(sleepRawVal),
            steps:         getNum('Schrittanzahl (Schritte)', 'Schrittanzahl'),
          };

          parsed.push(entry);
        }

        // Sort by date ascending
        parsed.sort((a, b) => new Date(a.date) - new Date(b.date));
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseDatum(str) {
  if (!str) return null;
  // Format: "19.02." or "19.02.2026"
  const match = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})?/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3] || 2026;
    return `${year}-${month}-${day}`;
  }
  return null;
}

function parseNum(val) {
  if (val == null || val === '' || val === 'NaN') return null;
  if (typeof val === 'string') {
    const str = val.trim();
    if (str.startsWith('∅:') || str.startsWith('Σ:') || str.startsWith('∅') || str.startsWith('Σ')) return null;
    const num = parseFloat(str.replace(',', '.'));
    return isNaN(num) ? null : num;
  }
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  return null;
}

function parseSleep(val) {
  if (!val && val !== 0) return null;
  const str = String(val).trim();
  // Format "7:21"
  const match = str.match(/^(\d+):(\d{2})$/);
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2]);
  }
  // Maybe it's a decimal hours value from Excel
  const n = parseFloat(str.replace(',', '.'));
  if (!isNaN(n) && n > 0) return Math.round(n * 60);
  return null;
}

export function formatSleep(minutes) {
  if (minutes === null || minutes === undefined) return '–';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** Calculate 7-day moving average for an array of values (with nulls) */
export function movingAverage(data, key, window = 7) {
  return data.map((_, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1).map(d => d[key]).filter(v => v !== null && v !== undefined && !isNaN(v));
    if (slice.length === 0) return null;
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

/** Detect anomalies: null values or values > 2 std devs from mean */
export function detectAnomalies(values) {
  const valid = values.filter(v => v !== null && !isNaN(v) && v !== 0);
  if (valid.length === 0) return values.map(() => false);
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  const std = Math.sqrt(valid.reduce((a, b) => a + (b - mean) ** 2, 0) / valid.length);
  return values.map(v => {
    if (v === null || v === undefined || isNaN(v)) return true;
    if (v === 0) return true;
    if (std > 0 && Math.abs(v - mean) > 2 * std) return true;
    return false;
  });
}

/** Clean average: average excluding anomaly days */
export function cleanAverage(values, anomalies) {
  const clean = values.filter((v, i) => !anomalies[i] && v !== null && !isNaN(v));
  if (clean.length === 0) return null;
  return clean.reduce((a, b) => a + b, 0) / clean.length;
}

/** Calculate dummy value for an anomaly day: avg of 3 surrounding days on each side */
export function calculateDummy(values, index, anomalies) {
  const neighbors = [];
  for (let offset = 1; offset <= 3; offset++) {
    if (index - offset >= 0 && !anomalies[index - offset] && values[index - offset] !== null) {
      neighbors.push(values[index - offset]);
    }
    if (index + offset < values.length && !anomalies[index + offset] && values[index + offset] !== null) {
      neighbors.push(values[index + offset]);
    }
  }
  if (neighbors.length === 0) return null;
  return neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
}