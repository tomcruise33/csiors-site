#!/usr/bin/env node
/**
 * CSIORS AI Content Pipeline
 *
 * Fetches field data from KoboToolbox, calculates EWS indicators,
 * and generates a field brief using DeepSeek API.
 * Output: a markdown file ready for the Astro content collection.
 *
 * Usage:
 *   KOBO_TOKEN=xxx DEEPSEEK_API_KEY=xxx node scripts/generate-brief.mjs
 *
 * Or via GitHub Actions (secrets injected automatically).
 */

import fs from 'fs';
import path from 'path';

// ── Config ──────────────────────────────────────────────────────────
const KOBO_TOKEN = process.env.KOBO_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const KOBO_ASSET_UID = process.env.KOBO_ASSET_UID || 'abcLY2v3kPakMtrmBisUsm';
const KOBO_BASE = process.env.KOBO_BASE || 'https://eu.kobotoolbox.org'; // EU server
const DEEPSEEK_MODEL = 'deepseek-chat';

// ── Quality gates ───────────────────────────────────────────────────
const MIN_RESPONSES_FOR_BRIEF = 3;       // don't publish on <3 responses
const REJECT_UNKNOWN_COUNTRY = true;      // skip "Unknown" countries

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

/**
 * Extract a field from a KoboToolbox submission by trying multiple aliases.
 * v2 forms use group prefixes like "group_location/country".
 */
