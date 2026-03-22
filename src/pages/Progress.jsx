import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, FileText, ChevronRight, Trash2, Upload, FileSpreadsheet, X, Save, ArrowLeft, BarChart2 } from "lucide-react";
import { parseNutrilizeFile, detectAnomalies, cleanAverage, formatSleep } from "@/lib/nutrilize-parser";
import { parseTrainingFile } from "@/lib/training-parser";
import ReportAnalysis from "@/components/progress-report/ReportAnalysis";

const LOGO_URL = "https://media.base44.com/images/public/69b064c89953b727c5202e21/a128f5dab_ChatGPTImage19Marz202616_44_51.png";
const MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

// ── Helpers ────────────────────────────────────────────────────────────────────
function autoFillFromData(data) {
  const clean = (key) => {
    const vals = data.map(d => d[key]);
    const anom = detectAnomalies(vals);
    return cleanAverage(vals, anom);
  };
  const weights = data.map(d => d.weight).filter(v => v > 0);
  const bodyFats = data.map(d => d.bodyFat).filter(v => v > 0);
  const hrvVals = data.map(d => d.hrv);
  const rhrVals = data.map(d => d.restingHR);

  const calcTrend = (vals) => {
    const valid = vals.filter(v => v !== null && v > 0);
    if (valid.length < 8) return 'Stabil';
    const f = valid.slice(0, Math.min(7, Math.floor(valid.length / 2)));
    const l = valid.slice(-Math.min(7, Math.floor(valid.length / 2)));
    const af = f.reduce((a, b) => a + b, 0) / f.length;
    const al = l.reduce((a, b) => a + b, 0) / l.length;
    if (al > af * 1.02) return 'Steigend';
    if (al < af * 0.98) return 'Fallend';
    return 'Stabil';
  };

  const toSeries = (key) => data.filter(d => d[key] > 0).map(d => ({ date: d.date, value: d[key] }));

  const avgSleep = clean('sleepMinutes');

  return {
    kalorien_avg: clean('calories') ? Math.round(clean('calories')) : undefined,
    protein_avg: clean('protein') ? Math.round(clean('protein')) : undefined,
    hrv_avg: clean('hrv') ? Math.round(clean('hrv')) : undefined,
    ruhepuls_avg: clean('restingHR') ? Math.round(clean('restingHR')) : undefined,
    schlafdauer_avg: avgSleep ? parseFloat((avgSleep / 60).toFixed(1)) : undefined,
    gewicht_start: weights.length ? weights[0] : undefined,
    gewicht_end: weights.length ? weights[weights.length - 1] : undefined,
    kfa_start: bodyFats.length ? bodyFats[0] : undefined,
    kfa_end: bodyFats.length ? bodyFats[bodyFats.length - 1] : undefined,
    hrv_trend: calcTrend(hrvVals),
    ruhepuls_trend: calcTrend(rhrVals),
    gewicht_verlauf_json: JSON.stringify(toSeries('weight')),
    hrv_verlauf_json: JSON.stringify(toSeries('hrv')),
    ruhepuls_verlauf_json: JSON.stringify(toSeries('restingHR')),
  };
}

