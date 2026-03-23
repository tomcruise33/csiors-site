#!/usr/bin/env node
/**
 * CSIORS AI Content Pipeline
 *
 * Fetches field data from KoboToolbox, calculates EWS indicators,
 * and generates an intelligence brief using Grok API.
 * Output: a markdown file ready for the Astro content collection.
 *
 * Usage:
 *   KOBO_TOKEN=xxx GROK_API_KEY=xxx node scripts/generate-brief.mjs
 *
 * Or via GitHub Actions (secrets injected automatically).
 */

import fs from 'fs';
import path from 'path';

// ── Config ──────────────────────────────────────────────────────────
const KOBO_TOKEN = process.env.KOBO_TOKEN;
const GROK_API_KEY = process.env.GROK_API_KEY;
const KOBO_ASSET_UID = process.env.KOBO_ASSET_UID || 'abcLY2v3kPakMtrmBisUsm';
const KOBO_BASE = process.env.KOBO_BASE || 'https://eu.kobotoolbox.org'; // EU server
const GROK_MODEL = 'grok-4-1-fast-non-reasoning';

// ── Helpers ─────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// ── Step 1: Fetch KoboToolbox submissions ───────────────────────────
async function fetchSubmissions(dayRange = 7) {
  const since = daysAgo(dayRange);
  const url = `${KOBO_BASE}/api/v2/assets/${KOBO_ASSET_UID}/data.json?query={"_submission_time":{"$gte":"${since}"}}&limit=500&sort={"_submission_time":-1}`;

  console.log(`📡 Fetching KoboToolbox data since ${since}...`);

  const res = await fetch(url, {
    headers: { Authorization: `Token ${KOBO_TOKEN}` },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`   → Response body: ${body.slice(0, 500)}`);
    throw new Error(`KoboToolbox API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const results = data.results || [];
  console.log(`   → ${results.length} submissions found (total: ${data.count || 'unknown'})`);

  // Debug: show field names from first submission
  if (results.length > 0) {
    console.log(`   → Fields in first submission: ${Object.keys(results[0]).filter(k => !k.startsWith('_')).join(', ')}`);
  }

  return results;
}

// ── Step 2: Analyze submissions by country ──────────────────────────
function analyzeByCountry(submissions) {
  const countries = {};

  for (const sub of submissions) {
    // Adapt field names to your actual KoboToolbox survey structure
    const country = sub.country || sub.Country || sub.location_country || 'Unknown';
    if (!countries[country]) {
      countries[country] = {
        count: 0,
        displacement: [],
        foodPrices: [],
        safety: [],
        healthcare: [],
        raw: [],
      };
    }
    const c = countries[country];
    c.count++;
    c.raw.push(sub);

    // Extract numeric fields (adapt to your actual field names)
    if (sub.displacement_30d !== undefined) c.displacement.push(Number(sub.displacement_30d));
    if (sub.food_price_change !== undefined) c.foodPrices.push(Number(sub.food_price_change));
    if (sub.safety_perception !== undefined) c.safety.push(sub.safety_perception);
    if (sub.healthcare_access !== undefined) c.healthcare.push(sub.healthcare_access);
  }

  return countries;
}

// ── Step 3: Calculate EWS score ─────────────────────────────────────
function calculateEWS(countryData) {
  let score = 25; // baseline

  // Food price component (0-30 points)
  if (countryData.foodPrices.length > 0) {
    const avgFoodChange = countryData.foodPrices.reduce((a, b) => a + b, 0) / countryData.foodPrices.length;
    score += Math.min(30, Math.max(0, avgFoodChange * 2));
  }

  // Displacement component (0-30 points)
  if (countryData.displacement.length > 0) {
    const displacementRate = countryData.displacement.filter(d => d === 1 || d === true).length / countryData.displacement.length;
    score += Math.round(displacementRate * 30);
  }

  // Safety component (0-20 points)
  if (countryData.safety.length > 0) {
    const negativeCount = countryData.safety.filter(s =>
      typeof s === 'string' && (s.toLowerCase().includes('deteriorat') || s.toLowerCase().includes('unsafe') || s.toLowerCase().includes('bad'))
    ).length;
    score += Math.round((negativeCount / countryData.safety.length) * 20);
  }

  // Healthcare component (0-20 points)
  if (countryData.healthcare.length > 0) {
    const limitedCount = countryData.healthcare.filter(h =>
      typeof h === 'string' && (h.toLowerCase().includes('limit') || h.toLowerCase().includes('none') || h.toLowerCase().includes('no access'))
    ).length;
    score += Math.round((limitedCount / countryData.healthcare.length) * 20);
  }

  return Math.min(100, Math.round(score));
}

// ── Step 4: Pick the top story ──────────────────────────────────────
function pickTopStory(countriesData) {
  let topCountry = null;
  let topScore = -1;

  for (const [country, data] of Object.entries(countriesData)) {
    if (data.count < 2) continue; // need at least 2 responses for reliability
    const ews = calculateEWS(data);
    if (ews > topScore) {
      topScore = ews;
      topCountry = { name: country, ...data, ews };
    }
  }

  // Fallback: if no country has 2+ responses, pick the one with most
  if (!topCountry) {
    const sorted = Object.entries(countriesData).sort((a, b) => b[1].count - a[1].count);
    if (sorted.length > 0) {
      const [name, data] = sorted[0];
      topCountry = { name, ...data, ews: calculateEWS(data) };
    }
  }

  return topCountry;
}

// ── Step 5: Generate brief via Grok API ─────────────────────────────
async function generateBrief(topStory, allCountries) {
  const alertLevel = topStory.ews >= 51 ? 'alert' : topStory.ews >= 26 ? 'watch' : 'stable';

  const avgFoodPrice = topStory.foodPrices.length > 0
    ? (topStory.foodPrices.reduce((a, b) => a + b, 0) / topStory.foodPrices.length).toFixed(0)
    : 'N/A';

  const foodPriceStr = avgFoodPrice !== 'N/A' ? `${avgFoodPrice > 0 ? '+' : ''}${avgFoodPrice}%` : 'N/A';

  const displacementRate = topStory.displacement.length > 0
    ? Math.round((topStory.displacement.filter(d => d === 1 || d === true).length / topStory.displacement.length) * 100)
    : 'N/A';

  const contextSummary = Object.entries(allCountries)
    .map(([name, data]) => `${name}: ${data.count} responses, EWS ${calculateEWS(data)}`)
    .join('; ');

  const systemPrompt = `You are a senior intelligence analyst at CSIORS (Czech Slovak Institute of Oriental Studies). You write concise, data-driven intelligence briefs about migration, food security, and regional stability across the Middle East, North Africa, and the Horn of Africa.

Your writing style:
- Factual, measured, no sensationalism
- Lead with the most operationally significant finding
- Reference specific data points (EWS scores, percentages, response counts)
- Note data limitations (small sample sizes, geographic gaps)
- Compare with recent trends when possible
- Use humanitarian/intelligence community terminology
- 400-600 words for the body
- Write in English`;

  const userPrompt = `Generate an intelligence brief based on the following field data collected this week:

FOCUS COUNTRY: ${topStory.name}
- Field responses: ${topStory.count}
- Early Warning Score (EWS): ${topStory.ews}/100 (${alertLevel})
- Average food price change: ${foodPriceStr}
- Recent displacement rate: ${displacementRate}${typeof displacementRate === 'number' ? '%' : ''}
- Alert level: ${alertLevel}

OTHER MONITORED COUNTRIES THIS WEEK:
${contextSummary}

Generate the following in JSON format:
{
  "title": "A headline for this brief (50-80 chars, specific and data-driven)",
  "summary": "A 1-2 sentence summary for the feed page (max 200 chars)",
  "body": "The full brief body in markdown (400-600 words). Include sections with ## headers: Overview, Key Findings, Data Limitations, Outlook.",
  "sources": "Data sources used, e.g. 'Field data, WFP price monitoring, open-source signals'"
}

Return ONLY the JSON, no other text.`;

  console.log(`🤖 Generating brief with Grok (${GROK_MODEL})...`);

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Grok API error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  const content = data.choices[0].message.content;

  // Parse JSON from response (handle possible markdown code blocks)
  const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const brief = JSON.parse(jsonStr);

  console.log(`   → Title: ${brief.title}`);
  console.log(`   → Tokens used: ${data.usage?.total_tokens || 'unknown'}`);

  return {
    ...brief,
    region: topStory.name,
    alert: alertLevel,
    ews: topStory.ews,
    food_price: foodPriceStr,
    responses: topStory.count,
  };
}

// ── Step 6: Write markdown file ─────────────────────────────────────
function writeBrief(brief) {
  const date = today();
  const slug = slugify(brief.title);
  const filename = `${date}-${slug}.md`;
  const filepath = path.join('src', 'content', 'briefs', filename);

  const frontmatter = `---
title: "${brief.title.replace(/"/g, '\\"')}"
date: ${date}
region: "${brief.region}"
alert: "${brief.alert}"
ews: ${brief.ews}
food_price: "${brief.food_price}"
responses: ${brief.responses}
summary: "${brief.summary.replace(/"/g, '\\"')}"
sources: "${brief.sources.replace(/"/g, '\\"')}"
---