function extractField(sub, aliases) {
  for (const alias of aliases) {
    if (sub[alias] !== undefined && sub[alias] !== null && sub[alias] !== '') return sub[alias];
    // Handle nested group/field paths
    if (alias.includes('/')) {
      const parts = alias.split('/');
      let obj = sub;
      for (const part of parts) {
        if (obj && typeof obj === 'object' && part in obj) {
          obj = obj[part];
        } else {
          obj = null;
          break;
        }
      }
      if (obj !== null && obj !== undefined && obj !== '') return obj;
    }
  }
  return null;
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

// ── KoboToolbox field aliases (matching v2 form structure) ───────────
const FIELD_ALIASES = {
  country:     ['group_location/country', 'country', 'location/country', 'البلد'],
  city:        ['group_location/city', 'city', 'location/city', 'المدينة'],
  mood:        ['group_security/public_mood', 'public_mood', 'security/mood', 'المزاج_العام'],
  movement:    ['group_security/freedom_movement', 'freedom_of_movement', 'security/movement', 'حرية_التنقل'],
  departures:  ['group_migration/observed_departures', 'observed_departures', 'migration/departures', 'المغادرات'],
  job:         ['group_employment/job_availability', 'job_availability', 'employment/job_avail', 'توفر_العمل'],
  flour:       ['group_prices/flour_price', 'flour_price', 'prices/flour_1kg', 'سعر_الطحين'],
  rice:        ['group_prices/rice_price', 'rice_price', 'prices/rice_1kg', 'سعر_الأرز'],
  oil:         ['group_prices/oil_price', 'oil_price', 'prices/cooking_oil_1l', 'سعر_الزيت'],
  eggs:        ['group_prices/eggs_price', 'eggs_price', 'prices/eggs_10pcs', 'سعر_البيض'],
  water:       ['group_prices/water_price', 'water_price', 'prices/water_1_5l', 'سعر_الماء'],
};

// ── Step 2: Analyze submissions by country ──────────────────────────
function analyzeByCountry(submissions) {
  const countries = {};

  for (const sub of submissions) {
    const country = extractField(sub, FIELD_ALIASES.country) || 'Unknown';
    const city = extractField(sub, FIELD_ALIASES.city) || '';

    if (!countries[country]) {
      countries[country] = {
        count: 0,
        cities: new Set(),
        mood: [],
        movement: [],
        departures: [],
        job: [],
        prices: { flour: [], rice: [], oil: [], eggs: [], water: [] },
        raw: [],
      };
    }
    const c = countries[country];
    c.count++;
    if (city) c.cities.add(city);
    c.raw.push(sub);

    // Extract actual KoboToolbox fields
    const mood = extractField(sub, FIELD_ALIASES.mood);
    if (mood) c.mood.push(mood);

    const movement = extractField(sub, FIELD_ALIASES.movement);
    if (movement) c.movement.push(movement);

    const departures = extractField(sub, FIELD_ALIASES.departures);
    if (departures) c.departures.push(departures);

    const job = extractField(sub, FIELD_ALIASES.job);
    if (job) c.job.push(job);

    // Prices
    for (const priceKey of ['flour', 'rice', 'oil', 'eggs', 'water']) {
      const val = extractField(sub, FIELD_ALIASES[priceKey]);
      if (val !== null && !isNaN(Number(val))) c.prices[priceKey].push(Number(val));
    }
  }

  return countries;
}

// ── Scoring maps (lowercase — matching v2 categorical values) ───────
const MOOD_SCORES = {
  'hopeful': 0, 'optimistic': 0,
  'neutral': 5, 'stable': 5,
  'worried': 15, 'concerned': 15,
  'angry': 20, 'desperate': 25, 'fearful': 25,
};
const MOVE_SCORES = {
  'free': 0, 'mostly_free': 5,
  'restricted': 15, 'very_restricted': 25,
};
const JOB_SCORES = {
  'good': 0, 'available': 0,
  'limited': 10, 'moderate': 10,
  'scarce': 20, 'none': 25,
};
const DEPARTURE_SCORES = {
  'none': 0, 'few': 5, 'some': 10, 'many': 20, 'mass': 25,
};

// ── Step 3: Calculate EWS score ─────────────────────────────────────
function calculateEWS(countryData) {
  let score = 10; // low baseline

  // Mood component (0-25 points)
  if (countryData.mood.length > 0) {
    const moodScores = countryData.mood.map(m => MOOD_SCORES[String(m).toLowerCase()] ?? 10);
    score += Math.round(moodScores.reduce((a, b) => a + b, 0) / moodScores.length);
  }

  // Movement restriction component (0-25 points)
  if (countryData.movement.length > 0) {
    const moveScores = countryData.movement.map(m => MOVE_SCORES[String(m).toLowerCase()] ?? 10);
    score += Math.round(moveScores.reduce((a, b) => a + b, 0) / moveScores.length);
  }

  // Job availability component (0-25 points)
  if (countryData.job.length > 0) {
    const jobScores = countryData.job.map(j => JOB_SCORES[String(j).toLowerCase()] ?? 10);
    score += Math.round(jobScores.reduce((a, b) => a + b, 0) / jobScores.length);
  }

  // Departures component (0-25 points)
  if (countryData.departures.length > 0) {
    const depScores = countryData.departures.map(d => DEPARTURE_SCORES[String(d).toLowerCase()] ?? 10);
    score += Math.round(depScores.reduce((a, b) => a + b, 0) / depScores.length);
  }

  return Math.min(100, Math.round(score));
}

// ── Step 4: Pick the top story ──────────────────────────────────────
function pickTopStory(countriesData) {
  let topCountry = null;
  let topScore = -1;

  for (const [country, data] of Object.entries(countriesData)) {
    // Quality gates
    if (REJECT_UNKNOWN_COUNTRY && (!country || country === 'Unknown' || country === 'unknown')) {
      console.log(`   ⚠️  Skipping "${country}" — unknown country`);
      continue;
    }
    if (data.count < MIN_RESPONSES_FOR_BRIEF) {
      console.log(`   ⚠️  Skipping "${country}" — only ${data.count} responses (min: ${MIN_RESPONSES_FOR_BRIEF})`);
      continue;
    }

    const ews = calculateEWS(data);
    if (ews > topScore) {
      topScore = ews;
      topCountry = { name: country, ...data, ews };
    }
  }

  return topCountry; // null if no country passes quality gates — pipeline will skip
}

// ── Step 5: Generate brief via Grok API ─────────────────────────────
async function generateBrief(topStory, allCountries) {
  const alertLevel = topStory.ews >= 51 ? 'alert' : topStory.ews >= 26 ? 'watch' : 'stable';

  // Aggregate price data
  const allPrices = Object.entries(topStory.prices || {})
    .filter(([, vals]) => vals.length > 0)
    .map(([item, vals]) => {
      const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(0);
      return `${item}: ${avg}`;
    });
  const foodPriceStr = allPrices.length > 0 ? allPrices.join(', ') : 'N/A';

  // Mood summary
  const moodSummary = topStory.mood.length > 0
    ? [...new Set(topStory.mood.map(m => String(m).toLowerCase()))].join(', ')
    : 'N/A';

  // Departures summary
  const departuresSummary = topStory.departures.length > 0
    ? [...new Set(topStory.departures.map(d => String(d).toLowerCase()))].join(', ')
    : 'N/A';

  // Cities covered
  const citiesList = topStory.cities ? [...topStory.cities].join(', ') : 'N/A';

  const contextSummary = Object.entries(allCountries)
    .filter(([name]) => name !== 'Unknown')
    .map(([name, data]) => `${name}: ${data.count} responses, EWS ${calculateEWS(data)}`)
    .join('; ');

  const systemPrompt = `You are a senior research analyst at CSIORS (Czech Slovak Institute of Oriental Studies). You write concise, data-driven field briefs about migration, food security, and regional stability across the Middle East, North Africa, and the Horn of Africa.

Your writing style:
- Factual, measured, no sensationalism
- Lead with the most significant finding
- Reference specific data points (EWS scores, percentages, response counts)
- Note data limitations (small sample sizes, geographic gaps)
- Compare with recent trends when possible
- Use academic and humanitarian terminology
- 400-600 words for the body
- Write in English`;

  const userPrompt = `Generate a field brief based on the following data collected this week:

FOCUS COUNTRY: ${topStory.name}
- Cities covered: ${citiesList}
- Field responses: ${topStory.count}
- Early Warning Score (EWS): ${topStory.ews}/100 (${alertLevel})
- Public mood: ${moodSummary}
- Observed departures: ${departuresSummary}
- Market prices: ${foodPriceStr}
- Alert level: ${alertLevel}

OTHER MONITORED COUNTRIES THIS WEEK:
${contextSummary || 'No other countries with sufficient data this week.'}

Generate the following in JSON format:
{
  "title": "A headline for this brief (50-80 chars, specific and data-driven)",
  "summary": "A 1-2 sentence summary for the feed page (max 200 chars)",
  "body": "The full brief body in markdown (400-600 words). Include sections with ## headers: Overview, Key Findings, Data Limitations, Outlook.",
  "sources": "Data sources used, e.g. 'Field data, WFP price monitoring, open-source signals'",
  "tags": ["array of 3-5 topic tags from: migration, food-security, displacement, conflict, economy, governance, humanitarian, climate, health, infrastructure"]
}

Return ONLY the JSON, no other text.`;

  console.log(`🤖 Generating brief with DeepSeek (${DEEPSEEK_MODEL})...`);

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
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
    throw new Error(`DeepSeek API error: ${res.status} — ${err}`);
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
    tags: brief.tags || [],
  };
}

// ── Step 6: Write markdown file ─────────────────────────────────────
function writeBrief(brief) {
  const date = today();
  const slug = slugify(brief.title);
  const filename = `${date}-${slug}.md`;
  const filepath = path.join('src', 'content', 'briefs', filename);

  const tagsYaml = (brief.tags || []).map(t => `  - "${t}"`).join('\n');

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
tags:
${tagsYaml}
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
  if (!DEEPSEEK_API_KEY) throw new Error('Missing DEEPSEEK_API_KEY environment variable');

  console.log(`📋 Config:`);
  console.log(`   KoboToolbox: ${KOBO_BASE}`);
  console.log(`   Asset UID: ${KOBO_ASSET_UID}`);
  console.log(`   DeepSeek model: ${DEEPSEEK_MODEL}`);
  console.log(`   KOBO_TOKEN: ${KOBO_TOKEN ? '***' + KOBO_TOKEN.slice(-4) : 'MISSING'}`);
  console.log(`   DEEPSEEK_API_KEY: ${DEEPSEEK_API_KEY ? '***' + DEEPSEEK_API_KEY.slice(-4) : 'MISSING'}\n`);

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
