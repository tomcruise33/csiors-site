export const prerender = false;

import type { APIRoute } from 'astro';

const FOCUS_COUNTRIES = new Set([
  'Syria', 'Ethiopia', 'Sudan', 'Yemen', 'Lebanon', 'Nigeria',
  'Turkey', 'Iraq', 'Somalia', 'Morocco', 'Libya', 'Egypt',
  'Tunisia', 'Eritrea', 'South Sudan', 'Kenya', 'Djibouti',
]);

// Simple in-memory cache (Vercel serverless = cold start OK, 15min TTL)
let cache: { items: any[]; ts: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000;

async function fetchReliefWeb(): Promise<{ source: string; region: string; title: string }[]> {
  // Try simple GET — ReliefWeb v1 may work without registration for unfiltered queries
  const url = 'https://api.reliefweb.int/v1/reports?appname=csiors.org&profile=list&limit=50&fields[include][]=title&fields[include][]=country.name&sort[]=date:desc';

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ReliefWeb ${res.status}: ${text.slice(0, 100)}`);
  }

  const data = await res.json();
  const items: { source: string; region: string; title: string }[] = [];

  for (const report of (data.data || [])) {
    const title = report.fields?.title || '';
    if (!title) continue;

    // Get country from structured field
    const countries: { name: string }[] = report.fields?.country || [];
    const matchedCountry = countries.find(c => FOCUS_COUNTRIES.has(c.name));
    if (!matchedCountry) continue; // Skip non-focus countries

    let displayTitle = title;
    const colonIdx = title.indexOf(':');
    if (colonIdx > 0 && colonIdx < 30) {
      displayTitle = title.slice(colonIdx + 1).trim();
    }
    if (displayTitle.length > 65) displayTitle = displayTitle.slice(0, 62) + '...';

    items.push({ source: 'ReliefWeb', region: matchedCountry.name, title: displayTitle });
    if (items.length >= 6) break;
  }

  return items;
}

async function fetchGDACS(): Promise<{ source: string; region: string; title: string }[]> {
  // GDACS RSS — free, no registration, global disaster alerts
  const res = await fetch('https://www.gdacs.org/xml/rss.xml', {
    headers: { 'User-Agent': 'CSIORS/1.0' },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`GDACS ${res.status}`);
  const xml = await res.text();

  const items: { source: string; region: string; title: string }[] = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const block of itemBlocks.slice(0, 15)) {
    const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                       block.match(/<title>(.*?)<\/title>/);
    if (!titleMatch) continue;

    let title = titleMatch[1].trim();
    if (title.length > 65) title = title.slice(0, 62) + '...';

    items.push({ source: 'GDACS', region: 'Alert', title });
    if (items.length >= 6) break;
  }

  return items;
}

export const GET: APIRoute = async () => {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return new Response(JSON.stringify(cache.items), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  let items: { source: string; region: string; title: string }[] = [];

  // Try ReliefWeb first, fall back to GDACS
  try {
    items = await fetchReliefWeb();
  } catch (e: any) {
    console.error('ReliefWeb failed:', e?.message);
    try {
      items = await fetchGDACS();
    } catch (e2: any) {
      console.error('GDACS failed:', e2?.message);
    }
  }

  cache = { items, ts: Date.now() };

  const maxAge = items.length > 0 ? 900 : 300;
  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${maxAge}`,
      'Access-Control-Allow-Origin': '*',
    },
  });
};
