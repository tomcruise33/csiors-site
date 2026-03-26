# CSIORS Ascension Roadmap
## From Regional Institute → Major Platform
*Created: 25 March 2026 | Living document*

---

## Current State (What We Have)

### Website (csiors-site)
- Astro + Vercel, dark editorial design (V3.1), gradient accent
- Pages: Homepage, About, Contact, Feed, Watchtower, Author pages, Brief detail, Expert detail
- 120+ expert analyses migrated from Flazio
- 1 AI-generated brief (Syria bread prices)
- Decap CMS at /admin
- Team photos for all 11 authors
- Ethiopia publication PDF
- Logo assets (PNG variants)
- i18n structure started (SK deactivated)

### Watchtower Dashboard (csiors-watchtower)
- KoboToolbox integration (kobo_sync.py)
- Data analyst pipeline (data_analyst.py)
- HTML dashboard (v1 + v2)
- Vercel deployment

### Infrastructure
- GitHub: tomcruise33/csiors-site + csiors-watchtower
- Vercel: tomcruise33s-projects
- KoboToolbox: 37 countries, 50+ cities
- AI pipeline: KoboToolbox → accumulation → signal detection → Situational Report (v2 redesign per Data Methodology v1.0)
- 34 newsletter subscribers (migrated from Flazio)
- Formspree forms (contact + watchtower)

---

## THE ASCENSION PLAN

### PHASE A — Brand Foundation (Week 1-2)

#### A1. Brand Guidelines Document
**Skill**: canvas-design
**What**: Create a formal brand guidelines PDF — logo usage, color system, typography rules, spacing, tone of voice, do's/don'ts. This is what every major platform has.
**Deliverable**: `CSIORS-Brand-Guidelines.pdf` (museum-quality design)

#### A2. Brand Voice Guidelines
**Plugin**: Brand Voice (99.5K installs)
**What**: Extract CSIORS's voice from existing 120+ analyses. Generate enforceable guidelines — academic but accessible, authoritative but not condescending, data-driven, no sensationalism.
**Deliverable**: Brand voice document + validation rules for all future content

#### A3. Logo System Finalization
**What**: Tom needs to provide final SVG. Once we have it: create all variants (full, icon, monochrome, light/dark backgrounds, favicon set, social media sizes).
**Deliverable**: Complete logo package in /public/images/brand/

#### A4. Email Templates
**Connector**: Gmail
**What**: Design branded email templates for: newsletter, watchtower access approvals, respondent communications, partner outreach.
**Deliverable**: HTML email templates matching brand system

---

### PHASE B — Content Machine (Week 2-4)

#### B1. Data Pipeline v2 — Methodology-Driven Rewrite
**Governs**: `CSIORS_Data_Methodology.md` (v1.0, March 2026)
**Core shift**: From auto-publish pseudo-quantitative briefs → accumulate, validate, publish qualitative Situational Reports when signal warrants it.

**B1.1 — csiors-watchtower: Accumulation Engine** (Week 1)
| Task | File | What changes |
|------|------|-------------|
| Respondent registry | `data/respondents.json` (new) | Track per-respondent: submission count, first/last seen, completeness avg, trust tier (unverified/provisional/established) |
| Trust score calc | `kobo_sync.py` | After each sync, update respondent trust based on consistency, frequency, completeness (skip external alignment until WFP data is integrated) |
| Country aggregator | `kobo_sync.py` | Compute running country-level stats: entry count, respondent count, date range, commodity price ranges (min/max/median — NOT mean with fake ±) |
| Signal detector | `scripts/signal_check.mjs` (new) | Run after each sync. Check: EWS ≥ 51 from established respondent? 3+ entries from 1 country in 60 days? Price change ≥ 20% same respondent? Log signal or "no signal" |
| Accumulation log | `data/accumulation_log.json` (new) | Append-only log of every sync run: timestamp, new entries, signals detected, publication decision (yes/no + reason) |

