export const prerender = false;

import type { APIRoute } from 'astro';

// ReliefWeb JSON API v1 — POST with JSON body for complex filters
const RW_API = 'https://api.reliefweb.int/v1/reports?appname=csiors.org';

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
    const body = {
      limit: 20,
      fields: { include: ['title', 'country.name'] },
      sort: ['date:desc'],
      filter: {
        operator: 'OR',
        conditions: [
          { field: 'country.name', value: 'Syria' },
          { field: 'country.name', value: 'Ethiopia' },
          { field: 'country.name', value: 'Sudan' },
          { field: 'country.name', value: 'Yemen' },
          { field: 'country.name', value: 'Lebanon' },
          { field: 'country.name', value: 'Nigeria' },
          { field: 'country.name', value: 'Iraq' },
          { field: 'country.name', value: 'Somalia' },
          { field: 'country.name', value: 'Libya' },
          { field: 'country.name', value: 'Egypt' },
          { field: 'country.name', value: 'Eritrea' },
          { field: 'country.name', value: 'South Sudan' },
          { field: 'country.name', value: 'Kenya' },
          { field: 'country.name', value: 'Djibouti' },
        ],
      },
    };

    const res = await fetch(RW_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ReliefWeb API ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    const items: { source: string; region: string; title: string }[] = [];

    for (const report of (data.data || [])) {
      const title = report.fields?.title || '';
      if (!title) continue;

      // Get country from structured field, fallback to parsing title
      const countries = report.fields?.country || [];
      let region = countries[0]?.name || 'MENA';

      // Clean title: remove "Country: " prefix if present
      let displayTitle = title;
      const colonIdx = title.indexOf(':');
      if (colonIdx > 0 && colonIdx < 30) {
        displayTitle = title.slice(colonIdx + 1).trim();
      }
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
