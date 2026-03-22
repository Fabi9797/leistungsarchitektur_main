import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { parseNutrilizeFile, detectAnomalies, cleanAverage, calculateDummy } from '@/lib/nutrilize-parser';

function calcTrend(values) {
  if (values.length < 14) return 'Stabil';
  const firstWeek = values.slice(0, 7).filter(v => v !== null);
  const lastWeek = values.slice(-7).filter(v => v !== null);
  if (!firstWeek.length || !lastWeek.length) return 'Stabil';
  const first = firstWeek.reduce((a, b) => a + b, 0) / firstWeek.length;
  const last = lastWeek.reduce((a, b) => a + b, 0) / lastWeek.length;
  if (last > first * 1.02) return 'Steigend';
  if (last < first * 0.98) return 'Fallend';
  return 'Stabil';
}

function autoFillFromData(data) {
  if (!data.length) return {};

  const clean = (key) => {
    const vals = data.map(d => d[key]);
    const anomalies = detectAnomalies(vals);
    return cleanAverage(vals, anomalies);
  };

  const weights = data.map(d => d.weight).filter(v => v !== null && v > 0);
  const bodyFats = data.map(d => d.bodyFat).filter(v => v !== null && v > 0);
  const hrvVals = data.map(d => d.hrv);
  const restingVals = data.map(d => d.restingHR);

  const toSeries = (key) => data
    .filter(d => d[key] !== null && d[key] > 0)
    .map(d => ({ date: d.date, value: d[key] }));

  return {
    kalorien_avg: clean('calories') ? Math.round(clean('calories')) : '',
    protein_avg: clean('protein') ? Math.round(clean('protein')) : '',
    hrv_avg: clean('hrv') ? Math.round(clean('hrv')) : '',
    ruhepuls_avg: clean('restingHR') ? Math.round(clean('restingHR')) : '',
    schlafdauer_avg: (() => {
      const avg = clean('sleepMinutes');
      return avg ? (avg / 60).toFixed(1) : '';
    })(),
    gewicht_start: weights.length ? weights[0] : '',
    gewicht_end: weights.length ? weights[weights.length - 1] : '',
    kfa_start: bodyFats.length ? bodyFats[0] : '',
    kfa_end: bodyFats.length ? bodyFats[bodyFats.length - 1] : '',
    hrv_trend: calcTrend(hrvVals),
    ruhepuls_trend: calcTrend(restingVals),
    gewicht_verlauf_json: JSON.stringify(toSeries('weight')),
    hrv_verlauf_json: JSON.stringify(toSeries('hrv')),
    ruhepuls_verlauf_json: JSON.stringify(toSeries('restingHR')),
  };
}

export default function NutrilizeImport({ update, parsedData, setParsedData, dateFrom, setDateFrom, dateTo, setDateTo }) {
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await parseNutrilizeFile(file);
      setFileName(file.name);
      setParsedData(data);
      if (data.length > 0) {
        setDateFrom(data[0].date);
        setDateTo(data[data.length - 1].date);
        // Auto-fill report fields
        const autoFilled = autoFillFromData(data);
        update(autoFilled);
      }
    } catch (err) {
      alert('Fehler beim Einlesen: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [update, setParsedData, setDateFrom, setDateTo]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const clear = () => {
    setFileName('');
    setParsedData([]);
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !fileName && document.getElementById('nutrilize-xlsx').click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          isDragging ? 'border-[#00416A] bg-[#00416A]/5' :
          fileName ? 'border-[#00416A]/20 bg-white' :
          'border-black/10 bg-white hover:border-[#00416A]/30 cursor-pointer'
        }`}
      >
        <input id="nutrilize-xlsx" type="file" accept=".xlsx,.xls" className="hidden"
          onChange={e => handleFile(e.target.files[0])} />

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-black/40">
            <div className="w-5 h-5 border-2 border-[#00416A] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Datei wird verarbeitet...</span>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-[#00416A]" />
              <div className="text-left">
                <p className="text-black text-sm font-medium">{fileName}</p>
                <p className="text-[#00416A] text-xs font-semibold">{parsedData.length} Tage geladen</p>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); clear(); }}
              className="text-black/20 hover:text-red-500 transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-7 h-7 text-black/20 mx-auto mb-2" />
            <p className="text-black/50 text-sm">Nutrilize Export (.xlsx) ablegen oder klicken</p>
          </>
        )}
      </div>

      {/* Date range */}
      {parsedData.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-black/40 text-xs block mb-1.5">Von</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-black text-sm outline-none focus:border-[#00416A]/50" />
          </div>
          <div>
            <label className="text-black/40 text-xs block mb-1.5">Bis</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-black text-sm outline-none focus:border-[#00416A]/50" />
          </div>
        </div>
      )}

      {parsedData.length > 0 && (
        <div className="bg-[#3ecf8e]/10 border border-[#3ecf8e]/20 rounded-xl px-4 py-3">
          <p className="text-[#3ecf8e] text-xs font-semibold">✓ Felder automatisch befüllt</p>
          <p className="text-white/40 text-xs mt-0.5">Körper-, Vital- und Ernährungsdaten wurden aus dem Import übernommen. Bitte im nächsten Tab prüfen.</p>
        </div>
      )}
    </div>
  );
}