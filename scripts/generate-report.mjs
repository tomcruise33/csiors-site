#!/usr/bin/env node
/**
 * CSIORS Situational Report Generator
 *
 * Per Data Methodology v1.0: generates qualitative, sourced reports
 * with attributed claims, external cross-references, and explicit limitations.
 *
 * Data flow:
 *   1. Fetch processed data from csiors-watchtower repo (GitHub raw)
 *      - country_stats.json (aggregated field data)
 *      - respondents.json (trust tiers)
 *      - wfp_benchmarks.json (external reference)
 *      - accumulation_log.json (signal that triggered this run)
 *   2. Build qualitative context (no averages, attributed claims)
 *   3. DeepSeek generates situational report
 *   4. Output as PR-ready markdown in src/content/reports/
 *
 * Triggered by:
 *   - Manual: workflow_dispatch with country parameter
 *   - Signal: repository_dispatch from watchtower (B1.5)
 *
 * Usage:
 *   DEEPSEEK_API_KEY=xxx node scripts/generate-report.mjs --country Syria
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = 'deepseek-chat';
const WATCHTOWER_RAW = 'https://raw.githubusercontent.com/tomcruise33/csiors-watchtower/main';
const REPORT_DIR = path.join(__dirname, '..', 'src', 'content', 'reports');

// ── Helpers ─────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

// ── Step 1: Fetch watchtower data ───────────────────────────────────
async function fetchJSON(urlPath) {
  const url = `${WATCHTOWER_RAW}/${urlPath}`;
  console.log(`   Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`   WARNING: Could not fetch ${urlPath}: ${res.status}`);
    return null;
  }
  return res.json();
}

async function loadWatchtowerData() {
  console.log('📡 Loading data from csiors-watchtower...\n');

  const [countryStats, respondents, benchmarks, accumulationLog, fieldData] = await Promise.all([
    fetchJSON('data/country_stats.json'),
    fetchJSON('data/respondents.json'),
    fetchJSON('data/external/wfp_benchmarks.json'),
    fetchJSON('data/accumulation_log.json'),
    fetchJSON('data/syria_field_data.json'),
  ]);

  return { countryStats, respondents, benchmarks, accumulationLog, fieldData };
}

// ── Step 2: Build qualitative context ───────────────────────────────
function buildCountryContext(countryName, data) {
  const stats = data.countryStats?.countries?.[countryName];
  if (!stats) return null;

  const lines = [];

  // Basic facts
  lines.push(`FIELD DATA SUMMARY (${countryName}):`);
  lines.push(`- Total entries: ${stats.entry_count} from ${stats.city_count} cities`);
  lines.push(`- Date range: ${stats.date_range?.earliest || '?'} to ${stats.date_range?.latest || '?'}`);
  lines.push(`- Cities reporting: ${(stats.cities || []).join(', ')}`);
  lines.push(`- Data quality: ${stats.data_quality?.validated_entries || 0} validated, ${stats.data_quality?.suspect_entries || 0} suspect, ${stats.data_quality?.currency_issues || 0} currency issues`);

  // Respondent trust info
  const respondents = data.respondents?.respondents || {};
  const countryRespondents = Object.values(respondents).filter(r => r.country === countryName);
  if (countryRespondents.length > 0) {
    lines.push(`\nRESPONDENT PROFILES (${countryRespondents.length} tracked):`);
    for (const r of countryRespondents) {
      lines.push(`- ${r.id}: ${r.submission_count} submissions, trust: ${r.trust_tier} (score ${r.trust_score}), cities: ${(r.cities || []).join(', ')}, last: ${r.last_seen}`);
    }
  }

  // Price ranges (NOT averages — per methodology)
  if (stats.prices && Object.keys(stats.prices).length > 0) {
    lines.push('\nPRICE RANGES (from validated entries only, SYP):');
    for (const [commodity, priceData] of Object.entries(stats.prices)) {
      if (priceData && priceData.n > 0) {
        const median = priceData.median ? `, median ${priceData.median}` : '';
        lines.push(`- ${commodity}: ${priceData.min}–${priceData.max} (n=${priceData.n}${median})`);
      }
    }
  }

  // WFP benchmarks for comparison
  const wfpCountry = data.benchmarks?.countries?.[countryName];
  if (wfpCountry) {
    lines.push('\nWFP EXTERNAL BENCHMARKS:');
    for (const [commodity, wfp] of Object.entries(wfpCountry.commodities || {})) {
      lines.push(`- ${commodity}: WFP range ${wfp.price_min}–${wfp.price_max} ${wfp.currency} (median ${wfp.price_median}, as of ${wfp.latest_date})`);
    }
    if (wfpCountry.context?.political_context) {
      lines.push(`- Context: ${wfpCountry.context.political_context}`);
    }
  }

  // Categorical distributions
  if (stats.categorical) {
    lines.push('\nSITUATIONAL INDICATORS:');
    for (const [indicator, counts] of Object.entries(stats.categorical)) {
      const dist = Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ');
      lines.push(`- ${indicator}: ${dist}`);
    }
  }

  // Individual entries for qualitative detail (last 5)
  const fieldEntries = data.fieldData;
  let entries = [];
  if (Array.isArray(fieldEntries)) {
    entries = fieldEntries;
  } else if (fieldEntries?.entries) {
    entries = fieldEntries.entries;
  }

  // Filter to country and get recent ones
  const countryEntries = entries.filter(e => {
    const c = e.country_normalized || e.country || '';
    // For legacy format without country_normalized, infer from city
    if (!c) {
      const city = e.city_normalized || e.city || '';
      const syrianCities = ['Raqqa', 'Al-Hasakah', 'Al-Busayrah', 'Al-Suwar',
                            'Deir ez-Zor', 'Al-Tabqa', 'Al-Mayadin', 'Aleppo'];
      if (syrianCities.includes(city) && countryName === 'Syria') return true;
    }
    return c === countryName;
  });

  // Take last 5 entries
  const recentEntries = countryEntries.slice(-5);
  if (recentEntries.length > 0) {
    lines.push('\nRECENT INDIVIDUAL REPORTS (for qualitative attribution):');
    for (const e of recentEntries) {
      const city = e.city_normalized || e.city || '?';
      const date = e.date || '?';
      const mood = e.security?.public_mood || e.mood || '?';
      const flour = e.prices?.flour_1kg?.price || e.flour || '?';
      const quality = e.quality || 'ok';
      lines.push(`- ${date}, ${city}: flour ${flour} SYP, mood "${mood}", quality: ${quality}`);
    }
  }

  return lines.join('\n');
}

// ── Step 3: Generate report via DeepSeek ────────────────────────────
async function generateReport(countryName, context, stats) {
  const ews = stats?.indicators?.ews;
  const ewsDisplay = ews ? `${ews.min}–${ews.max}` : 'N/A';
  const alertLevel = ews?.median >= 51 ? 'alert' : ews?.median >= 26 ? 'watch' : 'stable';

  const systemPrompt = `You are a senior research analyst at CSIORS (Czech-Slovak Institute of Oriental Studies). You write qualitative situational reports based on field informant data.

CRITICAL RULES — you MUST follow these:
1. NEVER state country-level averages as facts. Say "respondents report prices ranging from X to Y" not "average price is Z"
2. ALWAYS attribute claims to specific respondents/locations: "a respondent in Raqqa reports..." not "flour costs..."
3. ALWAYS include WFP benchmarks when available: "this is consistent with / diverges from WFP data showing..."
4. ALWAYS state the sample size: "based on N field submissions from X respondents"
5. ALWAYS include a Limitations section stating what this report cannot claim
6. ALWAYS end with the mandatory disclaimer
7. Use measured, academic language. No sensationalism. No pseudo-statistics.
8. 400–600 words for the body.
9. Write in English.`;

  const userPrompt = `Generate a CSIORS Situational Report for ${countryName}.

${context}

Generate the following in JSON format:
{
  "title": "Specific, data-grounded headline (50-80 chars). Example: 'Syria Field Report: Flour Prices Diverge Across NE Cities'",
  "summary": "1-2 sentence summary (max 200 chars). Must reference respondent count and date range.",
  "body": "The full report in markdown (400-600 words). REQUIRED sections with ## headers: Overview, Field Signals, External Cross-Reference, Limitations, Disclaimer. The Disclaimer section MUST contain exactly this text: 'This report is based on field submissions from the CSIORS informant network. It represents ground-level qualitative intelligence, not statistically representative market monitoring. For comprehensive market data, refer to WFP VAM and REACH Initiative publications.'",
  "external_sources": ["WFP Syria Monthly Market Price Bulletin", "other sources referenced"],
  "tags": ["3-5 tags from: food-security, displacement, economy, governance, humanitarian, security, migration"]
}

Return ONLY the JSON, no other text.`;

  console.log(`\n🤖 Generating report with DeepSeek (${DEEPSEEK_MODEL})...`);

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
      temperature: 0.3,
      max_tokens: 2500,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API error: ${res.status} — ${err}`);
  }

  const result = await res.json();
  const content = result.choices[0].message.content;
  const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const report = JSON.parse(jsonStr);

  console.log(`   → Title: ${report.title}`);
  console.log(`   → Tokens: ${result.usage?.total_tokens || 'unknown'}`);

  return {
    ...report,
    region: countryName,
    alert: alertLevel,
    ews: ews?.median || 0,
    respondent_count: stats?.respondent_count || 0,
    entry_count: stats?.entry_count || 0,
  };
}

// ── Step 4: Write markdown file ─────────────────────────────────────
function writeReport(report) {
  const date = today();
  const slug = slugify(report.title);
  const filename = `${date}-${slug}.md`;

  // Ensure reports directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const filepath = path.join(REPORT_DIR, filename);
  const tagsYaml = (report.tags || []).map(t => `  - "${t}"`).join('\n');
  const sourcesYaml = (report.external_sources || []).map(s => `  - "${s.replace(/"/g, '\\"')}"`).join('\n');

  const frontmatter = `---
title: "${report.title.replace(/"/g, '\\"')}"
date: ${date}
type: "situational-report"
region: "${report.region}"
alert: "${report.alert}"
ews: ${report.ews}
respondent_count: ${report.respondent_count}
entry_count: ${report.entry_count}
summary: "${report.summary.replace(/"/g, '\\"')}"
external_sources:
${sourcesYaml}
tags:
${tagsYaml}
---

${report.body}
`;

  fs.writeFileSync(filepath, frontmatter);
  console.log(`\n📝 Written: ${filepath}`);
  return filepath;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  CSIORS Situational Report Generator');
  console.log(`  ${today()}`);
  console.log('═══════════════════════════════════════════════\n');

  // Parse args
  const args = process.argv.slice(2);
  let targetCountry = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--country' && args[i + 1]) {
      targetCountry = args[i + 1];
    }
  }

  // Also check env (from repository_dispatch)
  if (!targetCountry) {
    targetCountry = process.env.REPORT_COUNTRY || process.env.INPUT_COUNTRY;
  }

  if (!DEEPSEEK_API_KEY) throw new Error('Missing DEEPSEEK_API_KEY environment variable');

  // Load watchtower data
  const data = await loadWatchtowerData();

  if (!data.countryStats) {
    console.error('ERROR: Could not load country_stats.json from watchtower.');
    process.exit(1);
  }

  // Determine which country to report on
  const availableCountries = Object.keys(data.countryStats.countries || {});
  console.log(`\n📊 Available countries: ${availableCountries.join(', ')}`);

  if (!targetCountry) {
    // Pick the country with most entries that is publication-eligible
    const eligible = availableCountries
      .filter(c => data.countryStats.countries[c].publication_eligible)
      .sort((a, b) => data.countryStats.countries[b].entry_count - data.countryStats.countries[a].entry_count);

    if (eligible.length === 0) {
      console.log('\n⚠️  No country meets publication eligibility criteria. Exiting.');
      console.log('   (Need 3+ validated entries from 2+ respondents)');
      process.exit(0);
    }
    targetCountry = eligible[0];
  }

  const stats = data.countryStats.countries[targetCountry];
  if (!stats) {
    console.error(`ERROR: No data for country "${targetCountry}".`);
    process.exit(1);
  }

  console.log(`\n🎯 Target: ${targetCountry} (${stats.entry_count} entries, ${stats.respondent_count} respondents)`);

  // Build context
  const context = buildCountryContext(targetCountry, data);
  if (!context) {
    console.error(`ERROR: Could not build context for ${targetCountry}.`);
    process.exit(1);
  }

  // Generate report
  const report = await generateReport(targetCountry, context, stats);
  const filepath = writeReport(report);

  console.log('\n✅ Report generation complete!');
  console.log(`   Saved to: ${filepath}`);
  console.log('   → Create a PR for review before merging to main.');

  // Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `report_path=${filepath}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `report_title=${report.title}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `report_country=${targetCountry}\n`);
  }
}

main().catch(err => {
  console.error('❌ Report generation failed:', err.message);
  process.exit(1);
});
