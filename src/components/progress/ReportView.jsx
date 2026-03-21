import React from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function SectionTitle({ children }) {
  return (
    <h2 className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-3">
      <span className="flex-1 h-px bg-amber-400/20" />
      {children}
      <span className="flex-1 h-px bg-amber-400/20" />
    </h2>
  );
}

function StatCard({ label, before, after, lowerBetter }) {
  const delta = after - before;
  const isGood = lowerBetter ? delta < 0 : delta > 0;
  const pct = (val) => (val / 10) * 100;
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
      <p className="text-white/40 text-xs mb-3">{label}</p>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Vorher</span><span>{before}/10</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-white/30 rounded-full transition-all" style={{ width: `${pct(before)}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/40">Nachher</span>
            <span className={isGood ? "text-green-400" : "text-red-400"}>{after}/10</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${isGood ? "bg-green-400" : "bg-red-400"}`}
              style={{ width: `${pct(after)}%` }} />
          </div>
        </div>
      </div>
      <div className={`mt-3 text-sm font-bold ${isGood ? "text-green-400" : delta === 0 ? "text-white/30" : "text-red-400"}`}>
        {delta > 0 ? `+${delta}` : delta}
      </div>
    </div>
  );
}

function TrendBadge({ trend, lowerBetter }) {
  const isGood = lowerBetter ? trend === "Fallend" : trend === "Steigend";
  const icon = trend === "Steigend" ? <TrendingUp className="w-3 h-3" /> :
    trend === "Fallend" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
      isGood ? "bg-green-500/20 text-green-400" :
      trend === "Stabil" ? "bg-white/10 text-white/50" : "bg-red-500/20 text-red-400"
    }`}>
      {icon} {trend}
    </span>
  );
}

function CompBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/60">{label}</span>
        <span className={`font-bold ${value >= 80 ? "text-green-400" : value >= 60 ? "text-amber-400" : "text-red-400"}`}>{value}%</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${value >= 80 ? "bg-green-400" : value >= 60 ? "bg-amber-400" : "bg-red-400"}`}
          style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ReportView({ report, onBack }) {
  let uebungen = [];
  let umfaenge = {};
  let gewichtVerlauf = [];
  try { uebungen = report.uebungen_json ? JSON.parse(report.uebungen_json) : []; } catch {}
  try { umfaenge = report.umfaenge_json ? JSON.parse(report.umfaenge_json) : {}; } catch {}
  try { gewichtVerlauf = report.gewicht_verlauf_json ? JSON.parse(report.gewicht_verlauf_json) : []; } catch {}

  const fokusItems = report.fokus_naechster_monat
    ? report.fokus_naechster_monat.split("\n").filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-8 py-6">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
        </button>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">Monatsreport</p>
            <h1 className="text-4xl font-bold text-white">{report.client_name}</h1>
            <p className="text-white/40 mt-1">{report.report_label || report.report_month}</p>
          </div>
          <div className="text-right">
            <p className="text-white/30 text-xs mb-1">Gesamtbewertung</p>
            <div className="flex items-end gap-1">
              <span className="text-amber-400 text-6xl font-bold leading-none">{report.gesamtbewertung}</span>
              <span className="text-white/20 text-2xl mb-1">/10</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10 space-y-12">

        {/* Subjektive Wahrnehmung */}
        <section>
          <SectionTitle>Subjektive Wahrnehmung</SectionTitle>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="⚡ Energie" before={report.energie_vorher} after={report.energie_nachher} />
            <StatCard label="🧠 Stress" before={report.stress_vorher} after={report.stress_nachher} lowerBetter />
            <StatCard label="😴 Schlaf" before={report.schlaf_vorher} after={report.schlaf_nachher} />
          </div>
          {(report.gefuehl_vorher || report.gefuehl_nachher) && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {report.gefuehl_vorher && (
                <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
                  <p className="text-white/40 text-xs mb-3">Zu Beginn</p>
                  <p className="text-white/80 text-sm italic">"{report.gefuehl_vorher}"</p>
                </div>
              )}
              {report.gefuehl_nachher && (
                <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
                  <p className="text-white/40 text-xs mb-3">Am Ende</p>
                  <p className="text-white/80 text-sm italic">"{report.gefuehl_nachher}"</p>
                </div>
              )}
            </div>
          )}
          {report.highlight_des_monats && (
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-5">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">🏆 Highlight des Monats</p>
              <p className="text-white">{report.highlight_des_monats}</p>
            </div>
          )}
        </section>

        {/* Körper */}
        <section>
          <SectionTitle>Körper</SectionTitle>
          <div className="grid grid-cols-2 gap-6 mb-6">
            {report.gewicht_start && report.gewicht_end && (
              <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
                <p className="text-white/40 text-xs mb-4">Gewicht (kg)</p>
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <p className="text-white/30 text-xs">Start</p>
                    <p className="text-2xl font-bold text-white">{report.gewicht_start}</p>
                  </div>
                  <div className="text-white/20">→</div>
                  <div>
                    <p className="text-white/30 text-xs">Ende</p>
                    <p className="text-2xl font-bold text-white">{report.gewicht_end}</p>
                  </div>
                  <div className={`ml-auto text-xl font-bold ${
                    report.gewicht_end < report.gewicht_start ? "text-green-400" : "text-red-400"
                  }`}>
                    {(parseFloat(report.gewicht_end) - parseFloat(report.gewicht_start)).toFixed(1)} kg
                  </div>
                </div>
                {gewichtVerlauf.length > 0 && (
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={gewichtVerlauf}>
                      <Line type="monotone" dataKey="kg" stroke="#d4a853" strokeWidth={2} dot={false} />
                      <XAxis dataKey="week" hide />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
            {report.kfa_start && report.kfa_end && (
              <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
                <p className="text-white/40 text-xs mb-4">Körperfett (%)</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-white/30 text-xs">Start</p>
                    <p className="text-2xl font-bold text-white">{report.kfa_start}%</p>
                  </div>
                  <div className="text-white/20">→</div>
                  <div>
                    <p className="text-white/30 text-xs">Ende</p>
                    <p className="text-2xl font-bold text-white">{report.kfa_end}%</p>
                  </div>
                  <div className={`ml-auto text-xl font-bold ${
                    report.kfa_end < report.kfa_start ? "text-green-400" : "text-red-400"
                  }`}>
                    {(parseFloat(report.kfa_end) - parseFloat(report.kfa_start)).toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {Object.keys(umfaenge).length > 0 && (
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
              <p className="text-white/40 text-xs mb-4">Umfänge (cm)</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/30 text-xs">
                    <th className="text-left pb-2">Bereich</th>
                    <th className="text-right pb-2">Start</th>
                    <th className="text-right pb-2">Ende</th>
                    <th className="text-right pb-2">Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[["Taille","taille"],["Hüfte","huefte"],["Brust","brust"],["Oberarm","oberarm"]].map(([l,k]) => {
                    const s = umfaenge[`${k}_start`], e = umfaenge[`${k}_end`];
                    if (!s && !e) return null;
                    const d = s && e ? (parseFloat(e) - parseFloat(s)).toFixed(1) : null;
                    return (
                      <tr key={k} className="text-white">
                        <td className="py-2 text-white/60">{l}</td>
                        <td className="py-2 text-right">{s || "—"}</td>
                        <td className="py-2 text-right">{e || "—"}</td>
                        <td className={`py-2 text-right font-bold ${d < 0 ? "text-green-400" : d > 0 ? "text-red-400" : "text-white/30"}`}>
                          {d ? (d > 0 ? `+${d}` : d) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Vitalwerte */}
        {(report.hrv_avg || report.ruhepuls_avg || report.schlafdauer_avg) && (
          <section>
            <SectionTitle>Vitalwerte</SectionTitle>
            <div className="grid grid-cols-3 gap-4">
              {report.hrv_avg && (
                <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
                  <p className="text-white/40 text-xs mb-3">HRV Ø</p>
                  <p className="text-3xl font-bold text-white mb-2">{report.hrv_avg}</p>
                  {report.hrv_trend && <TrendBadge trend={report.hrv_trend} />}
                </div>
              )}
              {report.ruhepuls_avg && (
                <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
                  <p className="text-white/40 text-xs mb-3">Ruhepuls Ø</p>
                  <p className="text-3xl font-bold text-white mb-2">{report.ruhepuls_avg} <span className="text-base text-white/30">bpm</span></p>
                  {report.ruhepuls_trend && <TrendBadge trend={report.ruhepuls_trend} lowerBetter />}
                </div>
              )}
              {report.schlafdauer_avg && (
                <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
                  <p className="text-white/40 text-xs mb-3">Schlafdauer Ø</p>
                  <p className="text-3xl font-bold text-white">{report.schlafdauer_avg} <span className="text-base text-white/30">h</span></p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Training */}
        <section>
          <SectionTitle>Training</SectionTitle>
          {uebungen.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/30 text-xs">
                    <th className="text-left pb-3">Übung</th>
                    <th className="text-right pb-3">Start</th>
                    <th className="text-right pb-3">Ende</th>
                    <th className="text-right pb-3">Delta</th>
                    <th className="text-right pb-3">Sätze</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {uebungen.map((u, i) => {
                    const d = u.wert_start && u.wert_end
                      ? (parseFloat(u.wert_end) - parseFloat(u.wert_start)).toFixed(1) : null;
                    return (
                      <tr key={i} className="text-white">
                        <td className="py-2.5 font-medium">{u.name}</td>
                        <td className="py-2.5 text-right text-white/50">{u.wert_start} {u.einheit}</td>
                        <td className="py-2.5 text-right">{u.wert_end} {u.einheit}</td>
                        <td className={`py-2.5 text-right font-bold ${!d ? "text-white/30" : parseFloat(d) >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {d ? (parseFloat(d) >= 0 ? `+${d}` : d) : "—"}
                        </td>
                        <td className="py-2.5 text-right text-white/50">{u.satz_reps}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <CompBar label="Training Compliance" value={report.training_compliance || 0} />
        </section>

        {/* Ernährung */}
        <section>
          <SectionTitle>Ernährung</SectionTitle>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {report.kalorien_avg && (
              <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
                <p className="text-white/40 text-xs mb-1">Kalorien Ø</p>
                <p className="text-2xl font-bold text-white">{report.kalorien_avg} <span className="text-sm text-white/30">kcal</span></p>
              </div>
            )}
            {report.protein_avg && (
              <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/5">
                <p className="text-white/40 text-xs mb-1">Protein Ø</p>
                <p className="text-2xl font-bold text-white">{report.protein_avg} <span className="text-sm text-white/30">g</span></p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <CompBar label="Ernährungs-Compliance" value={report.ernaehrung_compliance || 0} />
            <CompBar label="Supplement-Compliance" value={report.supplement_compliance || 0} />
          </div>
        </section>

        {/* Coach */}
        <section>
          <SectionTitle>Coach-Bewertung</SectionTitle>
          {report.coach_kommentar && (
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 mb-5">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">Kommentar</p>
              <p className="text-white/80 leading-relaxed italic">"{report.coach_kommentar}"</p>
            </div>
          )}
          {fokusItems.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5 mb-5">
              <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">Fokus nächster Monat</p>
              <ol className="space-y-3">
                {fokusItems.map((item, i) => (
                  <li key={i} className="flex gap-3 text-white/80">
                    <span className="text-amber-400 font-bold text-sm w-5 flex-shrink-0">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-amber-400/20 flex items-center gap-6">
            <span className="text-amber-400 text-7xl font-bold leading-none">{report.gesamtbewertung}</span>
            <div>
              <p className="text-white/30 text-xs">Gesamtbewertung</p>
              <p className="text-white/20 text-sm">von 10 Punkten</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}