// ── DropZone ──────────────────────────────────────────────────────────────────
function DropZone({ label, onFile, fileName, loading, onClear }) {
  const [drag, setDrag] = useState(false);
  const inputRef = React.useRef(null);
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
      onClick={() => !fileName && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
        drag ? 'border-[#00416A] bg-[#00416A]/5' :
        fileName ? 'border-[#00416A]/20 bg-[#F0EAD6]/40' :
        'border-black/10 bg-white hover:border-[#00416A]/30 cursor-pointer'
      }`}
    >
      <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => onFile(e.target.files[0])} />
      {loading ? (
        <div className="flex items-center justify-center gap-2 text-black/40">
          <div className="w-4 h-4 border-2 border-[#00416A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Verarbeitung...</span>
        </div>
      ) : fileName ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#00416A]" />
            <div className="text-left">
              <p className="text-black text-xs font-medium truncate max-w-[150px]">{fileName}</p>
              <p className="text-[#00416A] text-xs font-semibold">✓ geladen</p>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onClear(); }} className="text-black/20 hover:text-red-500 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <Upload className="w-6 h-6 text-black/20 mx-auto mb-2" />
          <p className="text-black/50 text-xs font-medium">{label}</p>
          <p className="text-black/30 text-xs mt-0.5">drag & drop oder klicken</p>
        </>
      )}
    </div>
  );
}

// ── Slider ─────────────────────────────────────────────────────────────────────
function LevelSlider({ label, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-white/50 text-xs">{label}</label>
        <span className="font-mono text-[#3ecf8e] font-bold text-sm">{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full accent-[#3ecf8e]" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function Progress() {
  const [reports, setReports] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'editor'
  const [currentReport, setCurrentReport] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Editor state
  const [formData, setFormData] = useState({});
  const [nutriData, setNutriData] = useState([]);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [nutriFile, setNutriFile] = useState('');
  const [trainFile, setTrainFile] = useState('');
  const [nutriLoading, setNutriLoading] = useState(false);
  const [trainLoading, setTrainLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [notes, setNotes] = useState({});
  const [showAnalysis, setShowAnalysis] = useState(false);

  // New report form
  const [newClientId, setNewClientId] = useState('');
  const [newMonth, setNewMonth] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.MonthlyReport.list('-report_month'),
      base44.entities.ClientProfile.list(),
    ]).then(([r, c]) => { setReports(r); setClients(c); setLoading(false); });
  }, []);

  const fetchReports = async () => {
    const r = await base44.entities.MonthlyReport.list('-report_month');
    setReports(r);
  };

  const update = (fields) => setFormData(prev => ({ ...prev, ...fields }));

  const openReport = async (report) => {
    setCurrentReport(report);
    setFormData({ ...report });
    setNutriData([]);
    setTrainingSessions([]);
    setNutriFile('');
    setTrainFile('');
    setDateFrom('');
    setDateTo('');
    setNotes({});
    setShowAnalysis(false);
    setView('editor');
    if (report.client_id) {
      base44.entities.ClientProfile.filter({ id: report.client_id }).then(r => {
        if (r?.length) setClientProfile(r[0]);
      }).catch(() => {});
    }
  };

  const createNew = async () => {
    if (!newClientId || !newMonth) return;
    const client = clients.find(c => c.id === newClientId);
    const [year, month] = newMonth.split('-');
    const label = `${MONTHS[parseInt(month) - 1]} ${year}`;
    const report = await base44.entities.MonthlyReport.create({
      client_id: newClientId,
      client_name: client?.name || '',
      report_month: newMonth,
      report_label: label,
    });
    await fetchReports();
    setShowNewForm(false);
    openReport(report);
  };

  const handleSave = async () => {
    if (!currentReport?.id) return;
    setSaving(true);
    const numFields = ['gewicht_start','gewicht_end','kfa_start','kfa_end','hrv_avg','ruhepuls_avg','schlafdauer_avg','kalorien_avg','protein_avg','energie_vorher','energie_nachher','gesamtbewertung','training_compliance','ernaehrung_compliance','supplement_compliance'];
    const cleaned = { ...formData };
    numFields.forEach(f => {
      if (cleaned[f] === '' || cleaned[f] === null || cleaned[f] === undefined) { delete cleaned[f]; return; }
      const n = parseFloat(cleaned[f]);
      if (isNaN(n)) delete cleaned[f]; else cleaned[f] = n;
    });
    await base44.entities.MonthlyReport.update(currentReport.id, cleaned);
    await fetchReports();
    setSaving(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Bericht löschen?')) return;
    await base44.entities.MonthlyReport.delete(id);
    fetchReports();
  };

  const handleNutriFile = async (file) => {
    if (!file) return;
    setNutriLoading(true);
    try {
      const parsed = await parseNutrilizeFile(file);
      setNutriFile(file.name);
      setNutriData(parsed);
      if (parsed.length) {
        setDateFrom(parsed[0].date);
        setDateTo(parsed[parsed.length - 1].date);
        const filled = autoFillFromData(parsed);
        update(filled);
      }
    } catch (err) { alert('Fehler: ' + err.message); }
    setNutriLoading(false);
  };

  const handleTrainFile = async (file) => {
    if (!file) return;
    setTrainLoading(true);
    try {
      const { sessions } = await parseTrainingFile(file);
      setTrainFile(file.name);
      setTrainingSessions(sessions);
    } catch (err) { alert('Fehler: ' + err.message); }
    setTrainLoading(false);
  };

  const filteredNutri = useMemo(() => {
    if (!nutriData.length) return [];
    return nutriData.filter(d => {
      if (dateFrom && d.date < dateFrom) return false;
      if (dateTo && d.date > dateTo) return false;
      return true;
    });
  }, [nutriData, dateFrom, dateTo]);

  const handleNoteChange = useCallback((key, noteData) => {
    setNotes(prev => {
      if (noteData === null) { const n = { ...prev }; delete n[key]; return n; }
      return { ...prev, [key]: noteData };
    });
  }, []);

  const grouped = reports.reduce((acc, r) => {
    const k = r.client_name || 'Unbekannt';
    if (!acc[k]) acc[k] = [];
    acc[k].push(r);
    return acc;
  }, {});

  // ── LIST VIEW ────────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-[#07070f]">
        <div className="bg-[#0f0f1a] border-b border-white/8 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="" className="w-8 h-8 rounded-lg object-contain" />
            <div>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Leistungsarchitektur</p>
              <h1 className="text-white font-bold text-lg">Monatsreports</h1>
            </div>
          </div>
          <button onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3ecf8e] text-black font-semibold rounded-lg hover:bg-[#2ebd7e] transition-all text-sm">
            <Plus className="w-4 h-4" /> Neuer Bericht
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* New report form */}
          {showNewForm && (
            <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-5 mb-6">
              <h3 className="text-white font-semibold text-sm mb-4">Neuen Bericht erstellen</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-white/40 text-xs block mb-1.5">Klient</label>
                  <select value={newClientId} onChange={e => setNewClientId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#3ecf8e]/50">
                    <option value="">— wählen —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs block mb-1.5">Monat</label>
                  <input type="month" value={newMonth} onChange={e => setNewMonth(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#3ecf8e]/50" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowNewForm(false)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white/40 hover:text-white text-sm transition-colors">
                  Abbrechen
                </button>
                <button onClick={createNew} disabled={!newClientId || !newMonth}
                  className="flex-1 py-2 rounded-lg bg-[#3ecf8e] text-black font-semibold text-sm hover:bg-[#2ebd7e] transition-colors disabled:opacity-40">
                  Erstellen
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-white/10 border-t-[#3ecf8e] rounded-full animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-sm">Noch keine Berichte. Erstelle deinen ersten!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(grouped).map(([clientName, clientReports]) => (
                <div key={clientName}>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">{clientName}</p>
                  <div className="space-y-2">
                    {clientReports.map(r => (
                      <div key={r.id} onClick={() => openReport(r)}
                        className="flex items-center justify-between bg-[#0f0f1a] border border-white/8 rounded-xl px-5 py-4 hover:border-white/15 cursor-pointer transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#3ecf8e]/10 flex items-center justify-center">
                            <span className="text-[#3ecf8e] font-bold text-sm font-mono">{r.gesamtbewertung || '–'}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{r.report_label || r.report_month}</p>
                            <p className="text-white/30 text-xs mt-0.5">
                              {r.gewicht_start && r.gewicht_end
                                ? `${r.gewicht_start} → ${r.gewicht_end} kg`
                                : r.kalorien_avg ? `Ø ${r.kalorien_avg} kcal` : 'Keine Daten'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={e => handleDelete(r.id, e)} className="text-white/15 hover:text-red-400 transition-colors p-1.5">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EDITOR VIEW ────────────────────────────────────────────────────────────
  if (view === 'editor' && showAnalysis && filteredNutri.length > 0) {
    return (
      <div className="min-h-screen bg-[#07070f]">
        <div className="bg-[#0f0f1a] border-b border-white/8 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAnalysis(false)}
              className="text-white/40 hover:text-white transition-colors p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-white/30 text-xs">Analyse</p>
              <h1 className="text-white font-bold">{formData.client_name} · {formData.report_label}</h1>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#3ecf8e] text-black font-semibold rounded-lg text-sm disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <ReportAnalysis
            nutriData={filteredNutri}
            trainingSessions={trainingSessions}
            clientProfile={clientProfile}
            notes={notes}
            onNoteChange={handleNoteChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070f]">
      {/* Header */}
      <div className="bg-[#0f0f1a] border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-white/30 text-xs">Monatsreport bearbeiten</p>
            <h1 className="text-white font-bold">{formData.client_name} · {formData.report_label}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {filteredNutri.length > 0 && (
            <button onClick={() => setShowAnalysis(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[#3ecf8e] rounded-lg text-sm font-semibold hover:bg-[#3ecf8e]/10 transition-all">
              <BarChart2 className="w-4 h-4" /> Analyse öffnen
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#3ecf8e] text-black font-semibold rounded-lg text-sm disabled:opacity-50 hover:bg-[#2ebd7e] transition-colors">
            <Save className="w-4 h-4" /> {saving ? '...' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* File uploads */}
        <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-5">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Nutrilize Exporte</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <DropZone
              label="Ernährungs-Export (.xlsx)"
              onFile={handleNutriFile}
              fileName={nutriFile}
              loading={nutriLoading}
              onClear={() => { setNutriFile(''); setNutriData([]); }}
            />
            <DropZone
              label="Trainings-Export (.xlsx)"
              onFile={handleTrainFile}
              fileName={trainFile}
              loading={trainLoading}
              onClear={() => { setTrainFile(''); setTrainingSessions([]); }}
            />
          </div>

          {/* Date range */}
          {nutriData.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/30 text-xs block mb-1.5">Analysezeitraum Von</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#3ecf8e]/50" />
              </div>
              <div>
                <label className="text-white/30 text-xs block mb-1.5">Bis</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#3ecf8e]/50" />
              </div>
            </div>
          )}

          {nutriData.length > 0 && (
            <div className="mt-3 flex items-center justify-between bg-[#3ecf8e]/8 border border-[#3ecf8e]/15 rounded-xl px-4 py-2.5">
              <p className="text-[#3ecf8e] text-xs">{filteredNutri.length} Tage im Zeitraum · Felder automatisch befüllt</p>
              {filteredNutri.length > 0 && (
                <button onClick={() => setShowAnalysis(true)}
                  className="text-[#3ecf8e] text-xs font-semibold hover:underline">
                  Analyse öffnen →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Manual inputs */}
        <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-5">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-4">Wahrnehmung & Bewertung</p>
          <div className="space-y-4">
            <LevelSlider label="Energielevel vorher" value={formData.energie_vorher || 5}
              onChange={v => update({ energie_vorher: v })} />
            <LevelSlider label="Energielevel nachher" value={formData.energie_nachher || 5}
              onChange={v => update({ energie_nachher: v })} />
          </div>
        </div>

        {/* Coach inputs */}
        <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-5 space-y-4">
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">Coach-Eingaben</p>
          <div>
            <label className="text-white/40 text-xs block mb-1.5">Highlight des Monats</label>
            <input value={formData.highlight_des_monats || ''} onChange={e => update({ highlight_des_monats: e.target.value })}
              placeholder="Größtes Ergebnis oder Erfolgsmoment..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#3ecf8e]/50" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1.5">Coach-Kommentar</label>
            <textarea value={formData.coach_kommentar || ''} onChange={e => update({ coach_kommentar: e.target.value })}
              rows={4} placeholder="Qualitative Gesamteinschätzung..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#3ecf8e]/50 resize-none" />
          </div>
          <div>
            <label className="text-white/40 text-xs block mb-1.5">Fokus nächster Monat</label>
            <textarea value={formData.fokus_naechster_monat || ''} onChange={e => update({ fokus_naechster_monat: e.target.value })}
              rows={3} placeholder="2-3 Prioritäten für den nächsten Monat..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#3ecf8e]/50 resize-none" />
          </div>

          {/* Rating */}
          <div>
            <label className="text-white/40 text-xs block mb-2">Gesamtbewertung (1–10)</label>
            <div className="flex gap-1.5">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => update({ gesamtbewertung: n })}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    n <= (formData.gesamtbewertung || 0) ? 'bg-[#3ecf8e] text-black' : 'bg-white/5 text-white/25 hover:bg-white/10'
                  }`}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-filled fields preview */}
        {(formData.kalorien_avg || formData.gewicht_start) && (
          <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl p-5">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3">Auto-befüllte Daten (aus Import)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { l: 'Gewicht Start', v: formData.gewicht_start, u: 'kg' },
                { l: 'Gewicht Ende', v: formData.gewicht_end, u: 'kg' },
                { l: 'Ø Kalorien', v: formData.kalorien_avg, u: 'kcal' },
                { l: 'Ø Protein', v: formData.protein_avg, u: 'g' },
                { l: 'Ø HRV', v: formData.hrv_avg, u: 'ms' },
                { l: 'Ø Ruhepuls', v: formData.ruhepuls_avg, u: 'bpm' },
                { l: 'Ø Schlaf', v: formData.schlafdauer_avg, u: 'h' },
                { l: 'KFA Start', v: formData.kfa_start, u: '%' },
              ].filter(x => x.v !== undefined && x.v !== null && x.v !== '').map((x, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                  <p className="text-white/30 text-xs">{x.l}</p>
                  <p className="text-white font-mono font-bold text-sm mt-0.5">{x.v} <span className="text-white/30 text-xs">{x.u}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}