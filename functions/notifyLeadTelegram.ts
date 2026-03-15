import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const lead = body.data;
    if (!lead) return Response.json({ ok: true });

    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    const text = `🔔 *Neuer Lead eingegangen!*\n\n👤 *Name:* ${lead.name || "–"}\n📞 *Telefon:* ${lead.phone || "–"}\n📧 *E-Mail:* ${lead.email || "–"}\n🎯 *Ziel:* ${lead.ziel || "–"}\n📌 *Status:* ${lead.status || "Neu"}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    const tgJson = await tgRes.json();
    console.log("Telegram response:", JSON.stringify(tgJson));

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});