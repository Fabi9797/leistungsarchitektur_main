import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const { url } = await req.json();
  if (!url) return Response.json({ error: 'No URL provided' }, { status: 400 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const res = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
  });
  clearTimeout(timeout);
  const html = await res.text();

  // 1) og:image
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch && !ogMatch[1].includes('.svg')) {
    return Response.json({ image_url: ogMatch[1] });
  }

  // 2) JSON-LD image
  const jsonLdMatch = html.match(/"image"\s*:\s*"(https?:[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
  if (jsonLdMatch) return Response.json({ image_url: jsonLdMatch[1] });

  // 3) product image patterns
  const patterns = [
    /data-src=["'](https?:[^"']+\.(jpg|jpeg|png|webp)[^"']*)/gi,
    /src=["'](https?:[^"']+\.(jpg|jpeg|png|webp)[^"']*)/gi,
  ];
  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    for (const m of matches) {
      const src = m[1];
      if (!src.includes('logo') && !src.includes('icon') && !src.includes('sprite') && !src.includes('banner')) {
        return Response.json({ image_url: src });
      }
    }
  }

  return Response.json({ error: 'Kein Bild gefunden' }, { status: 404 });
});