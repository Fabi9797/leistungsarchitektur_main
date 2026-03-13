import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { url } = await req.json();
  if (!url) return Response.json({ error: 'No URL provided' }, { status: 400 });

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  const html = await res.text();

  // Try og:image first
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch) return Response.json({ image_url: ogMatch[1] });

  // Try first large <img> with src
  const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  for (const m of imgMatches) {
    const src = m[1];
    if (src.match(/\.(jpg|jpeg|png|webp)/i) && !src.includes('logo') && !src.includes('icon') && !src.includes('svg')) {
      const full = src.startsWith('http') ? src : new URL(src, url).href;
      return Response.json({ image_url: full });
    }
  }

  return Response.json({ error: 'Kein Bild gefunden' }, { status: 404 });
});