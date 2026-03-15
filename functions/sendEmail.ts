import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, subject, body } = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Leistungsarchitektur <onboarding@resend.dev>",
        to: ["contact@aichem.io"],
        reply_to: to,
        subject,
        text: body,
      }),
    });

    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.message || "Fehler beim Senden" }, { status: 400 });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});