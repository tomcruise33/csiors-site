# CSIORS Field Data Methodology

**Version**: 1.0 — March 2026
**Author**: Tomáš Križan, CEO & Founder
**Status**: Internal working document — defines how CSIORS collects, validates, and publishes field survey data

---

## 1. What CSIORS Data Actually Is

CSIORS operates an **anonymous field informant network** across 37 countries in the MENA region and Horn of Africa. This is not a statistically representative survey. It is a **qualitative early-warning system** built on ground-level human reporting.

**Current scale (as of March 2026):**

- 43 validated entries from KoboToolbox + legacy CSV baseline
- 24 entries from Syria (8 cities), 8 from Nigeria, remainder scattered across Lebanon, Jordan, Egypt, Turkey, Morocco
- Reporting frequency: approximately 1–3 new submissions per month
- Active respondent pool: estimated 10–15 individuals

**What this means analytically:** With this volume, CSIORS cannot produce quantitative market monitoring comparable to WFP's mVAM (which uses hundreds of data points per country per month). What CSIORS *can* produce is **qualitative situational intelligence** — ground-truth signals from specific locations, cross-referenced against publicly available datasets, with transparent limitations.

**The honest framing:** "Our respondent in Raqqa reports flour at 3,000 SYP in March, consistent with WFP's regional trend of +8%. This is a single data point, not a market average." This is academically defensible. "Average flour price in Syria: 3,200 SYP (n=5, ±400)" is not — it implies statistical validity that does not exist at n=5.

---

## 2. Data Collection

### 2.1 Instrument

KoboToolbox v2 structured form covering:

- **Location**: country, city, market type
- **Prices**: 8 commodity prices (flour, rice, oil, eggs, water, gasoline, diesel, LPG) + electricity
- **Employment**: skilled/unskilled daily wages, rent, job availability
- **Security**: public mood, freedom of movement, road closures, incidents
- **Migration**: observed departures, reasons, destinations
- **Open field**: free-text field observation

All fields are optional except country and city. This is deliberate — a respondent under pressure can submit a partial report quickly.

### 2.2 Sync Pipeline

KoboToolbox API is polled every 6 hours via GitHub Actions. New submissions are deduplicated by `kobo_id`, normalized (city names, currencies), and merged into a cumulative JSON dataset. Legacy CSV baseline (pre-KoboToolbox entries from Google Forms) is preserved and included.

### 2.3 Anonymity

Respondents are identified only by self-assigned initials and an optional email. No names, no GPS coordinates from devices. City-level location is the maximum granularity. This is a non-negotiable design decision — the safety of respondents in conflict zones takes absolute precedence over data precision.

---

## 3. Data Validation

### 3.1 Automated Checks (existing in kobo_sync.py)

These are already implemented and working:

- **Currency detection**: explicit field + heuristic fallback (flour < 500 SYP → likely USD)
- **Price anomaly flagging**: cross-commodity ratios (rice should be 0.5x–3x flour; 100x+ ratio = likely error)
- **Quality flags**: each entry gets `quality: "ok"` or `quality: "suspect"` with specific `currency_flag` and `price_warnings`

### 3.2 What's Missing: External Cross-Validation

Before any data point is published, it must be checked against at least one external reference. Priority sources:

| Source | Coverage | Access | Use |
|--------|----------|--------|-----|
| **WFP VAM** (vam.wfp.org) | Syria, Yemen, Nigeria, Ethiopia | Public API + reports | Commodity price benchmarks |
| **REACH Initiative** | Syria, Iraq, Somalia | Public reports | Market monitoring, displacement |
| **ACLED** | Global | API (free for research) | Security incident verification |
| **UNHCR Operational Data Portal** | Global displacement | Public | Migration/displacement cross-check |
| **Central Bank exchange rates** | Per country | Public | Currency conversion validation |

**Validation rule:** A price data point is publishable if:
1. It falls within ±30% of the most recent WFP/REACH benchmark for that commodity in that region, OR
2. The deviation is acknowledged and explained in the output ("respondent reports flour at 5,000 SYP — 40% above WFP's December average of 3,600 SYP for Aleppo governorate, possibly reflecting local supply disruption")

A price data point with no external benchmark available is reported as unverified: "respondent-reported, no independent benchmark available for this location."