**B1.2 — csiors-watchtower: External Cross-Validation** (Week 2)
| Task | File | What changes |
|------|------|-------------|
| WFP reference store | `data/external/wfp_benchmarks.json` (new) | Monthly commodity price benchmarks per country from WFP VAM. Initially manual (Tom downloads CSV from vam.wfp.org), later automated |
| Validation step | `kobo_sync.py` | After price normalization, compare each entry's prices against WFP benchmark. Flag: within ±30% = "validated", outside = "deviation — [reason needed]", no benchmark = "unverified" |
| ACLED reference | `data/external/acled_events.json` (new) | Security incident data for cross-checking respondent security reports. Manual import initially |

**B1.3 — csiors-site: Situational Report Generator** (Week 3)
| Task | File | What changes |
|------|------|-------------|
| Rename collection | `src/content/config.ts` | `briefs` → `reports`, update schema: add `respondent_count`, `trust_level`, `external_sources[]`, `limitations` fields |
| Rewrite generator | `scripts/generate-brief.mjs` → `scripts/generate-report.mjs` | New AI prompt: qualitative framing, no country-level averages, every claim attributed + sourced, mandatory limitations section, mandatory disclaimer |
| Publication gate | `generate-report.mjs` | Only runs when signal_check.mjs flags a signal. No more Mon/Wed/Fri schedule |
| PR instead of auto-commit | `.github/workflows/generate-report.yml` | Output goes to PR branch, not direct push to main. Tom reviews before merge |
| Report template | `src/content/reports/` | Frontmatter: title, date, region, alert_level, ews, respondent_count, trust_level, external_sources, limitations, disclaimer |

**B1.4 — csiors-site: Display Updates** (Week 3-4)
| Task | File | What changes |
|------|------|-------------|
| Briefs → Reports page | `src/pages/briefs/` → `src/pages/reports/` | Rename, update nav links |
| Report detail layout | `src/pages/reports/[...slug].astro` | Show: respondent count, trust level, external sources section, limitations box, disclaimer footer |
| Watchtower page | `src/pages/watchtower.astro` | Show accumulation status: "X entries collected, Y countries active, last signal: [date]" instead of fake dashboard |
| Feed integration | `src/pages/feed.xml.js` | Update to pull from `reports` collection |

**B1.5 — GitHub Actions Rewire** (Week 2)
| Task | Repo | What changes |
|------|------|-------------|
| Sync workflow | watchtower | Keep 6h schedule. After sync: run signal_check.mjs. If signal → trigger report workflow in csiors-site via `repository_dispatch` |
| Report workflow | csiors-site | Remove Mon/Wed/Fri cron. Only runs on `repository_dispatch` from watchtower or manual trigger. Creates PR, not direct commit |
| Accumulation dashboard | watchtower | New workflow: weekly summary to Tom via email — entries collected, respondent activity, signals detected, pipeline health |

**Skill**: schedule (for sync + signal monitoring)
**Plugin**: Data (139.6K installs) — for building validation dashboards later

#### B2. Newsletter System
**What**: Choose and implement newsletter tool. Migrate 34 subscribers. Brand the emails.
**Connectors to evaluate**: Gmail (for simple sends), or dedicated tool
**Plugin**: Marketing (147.6K installs) — campaign planning, content calendar
**Action**: Add optional email field to KoboToolbox survey for organic list growth

#### B3. Content Calendar & Publishing Rhythm
**Plugin**: Productivity (197K installs)
**What**: Establish (updated per Data Methodology v1.0):
- Signal-driven: Situational Reports published ONLY when pipeline detects signal + Tom approves PR (not fixed schedule)
- Monthly: Deep expert analysis (human-written, independent of field data)
- Quarterly: Watchtower Data Summary — comprehensive review of accumulated field data + external benchmarks for priority countries
- Bi-annual: Major publication (like the Ethiopia book)
- NOTE: "2-3x/week AI briefs" removed — contradicts methodology. Quality over volume.

#### B4. Social Media Presence
**Plugin**: Marketing (147.6K)
**What**: CSIORS needs visibility beyond the website. Create branded content for LinkedIn, X/Twitter. Academic think tanks live on these platforms.
**Connector**: Canva — for social media graphics at scale

---

### PHASE C — Platform Features (Week 3-6)

#### C1. Interactive Data Visualizations
**Plugin**: Data (139.6K)
**What**: Transform Watchtower from static dashboard → interactive visualization platform. Charts, maps, trend lines that update from KoboToolbox data. This is what separates a blog from a platform.
**Tech**: D3.js or similar, embedded in Astro pages

