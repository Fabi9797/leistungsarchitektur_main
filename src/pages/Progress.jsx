import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, FileText, ChevronRight, Trash2 } from "lucide-react";
import ReportWizard from "@/components/progress/ReportWizard";
import ReportView from "@/components/progress/ReportView";

const LOGO_URL = "https://media.base44.com/images/public/69b064c89953b727c5202e21/a128f5dab_ChatGPTImage19Marz202616_44_51.png";

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

  const grouped = reports.reduce((acc, r) => {
    const key = r.client_name || "Unbekannt";
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F0EAD6]/30">
      {/* Top bar */}
      <div className="bg-white border-b border-black/8 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="w-9 h-9 rounded-lg object-contain" />
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#00416A]/50 uppercase">Leistungsarchitektur</p>
            <h1 className="text-xl font-bold text-[#00416A]">Monatsreports</h1>
          </div>
        </div>
        <button
          onClick={() => { setEditReport(null); setTab("wizard"); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00416A] text-white font-semibold rounded-lg hover:bg-[#003356] transition-all text-sm"
        >
          <Plus className="w-4 h-4" /> Neuer Bericht
        </button>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#00416A]/20 border-t-[#00416A] rounded-full animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00416A]/8 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-[#00416A]/30" />
            </div>
            <p className="text-black/40 mb-6">Noch keine Berichte vorhanden.</p>
            <button
              onClick={() => setTab("wizard")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00416A] text-white font-semibold rounded-lg hover:bg-[#003356] transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Ersten Bericht erstellen
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([clientName, clientReports]) => (
              <div key={clientName}>
                <p className="text-[10px] font-bold text-[#00416A]/60 uppercase tracking-widest mb-4">{clientName}</p>
                <div className="space-y-3">
                  {clientReports.map(r => (
                    <div
                      key={r.id}
                      onClick={() => setViewReport(r)}
                      className="flex items-center justify-between bg-white rounded-xl px-6 py-4 border border-black/8 hover:border-[#00416A]/30 hover:shadow-sm cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#00416A]/8 flex items-center justify-center">
                          <span className="text-[#00416A] font-bold text-sm">{r.gesamtbewertung || "–"}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[#00416A]">{r.report_label || r.report_month}</p>
                          <p className="text-black/30 text-xs mt-0.5">
                            {r.gewicht_start && r.gewicht_end
                              ? `${r.gewicht_start} → ${r.gewicht_end} kg`
                              : "Keine Körperdaten"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditReport(r); setTab("wizard"); }}
                          className="text-xs text-black/30 hover:text-[#00416A] px-3 py-1.5 rounded-lg border border-black/10 hover:border-[#00416A]/30 transition-all"
                        >
                          Bearbeiten
                        </button>
                        <button onClick={(e) => handleDelete(r.id, e)}
                          className="text-black/20 hover:text-red-500 transition-colors p-1.5">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-black/20 group-hover:text-[#00416A] transition-colors" />
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