### 3.3 What's Missing: Respondent Trust Score

Every respondent builds a trust profile over time. This is not about surveillance — it's about data weighting.

**Trust score components (0–100):**

- **Consistency** (40%): Do their reported prices fall within plausible ranges over time? A respondent who reports flour at 3,000 SYP one month and 300,000 the next without explanation gets a lower score.
- **Frequency** (20%): Regular monthly contributors score higher than one-time submitters. Score increases logarithmically (diminishing returns after ~6 months).
- **Completeness** (15%): Respondents who fill more fields (especially the difficult ones like wages and security) provide more analytical value.
- **External alignment** (25%): When external benchmarks exist, how often does this respondent's data align? This is the most important factor but requires time to accumulate.

**Practical thresholds:**

- **New respondent** (0–2 submissions): trust = "unverified" — data is included but flagged
- **Establishing** (3–5 submissions): trust = "provisional" — data contributes to analysis with caveats
- **Established** (6+ consistent submissions): trust = "verified" — data is weighted normally
- **Flagged**: any respondent whose data consistently contradicts external benchmarks → reviewed manually

**Timeline to implement:** This requires 3–6 months of accumulated data per respondent. Until then, all respondents are effectively "unverified" or "provisional."

---

## 4. Analytical Framework

### 4.1 Aggregation Level

Given current data volume:

- **Country level** is the primary unit of analysis. City-level data is mentioned as context ("respondent in Raqqa reports..."), not as a statistic.
- **No city-level averages** until a city has 5+ data points from 3+ distinct respondents within a 90-day window.
- **Regional aggregation** (e.g., "northern Syria") requires 3+ cities contributing data.

### 4.2 Calculated Indicators (existing, keep)

The pipeline already calculates these correctly:

- **Terms of Trade (ToT)**: `daily_unskilled_wage / flour_price_per_kg` — WFP-aligned thresholds (Emergency < 3, Crisis 3–5, Stressed 5–8, Acceptable 8–12, Good > 12)
- **Food Basket Cost**: sum of 5 staples, requires 3/5 valid prices
- **Early Warning Score (EWS)**: composite 0–100 from mood, movement, employment, departures, purchasing power

These are valid indicators *per entry* — they describe what one respondent is experiencing. The problem is aggregating them into country-level claims without sufficient sample size.

### 4.3 What Changes: From Statistics to Signals

**Old model (wrong):**
> "Average flour price in Syria: 3,200 SYP (n=5, ±400, medium confidence)"

**New model (correct):**
> "Five respondents across three Syrian cities (Raqqa, Aleppo, Deir ez-Zor) reported flour prices ranging from 2,800–3,500 SYP in Q1 2026. This is broadly consistent with WFP's January 2026 bulletin showing a 6–10% increase in northern Syria. One respondent in Raqqa (established contributor, 4 prior reports) noted prices 15% above the regional average, citing supply route disruption."

The difference: every claim is attributed, sourced, and bounded. No implied statistical representativeness.

### 4.4 Trend Detection

With small samples, formal trend analysis is not appropriate. Instead:

- **Direction only**: "prices are rising/falling/stable" based on same-respondent longitudinal comparison (respondent X reported 2,800 in November, 3,200 in February = +14%)
- **Corroboration**: a trend is only stated if 2+ independent respondents show the same direction, OR if 1 respondent's data aligns with an external source
- **No percentage claims at country level** unless backed by external benchmark ("WFP reports +8% nationally; our respondents' data is consistent with this")

---

## 5. Publication Rules

### 5.1 When to Publish

A Situational Report (the output) is generated when ANY of these conditions are met:

1. **Signal threshold**: a new submission shows EWS ≥ 51 (alert level) from an established respondent
2. **Accumulation threshold**: 3+ new submissions from a single country within 60 days, with at least 1 external cross-reference
3. **Change detection**: a respondent reports a change ≥ 20% in any key price indicator compared to their own previous submission, corroborated by external trend
4. **Scheduled review**: quarterly country review when total entries for a country reach 10+ cumulative

### 5.2 When NOT to Publish