#### C2. Respondent Portal
**What**: Dedicated section for field respondents:
- Show them their data matters (aggregate visualizations from their region)
- Impact reports ("your responses contributed to 3 published analyses")
- Mobile-optimized survey access
- This is the #1 strategic priority — retention through value exchange
**Connector**: Supabase — for respondent accounts and data access

#### C3. Search & Discovery
**What**: Full-text search across 120+ analyses. Filter by region, topic, author, date. This makes the archive actually usable.
**Plugin**: Enterprise Search (78.7K) — for inspiration on search patterns

#### C4. Slovak Translation (Phase 4 from Blueprint)
**What**: Full i18n implementation. Astro has built-in i18n. Locale: `sk`.
- Use DeepSeek API for initial translation batch
- Tom reviews and corrects
- All pages, navigation, CMS labels

#### C5. Watchtower v2 — Intelligence Platform
**What**: Redesign Watchtower to match brand AND methodology. Dashboard reflects actual data volume.
- Public: accumulation status (countries active, entry count, last report date), published Situational Reports, methodology page
- Registered: full entry explorer (individual responses with trust tiers, validation status), external benchmark comparisons, respondent contribution timeline
- Partner: API access to validated dataset, custom report requests, raw data exports with methodology documentation
**Connector**: Vercel — deployment management and analytics
**Depends on**: B1.1 (respondent registry), B1.2 (external validation) must be complete

---

### PHASE D — Operational Excellence (Week 5-8)

#### D1. Domain & Email Migration
**What**: Transfer csiors.org from Flazio. Migrate tomaskrizan@csiors.org email.
**Options**: Cloudflare (DNS) + Google Workspace (email) or Zoho Mail
**Critical**: Must happen BEFORE Flazio is cancelled

#### D2. SEO & Performance
**What**:
- Structured data (JSON-LD) for all articles — already started
- Open Graph tags for social sharing
- Performance audit (Core Web Vitals)
- Sitemap, robots.txt optimization
- Academic schema markup (ScholarlyArticle)

#### D3. Analytics & Monitoring
**Connector**: Vercel — deployment analytics
**Plugin**: Data — for building internal dashboards
**What**: Track: page views, article engagement, watchtower signups, newsletter growth, respondent activity

#### D4. Process Documentation
**Plugin**: Operations (104.5K installs)
**What**: Document all processes — content publishing workflow, respondent onboarding, partner engagement, incident response. This is what separates a hobby project from an institution.

---

### PHASE E — Growth & Partnerships (Week 8-12)

#### E1. Partner Integration — BRIDGE Research
**What**: BRIDGE Research & Innovation (Addis Ababa) is already a partner. Build co-branded content, shared data access, joint publications.
**Connector**: Notion or similar — for shared workspace

#### E2. Academic Outreach
**Plugin**: Sales (102.5K) — for outreach sequencing
**Connector**: Apollo.io — for finding and reaching academic contacts
**What**: Systematic outreach to:
- University departments (Middle East studies, African studies)
- NGOs working in MENA/Horn of Africa
- Government research departments
- Other think tanks for cross-citation and collaboration

#### E3. Grant & Funding Pipeline
**Plugin**: Legal (110.6K) — for proposal drafting
**What**: CSIORS as a registered institute can apply for:
- EU research grants (Horizon Europe)
- Czech/Slovak government research funding
- Foundation grants (Open Society, etc.)

#### E4. Publication Pipeline
**Skill**: canvas-design — for publication covers
**Skill**: docx — for manuscript formatting
**What**: After the Ethiopia book, establish regular publication cadence. Each deep analysis series could become a publication.

---

### PHASE F — Custom Skills & Automation (Ongoing)

#### F1. CSIORS Content Skill
**Skill**: skill-creator
**What**: Create a custom skill that knows CSIORS's voice, data sources, formatting standards, and can generate analysis drafts that need minimal editing. Encodes the brand voice + editorial standards.

#### F2. CSIORS Data Analysis Skill
**Skill**: skill-creator
**What**: Custom skill for analyzing KoboToolbox field data — understands the survey structure, can generate regional comparisons, trend analysis, alert triggers.

