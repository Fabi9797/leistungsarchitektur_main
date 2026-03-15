import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Loader2, AlertCircle } from "lucide-react";

const C = { indigo: "#00416A", egg: "#F0EAD6" };

export default function EmailNutritionModal({ draft, strategyId, defaultEmail = "", onClose }) {
  const [email, setEmail] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const firstName = draft.client_name?.split(" ")[0] || draft.client_name || "du";
  const strategyUrl = `${window.location.origin}/NutritionStrategy832?id=${strategyId}`;

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError("");

    try {
      const body = `Hallo ${firstName},

hier ist Version ${draft.version} deiner individuellen Ernaehrungsstrategie.

Kalorienziel: ${draft.kalorien_ziel} kcal
Proteinziel: ${draft.protein_ziel}g

Strategie ansehen:
${strategyUrl}

Viel Erfolg!
Leistungsarchitektur`;

      await base44.integrations.Core.SendEmail({
        to: email.trim(),
        subject: `Ernaehrungsstrategie v${draft.version} - ${draft.client_name}`,
        body,
      });

      setSent(true);
    } catch (err) {
      setError(err?.message || "Fehler beim Senden. Bitte versuche es erneut.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "460px", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>

        {/* Header */}
        <div style={{ background: C.indigo, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>E-Mail senden</p>
            <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: 700, color: "white" }}>Ernährungsstrategie v{draft.version}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding: "4px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: C.indigo }}>E-Mail erfolgreich gesendet!</p>
              <p style={{ margin: "8px 0 0", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>An: {email}</p>
              <button onClick={onClose} style={{ marginTop: "20px", padding: "10px 24px", background: C.indigo, color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                Schließen
              </button>
            </div>
          ) : (
            <>
              {/* Preview */}
              <div style={{ background: "#f9f7f3", border: "1px solid rgba(0,65,106,0.1)", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
                <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,65,106,0.4)" }}>Vorschau Betreff</p>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: C.indigo }}>Deine Ernährungsstrategie v{draft.version} – {draft.client_name}</p>
                <hr style={{ border: "none", borderTop: "1px solid rgba(0,65,106,0.08)", margin: "12px 0" }} />
                <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,65,106,0.4)" }}>Inhalt</p>
                <p style={{ margin: 0, fontSize: "12px", color: "rgba(0,0,0,0.55)", lineHeight: 1.6 }}>
                  Hallo <strong>{firstName}</strong>, hier ist Version {draft.version} deiner individuellen Ernährungsstrategie mit einem direkten Link zur Ansicht.
                </p>
              </div>

              {/* Email input */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(0,65,106,0.5)", marginBottom: "6px" }}>
                  Empfänger E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="kunde@email.de"
                  style={{ width: "100%", border: "1px solid rgba(0,65,106,0.2)", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={onClose} style={{ flex: 1, padding: "10px", background: "rgba(0,0,0,0.05)", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "rgba(0,0,0,0.5)" }}>
                  Abbrechen
                </button>
                <button onClick={handleSend} disabled={sending || !email.trim()} style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", background: C.indigo, color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: (sending || !email.trim()) ? 0.6 : 1 }}>
                  {sending ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Senden…</> : <><Send size={14} /> E-Mail senden</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}