- Single unverified submission with no external cross-reference → log internally, do not publish
- Data contradicts all external benchmarks with no plausible explanation → flag for manual review
- Country has only 1 respondent → can publish as "single-source report" with prominent disclaimer, not as situational analysis

### 5.3 Output Format

Replace "Field Brief" with **"Situational Report"** to accurately reflect the qualitative nature.

**Required sections:**

1. **Header**: country, date range, number of respondents (n=X), data sources used
2. **Key Signals**: what respondents are reporting, attributed by location (not aggregated)
3. **External Context**: relevant WFP/REACH/ACLED data that corroborates or contradicts
4. **Indicators**: ToT, EWS per respondent (not averaged), food basket where available
5. **Limitations**: explicit statement of sample size, respondent verification status, and what this report cannot claim
6. **Outlook**: directional assessment only, no forecasts

### 5.4 Mandatory Disclaimer (on every report)

> "This report is based on [n] field submissions from [x] respondents in [country] collected between [date range]. CSIORS field data represents ground-level qualitative intelligence, not statistically representative market monitoring. All price data is cross-referenced against available external benchmarks where possible. For comprehensive market data, refer to WFP VAM and REACH Initiative publications."

---

## 6. Pipeline Phases

### Phase 1: Collect & Validate (NOW → implement immediately)

Pipeline runs on schedule but does NOT auto-generate reports. Instead:

- Syncs KoboToolbox data every 6 hours (already working)
- Validates and flags each entry (already working)
- Adds to cumulative dataset with running trust metadata per respondent
- Logs: "New entry from [country], respondent [initials], trust: [level]. External validation: [pending/passed/failed]"
- **No automatic publication**

### Phase 2: Cross-Reference (implement next)

Add external data fetching:

- WFP VAM API pull for relevant countries (monthly commodity prices)
- Store as reference dataset alongside field data
- Auto-compare new submissions against latest WFP data
- Flag significant deviations for review

### Phase 3: Situational Reports (when data supports it)

Re-enable report generation with new rules:

- Publication triggers as defined in Section 5.1
- AI synthesis prompt rewritten for qualitative framing (no pseudo-statistics)
- Every report includes external cross-references and explicit limitations
- Human review step before publication (Tom approves via GitHub PR, not auto-merge)

### Phase 4: Trust & Longitudinal Analysis (3–6 months)

- Respondent trust scores become meaningful (enough history)
- Same-respondent trend analysis becomes possible
- Twitter/Grok cross-verification layer for real-time corroboration
- Weighted analysis: established respondents' data gets more prominent placement

---

## 7. What This Means for the Current Pipeline

### Keep (already implemented well):
- KoboToolbox sync with deduplication
- Currency detection and price anomaly flagging
- ToT, Food Basket, and EWS calculations per entry
- Structured JSON output format

### Change:
- **generate-brief.mjs**: pause auto-generation, switch to accumulation mode
- **Quality gate**: replace "3 responses in 7 days" with publication rules from Section 5.1
- **AI prompt**: rewrite from "analyst producing a brief" to "analyst producing a situational report with sourced claims and stated limitations"
- **Output naming**: "Situational Report" not "Field Brief"
- **GitHub workflow**: change from auto-commit to PR creation for human review

### Add:
- External reference data store (WFP benchmark prices per country/commodity)
- Respondent trust tracking (JSON metadata per respondent ID)
- Cross-validation step between field data and external benchmarks
- Publication decision logic (is there enough signal to publish?)

### Remove:
- Country-level averaging with n < 10
- Confidence intervals at any sample size below 30
- Automatic brief publication without human review
- "3 responses in 7 days" threshold (replaced by signal-based triggers)

---

## 8. Success Metrics

How do we know this methodology is working?

1. **Zero reputational incidents**: no published claim that contradicts publicly available data without acknowledgment
2. **Every report cites at least 1 external source**: WFP, REACH, ACLED, or equivalent
3. **Respondent retention**: monthly active respondents trend upward (current: ~2–3/month → target: 10/month by Q4 2026)
4. **Report credibility**: reports are cited or referenced by other researchers/organizations (long-term)
5. **Data accumulation**: cumulative entries per priority country grow month-over-month

---

*This document governs all CSIORS field data processing and publication. Pipeline code changes must align with these rules. Any deviation requires explicit approval from the CEO.*
