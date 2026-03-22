import React, { useState, useCallback, useMemo } from 'react';
import { Upload, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import { parseNutrilizeFile } from '@/lib/nutrilize-parser';
import MetricChart from '@/components/progress-report/MetricChart';
import MacroChart from '@/components/progress-report/MacroChart';
import OverviewTab from '@/components/progress-report/OverviewTab';

const TABS = ['Übersicht', 'Ernährung', 'Körper', 'Aktivität', 'Erholung'];

const COLORS = {
  calories: '#3ecf8e',
  protein: '#3ecf8e',
  weight: '#6c5ce7',
  steps: '#f39c12',
  sleepMinutes: '#74b9ff',
  hrv: '#a29bfe',
  restingHR: '#fd79a8',
  fiber: '#00b894',
  sugar: '#fdcb6e',
  burnedCalories: '#e74c3c',
  activityDuration: '#00cec9',
  bodyFat: '#6c5ce7',
  bmi: '#a29bfe',
  carbs: '#f39c12',
  fat: '#e74c3c',
};

export default function ProgressReport() {
  const [rawData, setRawData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [configOpen, setConfigOpen] = useState(false);
  const [notes, setNotes] = useState({});

  // Config
  const [clientName, setClientName] = useState('');
  const [targets, setTargets] = useState({ calories: '', protein: '', weight: '', steps: '', sleep: '' });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const parsed = await parseNutrilizeFile(file);
      setRawData(parsed);
      setFileName(file.name);
      if (parsed.length > 0) {
        setDateFrom(parsed[0].date);
        setDateTo(parsed[parsed.length - 1].date);
      }
    } catch (err) {
      alert('Fehler beim Einlesen der Datei: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const filteredData = useMemo(() => {
    if (!rawData.length) return [];
    return rawData.filter(d => {
      if (dateFrom && d.date < dateFrom) return false;
      if (dateTo && d.date > dateTo) return false;
      return true;
    });
  }, [rawData, dateFrom, dateTo]);

  const handleNoteChange = useCallback((key, noteData) => {
    setNotes(prev => {
      if (noteData === null) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: noteData };
    });
  }, []);

  const t = (key) => targets[key] ? parseFloat(targets[key]) : undefined;

  return (
    <div className="min-h-screen bg-[#07070f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Progress Report</h1>
          <p className="text-white/40 text-sm mt-1">Nutrilize Export analysieren · Ernährung · Körper · Aktivität · Erholung</p>
        </div>

        {/* File Upload */}
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all mb-6 cursor-pointer ${
            isDragging ? 'border-[#3ecf8e] bg-[#3ecf8e]/5' : 'border-white/10 bg-[#0f0f1a] hover:border-white/20'
          }`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('xlsx-input').click()}
        >
          <input
            id="xlsx-input"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => handleFile(e.target.files[0])}
          />
          {loading ? (
            <div className="flex items-center justify-center gap-3 text-white/60">
              <div className="w-5 h-5 border-2 border-[#3ecf8e] border-t-transparent rounded-full animate-spin" />
              <span>Datei wird eingelesen...</span>
            </div>
          ) : fileName ? (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-[#3ecf8e]" />
              <div className="text-left">
                <p className="text-white font-semibold text-sm">{fileName}</p>
                <p className="text-white/40 text-xs">{filteredData.length} Tage geladen · Klicken zum Ersetzen</p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm font-medium">Nutrilize Export (.xlsx) hier ablegen</p>
              <p className="text-white/30 text-xs mt-1">oder klicken zum Auswählen</p>
            </div>
          )}
        </div>

        {/* Config Panel */}
        {rawData.length > 0 && (
          <div className="bg-[#0f0f1a] border border-white/8 rounded-2xl mb-6 overflow-hidden">
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-white/70 hover:text-white transition-colors"
            >
              <span className="text-sm font-medium">⚙️ Konfiguration{clientName ? ` · ${clientName}` : ''}</span>
              {configOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {configOpen && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/40 text-xs block mb-1.5">Kundenname</label>
                  <input
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Max Mustermann"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3ecf8e]/50"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs block mb-1.5">Von</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3ecf8e]/50"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs block mb-1.5">Bis</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3ecf8e]/50"
                  />
                </div>
                {[
                  { key: 'calories', label: 'Kalorien-Ziel (kcal)' },
                  { key: 'protein', label: 'Protein-Ziel (g)' },
                  { key: 'weight', label: 'Gewichts-Ziel (kg)' },
                  { key: 'steps', label: 'Schritte-Ziel' },
                  { key: 'sleep', label: 'Schlaf-Ziel (Std.)' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-white/40 text-xs block mb-1.5">{label}</label>
                    <input
                      type="number"
                      value={targets[key]}
                      onChange={e => setTargets(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder="–"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3ecf8e]/50 font-mono"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analysis */}
        {filteredData.length > 0 && (
          <div>
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-[#0f0f1a] border border-white/8 rounded-2xl p-1.5 overflow-x-auto">
              {TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === i
                      ? 'bg-[#3ecf8e] text-black'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 0 && <OverviewTab data={filteredData} />}

            {activeTab === 1 && (
              <div>
                <MetricChart data={filteredData} metricKey="calories" label="Kalorien" color={COLORS.calories} unit="kcal" target={t('calories')} notes={notes} onNoteChange={handleNoteChange} />
                <MetricChart data={filteredData} metricKey="protein" label="Protein" color={COLORS.protein} unit="g" target={t('protein')} notes={notes} onNoteChange={handleNoteChange} />
                <MacroChart data={filteredData} />
                <MetricChart data={filteredData} metricKey="fiber" label="Ballaststoffe" color={COLORS.fiber} unit="g" notes={notes} onNoteChange={handleNoteChange} />
                <MetricChart data={filteredData} metricKey="sugar" label="Zucker" color={COLORS.sugar} unit="g" notes={notes} onNoteChange={handleNoteChange} />
              </div>
            )}

            {activeTab === 2 && (
              <div>
                <MetricChart data={filteredData} metricKey="weight" label="Körpergewicht" color={COLORS.weight} unit="kg" target={t('weight')} notes={notes} onNoteChange={handleNoteChange} />
                <MetricChart data={filteredData} metricKey="bodyFat" label="Körperfettanteil" color={COLORS.bodyFat} unit="%" notes={notes} onNoteChange={handleNoteChange} />
                <MetricChart data={filteredData} metricKey="bmi" label="BMI" color={COLORS.bmi} unit="" notes={notes} onNoteChange={handleNoteChange} />
              </div>
            )}

            {activeTab === 3 && (
              <div>
                <MetricChart data={filteredData} metricKey="steps" label="Schritte" color={COLORS.steps} unit="Schr." target={t('steps')} notes={notes} onNoteChange={handleNoteChange} />
                <MetricChart data={filteredData} metricKey="burnedCalories" label="Verbrannte Kalorien" color={COLORS.burnedCalories} unit="kcal" notes={notes} onNoteChange={handleNoteChange} />
                <MetricChart data={filteredData} metricKey="activityDuration" label="Aktivitätsdauer" color={COLORS.activityDuration} unit="min" notes={notes} onNoteChange={handleNoteChange} />
              </div>
            )}

            {activeTab === 4 && (
              <div>
                <MetricChart data={filteredData} metricKey="sleepMinutes" label="Schlafdauer" color={COLORS.sleepMinutes} unit="h:mm" isSleep target={t('sleep') ? t('sleep') * 60 : undefined} notes={notes} onNoteChange={handleNoteChange} />
                <MetricChart data={filteredData} metricKey="hrv" label="HRV" color={COLORS.hrv} unit="ms" notes={notes} onNoteChange={handleNoteChange} />
                <MetricChart data={filteredData} metricKey="restingHR" label="Ruhepuls" color={COLORS.restingHR} unit="bpm" notes={notes} onNoteChange={handleNoteChange} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}