${brief.body}
`;

  fs.writeFileSync(filepath, frontmatter);
  console.log(`📝 Written: ${filepath}`);
  return filepath;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  CSIORS AI Content Pipeline');
  console.log(`  ${today()}`);
  console.log('═══════════════════════════════════════════════\n');

  // Validate env
  if (!KOBO_TOKEN) throw new Error('Missing KOBO_TOKEN environment variable');
  if (!GROK_API_KEY) throw new Error('Missing GROK_API_KEY environment variable');

  console.log(`📋 Config:`);
  console.log(`   KoboToolbox: ${KOBO_BASE}`);
  console.log(`   Asset UID: ${KOBO_ASSET_UID}`);
  console.log(`   Grok model: ${GROK_MODEL}`);
  console.log(`   KOBO_TOKEN: ${KOBO_TOKEN ? '***' + KOBO_TOKEN.slice(-4) : 'MISSING'}`);
  console.log(`   GROK_API_KEY: ${GROK_API_KEY ? '***' + GROK_API_KEY.slice(-4) : 'MISSING'}\n`);

  // Fetch and analyze — try 30 days if 7 days returns nothing
  let submissions = await fetchSubmissions(7);
  if (submissions.length === 0) {
    console.log('   → No data in 7 days, trying 30 days...');
    submissions = await fetchSubmissions(30);
  }
  if (submissions.length === 0) {
    console.log('   → No data in 30 days, trying 90 days...');
    submissions = await fetchSubmissions(90);
  }

  if (submissions.length === 0) {
    console.log('⚠️  No new submissions in the past 7 days. Skipping brief generation.');
    process.exit(0);
  }

  const countries = analyzeByCountry(submissions);
  console.log(`\n📊 Countries with data: ${Object.keys(countries).join(', ')}`);

  const topStory = pickTopStory(countries);
  if (!topStory) {
    console.log('⚠️  Not enough data to generate a brief. Skipping.');
    process.exit(0);
  }

  console.log(`\n🎯 Top story: ${topStory.name} (EWS: ${topStory.ews}, responses: ${topStory.count})\n`);

  // Generate and save
  const brief = await generateBrief(topStory, countries);
  const filepath = writeBrief(brief);

  console.log('\n✅ Pipeline complete!');
  console.log(`   Brief saved to: ${filepath}`);

  // Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `brief_path=${filepath}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `brief_title=${brief.title}\n`);
  }
}

main().catch(err => {
  console.error('❌ Pipeline failed:', err.message);
  process.exit(1);
});