#### F3. Watchtower Alert Skill
**Skill**: skill-creator + schedule
**What**: Automated monitoring — when field data crosses thresholds (food prices spike, displacement increases), auto-generate alert briefs and notify subscribers.

---

## TOOLS & CONNECTORS MATRIX

### Skills (Already Available)
| Skill | Use For |
|-------|---------|
| canvas-design | Brand guidelines, publication covers, visual identity |
| skill-creator | Custom CSIORS skills (content, data, alerts) |
| docx | Publications, reports, proposals |
| pdf | Publication creation, form handling |
| pptx | Investor/partner presentations |
| xlsx | Data analysis, financial planning |
| schedule | Automated pipeline runs |

### Recommended Plugins to Install
| Plugin | Priority | Use For |
|--------|----------|---------|
| **Productivity** (197K) | HIGH | Task management, content calendar, workflow |
| **Marketing** (147.6K) | HIGH | Content strategy, social media, newsletter |
| **Brand Voice** (99.5K) | HIGH | Extract and enforce CSIORS editorial voice |
| **Data** (139.6K) | HIGH | Visualizations, dashboards, data stories |
| **Operations** (104.5K) | MEDIUM | Process docs, compliance, capacity planning |
| **Engineering** (125.4K) | MEDIUM | Code review, architecture, CI/CD |
| **Design** (172K) | MEDIUM | UX review, accessibility, design system |
| **Product Management** (110.3K) | MEDIUM | Feature specs, roadmap tracking |
| **Legal** (110.6K) | LOW | Grant proposals, compliance, NDAs |
| **Sales** (102.5K) | LOW | Academic/partner outreach |

### Recommended Connectors
| Connector | Priority | Use For |
|-----------|----------|---------|
| **Gmail** | HIGH | Newsletter, respondent comms, partner outreach |
| **Vercel** | HIGH | Deployment management, analytics |
| **Canva** | MEDIUM | Social media graphics, branded content |
| **Google Drive** | MEDIUM | Document collaboration, shared assets |
| **Notion** | MEDIUM | Partner workspace, knowledge base |
| **Slack** | MEDIUM | Team communication (when team grows) |
| **Supabase** | MEDIUM | Respondent portal, data storage |
| **Google Calendar** | LOW | Content calendar, meeting coordination |
| **Figma** | LOW | Design mockups for major features |

---

## IMMEDIATE NEXT ACTIONS (This Session)

1. **Choose first workstream** — Brand Foundation (A) or Content Machine (B)?
2. **Install priority plugins** — Brand Voice, Productivity, Marketing
3. **Start Brand Guidelines** — if going with Phase A
4. **Harden content pipeline** — if going with Phase B
5. **Update Blueprint** — merge this roadmap into the living document

---

## SUCCESS METRICS

### 3-Month Targets (updated per Data Methodology v1.0)
- Brand guidelines complete and enforced
- Data pipeline v2 live: accumulation mode, signal detection, external validation
- 3-5 Situational Reports published (signal-driven, quality over volume)
- 100+ cumulative field entries (from current ~43)
- WFP benchmark data integrated for Syria, Nigeria, Ethiopia
- Respondent trust scoring operational (all respondents have tier assigned)
- Newsletter list: 34 → 200 subscribers
- Domain transferred to csiors.org
- Data Methodology published on csiors.org/methodology (transparency)

### 6-Month Targets
- 500+ newsletter subscribers
- 200+ cumulative field entries across 15+ countries
- 3+ established respondents (6+ consistent submissions each)
- Second publication (after Ethiopia book)
- Respondent retention rate >70%
- Full social media presence (LinkedIn, X)
- Quarterly Watchtower Data Summary published (first edition)
- ACLED + UNHCR cross-validation integrated
- 2 custom CSIORS skills operational
- Grant application submitted

### 12-Month Targets
- CSIORS recognized as credible MENA/Horn of Africa qualitative intelligence source
- 1000+ newsletter subscribers
- 500+ cumulative field entries, 20+ active monthly respondents
- Watchtower v2 live with tiered access, used by 10+ organizations
- 3+ publications
- Automated signal-based alert system operational
- Respondent trust data meaningful (12+ months of history)
- Revenue from partnerships/grants

---

*This is a living document. Update after each work session.*
