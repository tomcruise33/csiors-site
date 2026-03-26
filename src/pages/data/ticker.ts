export const prerender = false;

import type { APIRoute } from 'astro';

const FOCUS_COUNTRIES = new Set([
  'Syria', 'Ethiopia', 'Sudan', 'Yemen', 'Lebanon', 'Nigeria',
  'Turkey', 'Iraq', 'Somalia', 'Morocco', 'Libya', 'Egypt',
  'Tunisia', 'Eritrea', 'South Sudan', 'Kenya', 'Djibouti',
]);

// Lowercase variants for fuzzy matching in unstructured text (GDACS titles)
const FOCUS_KEYWORDS = new Map<string, string>();
for (const c of FOCUS_COUNTRIES) {
  FOCUS_KEYWORDS.set(c.toLowerCase(), c);
}
// Add common variants
FOCUS_KEYWORDS.set('türkiye', 'Turkey');
FOCUS_KEYWORDS.set('turkiye', 'Turkey');
FOCUS_KEYWORDS.set('south sudan', 'South Sudan');

let cache: { items: any[]; ts: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000;

type TickerItem = { source: string; region: string; title: string };

async function fetchReliefWeb(): Promise<TickerItem[]> {
  // POST with JSON body — more reliable than GET with query params
  const res = await fetch('https://api.reliefweb.int/v1/reports?appname=csiors.org', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      profile: 'list',
      limit: 50,
      fields: { include: ['title', 'country.name'] },
      sort: ['date:desc'],
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ReliefWeb ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const items: TickerItem[] = [];

  for (const report of (data.data || [])) {
    const title = report.fields?.title || '';
    if (!title) continue;

    const countries: { name: string }[] = report.fields?.country || [];
    const matchedCountry = countries.find(c => FOCUS_COUNTRIES.has(c.name));
    if (!matchedCountry) continue;

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

function matchFocusCountry(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [keyword, country] of FOCUS_KEYWORDS) {
    if (lower.includes(keyword)) return country;
  }
  return null;
}

async function fetchGDACS(): Promise<TickerItem[]> {
  const res = await fetch('https://www.gdacs.org/xml/rss.xml', {
    headers: { 'User-Agent': 'CSIORS/1.0' },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`GDACS ${res.status}`);
  const xml = await res.text();

  const items: TickerItem[] = [];
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const block of itemBlocks) {
    const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
                       block.match(/<title>(.*?)<\/title>/);
    if (!titleMatch) continue;

    const rawTitle = titleMatch[1].trim();

    // Only include alerts mentioning CSIORS focus countries
    const country = matchFocusCountry(rawTitle);
    if (!country) continue;

    let title = rawTitle;
    if (title.length > 65) title = title.slice(0, 62) + '...';

    items.push({ source: 'GDACS', region: country, title });
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

  let items: TickerItem[] = [];

  // Try ReliefWeb first (MENA/Africa focused), fall back to GDACS (filtered)
  try {
    items = await fetchReliefWeb();
    if (items.length > 0) console.log(`Ticker: ${items.length} items from ReliefWeb`);
  } catch (e: any) {
    console.error('ReliefWeb failed:', e?.message);
  }

  // If ReliefWeb returned nothing, try GDACS (filtered by focus countries)
  if (items.length === 0) {
    try {
      const gdacsItems = await fetchGDACS();
      items = gdacsItems;
      if (items.length > 0) console.log(`Ticker: ${items.length} items from GDACS`);
    } catch (e2: any) {
      console.error('GDACS failed:', e2?.message);
    }
  }

  cache = { items, ts: Date.now() };

  // If no relevant items, return empty — ticker stays CSIORS-only (graceful degradation)
  const maxAge = items.length > 0 ? 900 : 300;
  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${maxAge}`,
      'Access-Control-Allow-Origin': '*',
    },
  });
};
