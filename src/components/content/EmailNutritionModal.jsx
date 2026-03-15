import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Send, Loader2 } from "lucide-react";

const C = { indigo: "#00416A", egg: "#F0EAD6" };

export default function EmailNutritionModal({ draft, strategyId, onClose }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const firstName = draft.client_name?.split(" ")[0] || draft.client_name || "du";
  const strategyUrl = `${window.location.origin}/NutritionStrategy832?id=${strategyId}`;

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);

    const body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#00416A;border-radius:12px 12px 0 0;padding:32px 40px;">
              <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.45);">Leistungsarchitektur</p>
              <h1 style="margin:8px 0 0;font-size:26px;font-weight:800;color:white;line-height:1.2;">Deine individuelle<br>Ernährungsstrategie</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:white;padding:36px 40px;">
              <p style="margin:0 0 20px;font-size:15px;color:#333;line-height:1.7;">Hallo ${firstName},</p>
              <p style="margin:0 0 20px;font-size:15px;color:#333;line-height:1.7;">
                hier ist die <strong>Version ${draft.version}</strong> deiner individuellen Ernährungsstrategie – speziell auf dein Ziel und deine Ausgangssituation zugeschnitten.
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#333;line-height:1.7;">
                Du findest darin deine Kalorienziele (${draft.kalorien_ziel} kcal), dein Proteinziel (${draft.protein_ziel}g), deine Mahlzeitenstruktur sowie konkrete Essensoptionen für jeden Tagesabschnitt.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#00416A;border-radius:8px;padding:14px 28px;">
                    <a href="${strategyUrl}" style="color:white;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.03em;">
                      → Ernährungsstrategie öffnen
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:0 0 24px;">

              <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.6;">
                Lies dir die Strategie in Ruhe durch. Bei Fragen melde dich jederzeit.
              </p>
              <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
                Viel Erfolg & beste Grüße 💪
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F0EAD6;border-radius:0 0 12px 12px;padding:20px 40px;">
              <p style="margin:0;font-size:10px;color:rgba(0,65,106,0.5);font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Leistungsarchitektur · Vertraulich</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await base44.integrations.Core.SendEmail({
      to: email.trim(),
      subject: `Deine Ernährungsstrategie v${draft.version} – ${draft.client_name}`,
      body,
    });

    setSending(false);
    setSent(true);
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