import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, FileText, ChevronRight, Trash2 } from "lucide-react";
import ReportWizard from "@/components/progress/ReportWizard";
import ReportView from "@/components/progress/ReportView";

export default function Progress() {
  const [tab, setTab] = useState("berichte");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewReport, setViewReport] = useState(null);
  const [editReport, setEditReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    const data = await base44.entities.MonthlyReport.list("-report_month");
    setReports(data);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const handleSaved = () => {
    fetchReports();
    setTab("berichte");
    setEditReport(null);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Bericht löschen?")) return;
    await base44.entities.MonthlyReport.delete(id);
    fetchReports();
  };

  if (viewReport) {
    return <ReportView report={viewReport} onBack={() => setViewReport(null)} />;
  }

  if (tab === "wizard") {
    return (
      <ReportWizard
        editReport={editReport}
        onSaved={handleSaved}
        onCancel={() => { setTab("berichte"); setEditReport(null); }}
      />
    );
  }

  // Group by client
  const grouped = reports.reduce((acc, r) => {
    const key = r.client_name || "Unbekannt";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Top bar */}
      <div className="border-b border-white/5 px-8 py-6 flex items-center justify-between">
        <div>
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Coaching</p>
          <h1 className="text-3xl font-bold">Monatsreports</h1>
        </div>
        <button
          onClick={() => { setEditReport(null); setTab("wizard"); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-black font-semibold rounded-lg hover:bg-amber-300 transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> Neuer Bericht
        </button>
      </div>

      <div className="px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FileText className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-white/40 mb-6">Noch keine Berichte vorhanden.</p>
            <button
              onClick={() => setTab("wizard")}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 text-black font-semibold rounded-lg hover:bg-amber-300 transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Ersten Bericht erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([clientName, clientReports]) => (
              <div key={clientName}>
                <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">{clientName}</p>
                <div className="space-y-3">
                  {clientReports.map(r => (
                    <div
                      key={r.id}
                      onClick={() => setViewReport(r)}
                      className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-6 py-4 border border-white/5 hover:border-amber-400/20 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
                          <span className="text-amber-400 font-bold text-sm">{r.gesamtbewertung || "–"}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{r.report_label || r.report_month}</p>
                          <p className="text-white/30 text-xs mt-0.5">
                            {r.gewicht_start && r.gewicht_end
                              ? `${r.gewicht_start} → ${r.gewicht_end} kg`
                              : "Keine Körperdaten"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditReport(r); setTab("wizard"); }}
                          className="text-xs text-white/30 hover:text-amber-400 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/30 transition-all"
                        >
                          Bearbeiten
                        </button>
                        <button onClick={(e) => handleDelete(r.id, e)}
                          className="text-white/20 hover:text-red-400 transition-colors p-1.5">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-amber-400 transition-colors" />
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