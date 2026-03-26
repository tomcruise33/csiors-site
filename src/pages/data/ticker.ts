export const prerender = false;

import type { APIRoute } from 'astro';

const RELIEFWEB_RSS = 'https://reliefweb.int/updates/rss.xml';
const COUNTRIES = new Set([
  'syria', 'ethiopia', 'sudan', 'yemen', 'lebanon', 'nigeria',
  'turkey', 'iraq', 'somalia', 'morocco', 'libya', 'egypt',
  'tunisia', 'eritrea', 'south sudan', 'kenya', 'djibouti',
]);

// Simple in-memory cache (Vercel serverless = cold start OK, 15min TTL)
let cache: { items: any[]; ts: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function extractCountry(title: string): string | null {
  // ReliefWeb titles often start with "Country: ..." or mention country names
  const lower = title.toLowerCase();
  for (const c of COUNTRIES) {
    if (lower.includes(c)) {
      return c.charAt(0).toUpperCase() + c.slice(1);
    }
  }
  return null;
}

function parseRSSItems(xml: string): { source: string; region: string; title: string }[] {
  const items: { source: string; region: string; title: string }[] = [];
  // Simple regex-based RSS parsing (no XML lib needed)
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const block of itemBlocks.slice(0, 20)) {
    const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                       block.match(/<title>(.*?)<\/title>/);
    if (!titleMatch) continue;

    let title = titleMatch[1].trim();
    const country = extractCountry(title);
    if (!country) continue; // Skip items not about our focus countries

    // Clean up title: remove "Country: " prefix if present
    title = title.replace(/^[A-Za-z\s]+:\s*/, '');
    if (title.length > 65) title = title.slice(0, 62) + '...';

    items.push({ source: 'ReliefWeb', region: country, title });
    if (items.length >= 6) break;
  }

  return items;
}

export const GET: APIRoute = async () => {
  // Return cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return new Response(JSON.stringify(cache.items), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900', // 15min browser cache
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const res = await fetch(RELIEFWEB_RSS, {
      headers: { 'User-Agent': 'CSIORS/1.0 (https://csiors.org)' },
    });

    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const xml = await res.text();
    console.log('RSS fetched, length:', xml.length, 'first 200:', xml.slice(0, 200));
    const items = parseRSSItems(xml);
    console.log('Parsed items:', items.length);

    cache = { items, ts: Date.now() };

    return new Response(JSON.stringify(items), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    // On error, return empty array — ticker degrades to CSIORS-only
    console.error('Ticker RSS error:', e?.message || e);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // retry sooner on error
      },
    });
  }
};
