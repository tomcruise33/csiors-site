export const prerender = false;

import type { APIRoute } from 'astro';

// ReliefWeb JSON API — more reliable than RSS, supports filtering by country
const RW_API = 'https://api.reliefweb.int/v1/reports';
const COUNTRIES = [
  'Syria', 'Ethiopia', 'Sudan', 'Yemen', 'Lebanon', 'Nigeria',
  'Turkey', 'Iraq', 'Somalia', 'Morocco', 'Libya', 'Egypt',
  'Tunisia', 'Eritrea', 'South Sudan', 'Kenya', 'Djibouti',
];

// Simple in-memory cache (Vercel serverless = cold start OK, 15min TTL)
let cache: { items: any[]; ts: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const GET: APIRoute = async () => {
  // Return cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return new Response(JSON.stringify(cache.items), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const url = new URL(RW_API);
    url.searchParams.set('appname', 'csiors.org');
    url.searchParams.set('limit', '20');
    url.searchParams.set('fields[include][]', 'title');
    url.searchParams.set('sort[]', 'date:desc');
    // Filter by CSIORS focus countries
    const filter = {
      operator: 'OR',
      conditions: COUNTRIES.map(c => ({
        field: 'country.name',
        value: c,
      })),
    };
    url.searchParams.set('filter', JSON.stringify(filter));

    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) throw new Error(`ReliefWeb API: ${res.status}`);
    const data = await res.json();

    const items: { source: string; region: string; title: string }[] = [];
    for (const report of (data.data || [])) {
      const title = report.fields?.title || '';
      if (!title) continue;

      // Extract country from title (ReliefWeb titles often start with "Country: ...")
      let region = 'MENA';
      const colonIdx = title.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        region = title.slice(0, colonIdx).trim();
      }

      let displayTitle = colonIdx > 0 && colonIdx < 30
        ? title.slice(colonIdx + 1).trim()
        : title;
      if (displayTitle.length > 65) displayTitle = displayTitle.slice(0, 62) + '...';

      items.push({ source: 'ReliefWeb', region, title: displayTitle });
      if (items.length >= 6) break;
    }

    cache = { items, ts: Date.now() };

    return new Response(JSON.stringify(items), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    console.error('Ticker error:', e?.message || e);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
};
