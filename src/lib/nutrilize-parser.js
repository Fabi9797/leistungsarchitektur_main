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
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        // Find header row
        let headerIdx = -1;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.some(cell => String(cell).includes('Datum') || String(cell).includes('Körpergewicht'))) {
            headerIdx = i;
            break;
          }
        }

        if (headerIdx === -1) {
          // Try first row as header
          headerIdx = 0;
        }

        const headers = rows[headerIdx].map(h => String(h).trim());
        const parsed = [];

        for (let i = headerIdx + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const datum = String(row[0] || '').trim();
          if (!datum) continue;
          // Skip week summary rows
          if (datum.startsWith('KW') || datum.startsWith('∅') || datum.startsWith('Σ')) continue;

          const obj = {};
          headers.forEach((h, idx) => {
            obj[h] = row[idx] !== undefined ? row[idx] : '';
          });

          // Parse date: "19.02." format — add current year
          const dateStr = String(obj['Datum'] || '').trim();
          if (!dateStr || dateStr.startsWith('KW') || dateStr.startsWith('∅') || dateStr.startsWith('Σ')) continue;

          const parsedDate = parseDatum(dateStr);
          if (!parsedDate) continue;

          const entry = {
            date: parsedDate,
            dateLabel: dateStr,
            weight: parseNum(obj['Körpergewicht']),
            calories: parseNum(obj['Kalorien']),
            carbs: parseNum(obj['Kohlenhydrate']),
            protein: parseNum(obj['Eiweiß']),
            fat: parseNum(obj['Fett']),
            sugar: parseNum(obj['Zucker']),
            saturatedFat: parseNum(obj['Gesättigte Fetts.']),
            fiber: parseNum(obj['Ballaststoffe']),
            salt: parseNum(obj['Salz']),
            activityDuration: parseNum(obj['Aktivitätsdauer']),
            burnedCalories: parseNum(obj['Verbrannte Kalorien']),
            bmi: parseNum(obj['BMI']),
            water: parseNum(obj['Wasserzufuhr']),
            bodyFat: parseNum(obj['Körperfettanteil']),
            hrv: parseNum(obj['Herzfrequenz-Variabilität (HRV)']),
            restingHR: parseNum(obj['Ruhepuls']),
            sleepRaw: String(obj['Schlafdauer'] || '').trim(),
            sleepMinutes: parseSleep(obj['Schlafdauer']),
            steps: parseNum(obj['Schrittanzahl']),
          };

          parsed.push(entry);
        }

        // Sort by date
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
  const match = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})?$/);
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year = match[3] || new Date().getFullYear();
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