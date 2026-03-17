import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams } from "react-router-dom";
import { FileText, Salad, Pill, Download, ExternalLink, Loader2, ChevronRight } from "lucide-react";

const C = { indigo: "#00416A", egg: "#F0EAD6", white: "#FFFFFF" };

export default function KundenPortal() {
  const pathname = window.location.pathname; // e.g. /kunde/Max-Mustermann
  const slug = pathname.replace(/^\/kunde\//, "").replace(/-/g, " ");
  const clientNameDecoded = decodeURIComponent(slug);

  const [client, setClient] = useState(null);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [supplementPlan, setSupplementPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const clients = await base44.entities.ClientProfile.list();
      const found = clients.find(c =>
        c.name?.toLowerCase().trim() === clientNameDecoded.toLowerCase().trim()
      );

      if (!found) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setClient(found);

      const [nutrition, supplement] = await Promise.all([
        base44.entities.NutritionStrategy.list(),
        base44.entities.SupplementPlan.list(),
      ]);

      const nPlan = nutrition.find(n => n.client_name?.toLowerCase().trim() === found.name?.toLowerCase().trim());
      const sPlan = supplement.find(s => s.client_name?.toLowerCase().trim() === found.name?.toLowerCase().trim());

      setNutritionPlan(nPlan || null);
      setSupplementPlan(sPlan || null);
      setLoading(false);
    }
    load();
  }, [clientNameDecoded]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.egg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <Loader2 size={28} style={{ color: C.indigo, animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: C.egg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "48px", marginBottom: "12px" }}>🏛️</p>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: C.indigo, marginBottom: "8px" }}>Kein Portal gefunden</h2>
        <p style={{ fontSize: "14px", color: "rgba(0,65,106,0.5)" }}>Für „{clientNameDecoded}" existiert kein Kundenprofil.</p>
      </div>
    </div>
  );

  const parse = (str, fallback = []) => { try { return JSON.parse(str); } catch { return fallback; } };
  const supplements = supplementPlan ? parse(supplementPlan.supplements_json, []) : [];

  return (
    <div style={{ minHeight: "100vh", background: C.egg, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .card { animation: fadeIn 0.4s ease both; }
        .card:nth-child(2) { animation-delay: 0.08s; }
        .card:nth-child(3) { animation-delay: 0.16s; }
        .portal-btn:hover { opacity: 0.85; transform: translateY(-1px); }
        .portal-btn { transition: all 0.15s ease; }
        .doc-item:hover { background: rgba(0,65,106,0.06) !important; }
      `}</style>

      {/* Header */}
      <div style={{ background: C.indigo, padding: "32px 24px 48px" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2.5L22 9H2L12 2.5Z" fill="white" fillOpacity="0.9"/>
              <path d="M2 9H22" stroke="white" strokeWidth="1.2"/>
              <rect x="4" y="9.5" width="2" height="10" rx="0.5" fill="white" fillOpacity="0.9"/>
              <rect x="11" y="9.5" width="2" height="10" rx="0.5" fill="white" fillOpacity="0.9"/>
              <rect x="18" y="9.5" width="2" height="10" rx="0.5" fill="white" fillOpacity="0.9"/>
              <path d="M2 19.5H22" stroke="white" strokeWidth="1.2"/>
            </svg>
            <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
              LEISTUNGSARCHITEKTUR
            </span>
          </div>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: "0 0 6px" }}>
            Dein persönliches Portal
          </p>
          <h1 style={{ fontSize: "34px", fontWeight: 900, color: "white", margin: 0, lineHeight: 1.1 }}>
            Hallo, {client.name.split(" ")[0]} 👋
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", marginTop: "8px" }}>
            Hier findest du alle deine individuellen Pläne und Dokumente.
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "680px", margin: "-24px auto 0", padding: "0 20px 60px" }}>

        {/* Ernährungsplan */}
        <div className="card" style={{ background: "white", borderRadius: "16px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 2px 20px rgba(0,65,106,0.08)" }}>
          <div style={{ padding: "24px 24px 20px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", background: "rgba(0,65,106,0.08)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Salad size={22} style={{ color: C.indigo }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: C.indigo, margin: "0 0 4px" }}>Ernährungsstrategie</h2>
              {nutritionPlan ? (
                <>
                  <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.45)", margin: "0 0 16px" }}>
                    Version {nutritionPlan.version} · Persönlich für dich erstellt
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                    {nutritionPlan.kalorien_ziel && (
                      <div style={{ background: C.egg, borderRadius: "10px", padding: "12px 14px" }}>
                        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,65,106,0.45)", margin: "0 0 4px" }}>Kalorienziel</p>
                        <p style={{ fontSize: "20px", fontWeight: 900, color: C.indigo, margin: 0 }}>{nutritionPlan.kalorien_ziel} <span style={{ fontSize: "12px", fontWeight: 600 }}>kcal</span></p>
                      </div>
                    )}
                    {nutritionPlan.protein_ziel && (
                      <div style={{ background: C.egg, borderRadius: "10px", padding: "12px 14px" }}>
                        <p style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,65,106,0.45)", margin: "0 0 4px" }}>Proteinziel</p>
                        <p style={{ fontSize: "20px", fontWeight: 900, color: C.indigo, margin: 0 }}>{nutritionPlan.protein_ziel} <span style={{ fontSize: "12px", fontWeight: 600 }}>g</span></p>
                      </div>
                    )}
                  </div>
                  <a
                    href={`/NutritionStrategy832?id=${nutritionPlan.id}`}
                    className="portal-btn"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: C.indigo, color: "white", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}
                  >
                    Plan ansehen <ChevronRight size={14} />
                  </a>
                </>
              ) : (
                <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.35)", fontStyle: "italic", margin: 0 }}>
                  Noch kein Ernährungsplan erstellt.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Supplementplan */}
        <div className="card" style={{ background: "white", borderRadius: "16px", marginBottom: "16px", overflow: "hidden", boxShadow: "0 2px 20px rgba(0,65,106,0.08)" }}>
          <div style={{ padding: "24px 24px 20px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", background: "rgba(0,65,106,0.08)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Pill size={22} style={{ color: C.indigo }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: C.indigo, margin: "0 0 4px" }}>Supplementplan</h2>
              {supplementPlan ? (
                <>
                  <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.45)", margin: "0 0 16px" }}>
                    {supplements.length} Supplemente · Version {supplementPlan.version}
                  </p>
                  {supplements.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                      {supplements.slice(0, 6).map((s, i) => (
                        <span key={i} style={{ background: C.egg, color: C.indigo, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                          {s.naehrstoff}
                        </span>
                      ))}
                      {supplements.length > 6 && (
                        <span style={{ background: "rgba(0,65,106,0.06)", color: C.indigo, padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>
                          +{supplements.length - 6} weitere
                        </span>
                      )}
                    </div>
                  )}
                  <a
                    href={`/SupplementStrategy832?id=${supplementPlan.id}`}
                    className="portal-btn"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: C.indigo, color: "white", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontSize: "13px", fontWeight: 700 }}
                  >
                    Plan ansehen <ChevronRight size={14} />
                  </a>
                </>
              ) : (
                <p style={{ fontSize: "13px", color: "rgba(0,0,0,0.35)", fontStyle: "italic", margin: 0 }}>
                  Noch kein Supplementplan erstellt.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dokumente */}
        {client.documents && client.documents.length > 0 && (
          <div className="card" style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 20px rgba(0,65,106,0.08)" }}>
            <div style={{ padding: "24px 24px 8px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "48px", height: "48px", background: "rgba(0,65,106,0.08)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText size={22} style={{ color: C.indigo }} />
              </div>
              <h2 style={{ fontSize: "17px", fontWeight: 800, color: C.indigo, margin: 0 }}>Dokumente</h2>
            </div>
            <div style={{ padding: "8px 16px 16px" }}>
              {client.documents.map((doc, i) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="doc-item"
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 10px", borderRadius: "10px", textDecoration: "none", transition: "background 0.15s" }}
                >
                  <div style={{ width: "36px", height: "36px", background: C.egg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Download size={15} style={{ color: C.indigo }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: C.indigo, margin: 0 }}>{doc.name}</p>
                    {doc.uploaded_at && (
                      <p style={{ fontSize: "11px", color: "rgba(0,0,0,0.35)", margin: 0 }}>
                        {new Date(doc.uploaded_at).toLocaleDateString("de-DE")}
                      </p>
                    )}
                  </div>
                  <ExternalLink size={14} style={{ color: "rgba(0,65,106,0.3)" }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "11px", color: "rgba(0,65,106,0.35)", marginTop: "40px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Leistungsarchitektur · Fabian Aichem
        </p>
      </div>
    </div>
  );
}