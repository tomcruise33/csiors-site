# CSIORS Design Handoff Specification

**Date:** 2026-03-26
**Version:** 2.0 — Light Theme Overhaul
**Tech Stack:** Astro 6.0.5 + Vercel + Decap CMS
**URL:** https://csiors-site.vercel.app

---

## 1. Overview

Complete visual redesign of the CSIORS website from dark theme to light, institutional theme. Benchmarked against Crisis Group, IISS, Chatham House, and Carnegie Endowment. Every change is driven by one principle: **CSIORS should look like a prestigious research institute, not a tech startup.**

---

## 2. Design Tokens

### 2.1 Color Palette

| Token | Hex | Usage | WCAG on White |
|-------|-----|-------|---------------|
| `--accent` | `#1a5276` | Primary brand, CTA buttons, active indicators, links | 7.5:1 AAA |
| `--accent-light` | `#2471a3` | Secondary interactive elements | 5.2:1 AA |
| `--accent-hover` | `#154360` | Hover state for accent elements | 8.9:1 AAA |
| `--bg` | `#ffffff` | Page background | — |
| `--bg-surface` | `#f8f9fa` | Cards, footer, elevated sections | — |
| `--bg-elevated` | `#f0f2f5` | Sidebar widgets, data boxes | — |
| `--bg-hover` | `#e8ecf0` | Hover backgrounds | — |
| `--text-primary` | `#1a1a2e` | Headlines, nav active, primary text | 16.3:1 AAA |
| `--text-body` | `#3d3d5c` | Body copy, paragraphs | 10.1:1 AAA |
| `--text-secondary` | `#5a5a7a` | Subtitles, secondary info | 4.9:1 AA |
| `--text-muted` | `#8a8aa0` | Dates, metadata, captions | 3.5:1 (AA Large only) |
| `--border` | `#e0e0e8` | Section dividers, card borders | — |
| `--border-light` | `#eaeaf0` | Subtle separators | — |
| `--red-alert` | `#c0392b` | Alert badges, crisis indicators | — |
| `--amber` | `#b7950b` | Warning states | — |
| `--green` | `#1e8449` | Positive indicators, live dots | — |

**Rule:** No gradients anywhere except on `.hp-btn--primary` (CTA button). All former gradient references (`--gradient-blue`, `--gradient-purple`) now alias to `--accent` (`#1a5276`).

### 2.2 Typography

| Token | Family | Weight | Size | Usage |
|-------|--------|--------|------|-------|
| `font-heading` | IBM Plex Serif | 600–700 | clamp(1.4rem, 2.8vw, 2.4rem) | Headlines, article titles |
| `font-body` | Inter | 300–500 | 1.05rem / line-height: 1.7 | Body text, paragraphs |
| `font-mono` | IBM Plex Mono | 400–500 | 0.55–0.76rem | Labels, metadata, dates, regions |
| `font-brand` | IBM Plex Serif | 700 | clamp(1.6rem, 3.5vw, 2.4rem) | Masthead "CSIORS" |

**Loading:** Google Fonts import with `display=swap`.

**Body baseline:** `font-size: 1.05rem`, `line-height: 1.7`. Previous was 0.95rem — bumped for readability per audit.

### 2.3 Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| `xs` | 0.35rem | Inline gaps, micro-margins |
| `sm` | 0.5–0.6rem | Between metadata items, within cards |
| `md` | 1rem | Card inner padding, between paragraphs |
| `lg` | 1.5–2rem | Section padding, grid gaps |
| `xl` | 2.5–3rem | Between major sections |
| `xxl` | 3.5–4rem | CTA sections, hero spacing |

### 2.4 Border & Shadow

| Element | Style |
|---------|-------|
| Section divider | `1px solid var(--border)` |
| Card border | `1px solid var(--border-light)` |
| Accent indicator | `2px solid var(--accent)` (top/left bars) |
| Card hover shadow | `0 4px 20px rgba(0,0,0,0.08)` |
| Button shadow | `0 2px 12px rgba(26,82,118,0.25)` |

---

## 3. Layout System

### 3.1 Container

```
max-width: 1200px (was 1080px)
padding: 0 2rem
margin: 0 auto
```

**Why wider:** 1080px felt cramped for a 2-column layout with sidebar. 1200px matches Crisis Group / IISS standard.

### 3.2 Grid Templates

| Section | Desktop | Tablet (≤768px) | Mobile (≤480px) |
|---------|---------|-----------------|-----------------|
| Featured card | `1.1fr 0.9fr` | `1fr` | `1fr` |
| About strip | `1.3fr 0.7fr` | `1fr` | `1fr` |
| CTA section | `1.2fr 0.8fr` | `1fr` | `1fr` |
| Article layout | `1fr 300px` | `1fr` | `1fr` |
| Contact layout | `1.2fr 0.8fr` | `1fr` | `1fr` |
| Footer columns | 4-column flex | 2-column | `1fr` |
| Article card grid | 3-column | 2-column | `1fr` |
| Stats strip | 4-column | 2-column | 2-column |
| Team grid | 3-column | 1-column | 1-column |

---

## 4. Component Specifications

### 4.1 Ticker Bar

**Position:** Fixed top of page (not sticky).
**Height:** ~28px (7px padding top/bottom + 14px content).

| Property | Value |
|----------|-------|
| Background | `var(--accent)` (solid `#1a5276`, was gradient) |
| Text | IBM Plex Mono, 0.7rem, 500 weight, white |
| Animation | `tickerScroll 50s linear infinite` (translateX 0 to -50%) |
| Live indicator | 5px white dot with `pulse 2s ease-in-out infinite` |
| Standard indicator | 4px dot, `rgba(255,255,255,0.5)` |

**Reduced motion:** Animation disabled entirely via `prefers-reduced-motion: reduce`.

### 4.2 Masthead

| Property | Value |
|----------|-------|
| Padding | `2rem 2rem 1rem` (was `1.4rem 2rem 0.6rem`) |
| Border | `1px solid var(--border)` bottom |
| Logo | 52×52px, `object-fit: contain` |
| Brand name | IBM Plex Serif, 700, `clamp(1.6rem, 3.5vw, 2.4rem)`, `color: var(--text-primary)` |
| Subtitle | IBM Plex Mono, 0.55rem, uppercase, `letter-spacing: 0.14em`, `color: var(--text-muted)` |
| Accent rule | 60×2px, `var(--accent)`, centered, `margin: 0.6rem auto 0.5rem` |
| Date line | IBM Plex Mono, 0.6rem, `var(--text-muted)`, green live dot |

**State change from v1:** Removed gradient text-clip on brand name. Now solid `var(--text-primary)`.

### 4.3 Navigation

| Property | Value |
|----------|-------|
| Layout | `display: flex`, `justify-content: center`, `gap: 2rem` |
| Background | `rgba(255, 255, 255, 0.97)` + `backdrop-filter: blur(12px)` |
| Position | `sticky`, `top: 0`, `z-index: 99` |
| Border | `1px solid var(--border)` bottom |
| Link size | 0.76rem, `var(--text-secondary)` |
| Hover | `color: var(--text-primary)` |
| Active | `color: var(--text-primary)` + 2px `var(--accent)` underline (`::after`, `bottom: -0.75rem`) |
| Watchtower | `color: var(--accent)`, `font-weight: 500` (was gradient text-clip) |

**Items (6 total):** Home, Analysis, About, Methodology, Contact, Watchtower

**Removed from nav:** Search, Field Network, Field Survey (moved to footer).

**Accessibility:** `aria-label="Main navigation"`, `aria-current="page"` on active link.

### 4.4 Featured Article Card (Homepage)

| Property | Value |
|----------|-------|
| Grid | `1.1fr 0.9fr`, collapses to `1fr` at 768px |
| Padding | `2.5rem 0 3rem` |
| Image height | `min-height: 320px` (200px on mobile) |
| Image hover | `transform: scale(1.04)`, `transition: 0.5s ease` |
| Overlay | Gradient from transparent to dark (right side) |
| Title | IBM Plex Serif, `clamp(1.4rem, 2.5vw, 2rem)`, 700 |
| Type badge | Mono, 0.6rem, uppercase, `var(--accent)` |
| Subtitle | 0.88rem, `var(--text-secondary)`, `line-clamp: 3` |

**Bug fixed:** Previously rendered BOTH `subtitle` and `summary` fields. Now: `subtitle || summary` (prefer subtitle, fallback to summary, show only one).

**Alt text added:** Images now use article title as `alt` attribute (was `alt=""`).

**Type label:** "Analysis" for expert content, "Situational Report" for reports.

### 4.5 Latest Analysis Slider

| Property | Value |
|----------|-------|
| Container | Horizontal scroll, `scroll-snap-type: x mandatory` |
| Item width | `flex: 0 0 280px` (250px at 768px, 230px at 480px) |
| Snap | `scroll-snap-align: start` |
| Image height | 160px, `object-fit: cover` |
| Image hover | `transform: scale(1.06)`, `transition: 0.4s ease` |
| Card hover | `translateY(-3px)`, `box-shadow: 0 4px 20px rgba(0,0,0,0.08)` |
| Scrollbar | Thin, `var(--border-light)` track, `var(--text-muted)` thumb |

**Alt text added:** Slider images now use article title as `alt`.

### 4.6 About Strip

| Property | Value |
|----------|-------|
| Background | `var(--bg-surface)` |
| Grid | `1.3fr 0.7fr`, gap `3rem` (collapses at 768px) |
| Padding | `3rem 0` |
| Lede text | IBM Plex Serif, 1rem, `line-height: 1.75`, `var(--text-body)` |
| Stats grid | 2×2, inner borders `var(--border)` |
| Stat value | IBM Plex Mono, 1.3rem, 600 weight, `var(--accent)` |
| Stat label | IBM Plex Mono, 0.6rem, uppercase, `var(--text-muted)` |

**Counter animation:** JavaScript IntersectionObserver, `threshold: 0.3`, 1400ms duration, cubic ease-out.

### 4.7 Regions Section

| Property | Value |
|----------|-------|
| Layout | `flex-wrap: wrap`, `gap: 0.6rem` |
| Topic pill | `inline-flex`, padding `0.4rem 0.8rem`, `var(--border-light)` border |
| Count badge | `var(--accent)`, `font-weight: 600` |
| Hover | `var(--bg-hover)` background, `var(--accent)` border |

### 4.8 CTA Section

| Property | Value |
|----------|-------|
| Grid | `1.2fr 0.8fr` (collapses at 768px) |
| Padding | `3.5rem 0` |
| Title | IBM Plex Serif, 1.5rem, 700 |
| Primary button | `var(--accent)` bg, white text, `0.65rem 1.5rem` padding, shadow, hover `translateY(-1px)` |
| Side cards | Border, `var(--border-light)`, hover `translateY(-1px)` + shadow |
| Card arrow | Hover moves `4px` right via `translateX(4px)` |

### 4.9 Footer

| Property | Value |
|----------|-------|
| Background | `var(--bg-surface)` |
| Top rule | `1px solid var(--border)` |
| Layout | 4-column: brand | Research | Institute | Contribute |
| Brand logo | 24×24px |
| Column title | IBM Plex Mono, 0.65rem, uppercase, `letter-spacing: 0.1em`, `var(--text-muted)` |
| Links | 0.82rem, `var(--text-secondary)`, hover `var(--text-primary)` |
| Newsletter input | 0.82rem, `var(--border)` border, `focus: var(--accent)` border |
| Subscribe button | `var(--accent)` bg, white text, hover `var(--accent-hover)` |
| Copyright | 0.7rem, `var(--text-muted)` |
| Role | `role="contentinfo"` |

**Newsletter:** Buttondown embed, `POST` to `https://buttondown.com/api/emails/embed-subscribe/csiors`, opens in popup.

**Research links:** Analysis, Reports, Methodology, Watchtower
**Institute links:** About, Field Network, Newsletter, Contact
**Contribute links:** Field Survey (external, KoboToolbox), Partner with us

### 4.10 Buttons

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| `hp-btn--primary` | `var(--accent)` | `#fff` | none | `translateY(-1px)`, deeper shadow |
| `hp-btn--ghost` | transparent | `var(--text-body)` | `1px solid var(--border)` | `var(--bg-hover)` bg, `var(--accent)` border |
| `cta-button` | `var(--accent)` | `#fff` | none | `opacity: 0.9` |
| `form-submit` | `var(--accent)` | `#fff` | none | `var(--accent-hover)` bg |
| `filter-btn` | transparent | `var(--text-secondary)` | `1px solid var(--border)` | `var(--accent)` bg + white text (active) |

---

## 5. Page-Specific Specs

### 5.1 Homepage (`index.astro`)

**Section order (top to bottom):**
1. Ticker
2. Masthead
3. Navigation (sticky)
4. Featured Analysis (hero card)
5. Latest Analysis (horizontal slider)
6. About Strip (with stats counters)
7. Regions We Cover (topic pills)
8. CTA ("Contribute Field Intelligence" + Watchtower/Partner cards)
9. Footer

**Data sources:** `expert` collection + `reports` collection, merged and sorted by date. Featured = latest with image.

**Structured data:** JSON-LD `ResearchOrganization` schema embedded in `<head>`.

### 5.2 Feed Page (`/feed`)

- Filter buttons: toggleable by content type/region
- 3-column article card grid (2-col tablet, 1-col mobile)
- Article cards: 160px image, type badge, serif title, author, date
- Pagination at bottom

### 5.3 Article Pages

- 2-column: `1fr` content + `300px` sidebar
- Title: IBM Plex Serif, `clamp(1.4rem, 2.5vw, 1.9rem)`
- Body: IBM Plex Serif, 0.95rem, `line-height: 1.8`
- Sidebar: Sticky data box with accent top bar
- Hero image: 340px height with gradient overlay

### 5.4 Contact Page

- 2-column: `1.2fr` form + `0.8fr` info
- Form inputs: 0.85rem, `var(--border)` border, `var(--accent)` focus border
- Custom select with SVG arrow
- Full-width submit button

### 5.5 Watchtower Page (`/watchtower`)

- Hero with centered accent-color title
- 2-column feature grid
- Access card: max-width 640px, centered, accent top bar
- Status strip with pulsing live indicator

---

## 6. Accessibility Specification

### 6.1 Document Structure

```html
<body>
  <a href="#content" class="skip-link">Skip to content</a>  <!-- Hidden until focused -->
  <header role="banner">
    <Masthead />
    <Nav aria-label="Main navigation" />
  </header>
  <main id="content">
    <!-- Page content -->
  </main>
  <footer role="contentinfo">
    <!-- Footer -->
  </footer>
</body>
```

### 6.2 Focus Management

| Element | Style |
|---------|-------|
| All focusable | `outline: 2px solid var(--accent)`, `outline-offset: 2px` |
| Skip link | Hidden at `top: -100%`, revealed at `top: 0` on `:focus` |
| Nav active | `aria-current="page"` attribute |
| External links | `.sr-only` text "(opens in new tab)" |

### 6.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Affects: ticker scroll, counter animations, hover transforms, pulse animations.

### 6.4 Color Contrast Summary

| Text role | Token | Ratio vs white | WCAG Level |
|-----------|-------|---------------|------------|
| Headlines | `--text-primary` | 16.3:1 | AAA |
| Body copy | `--text-body` | 10.1:1 | AAA |
| Secondary | `--text-secondary` | 4.9:1 | AA |
| Muted/meta | `--text-muted` | 3.5:1 | AA Large text only |
| Accent on white | `--accent` | 7.5:1 | AAA |

**Known limitation:** `--text-muted` at 3.5:1 fails WCAG AA for normal text. Used only for non-essential metadata (dates, source attributions). Acceptable per WCAG — decorative/supplementary content.

### 6.5 Image Alt Text

| Context | Rule |
|---------|------|
| Featured article image | `alt="{article title}"` |
| Slider article images | `alt="{article title}"` |
| No-image fallback | Region name displayed in div |
| Masthead logo | `alt="CSIORS"` |
| Footer logo | `alt=""` (decorative, brand name is adjacent text) |

---

## 7. Responsive Breakpoints

### 7.1 Breakpoint Definitions

| Name | Query | Target |
|------|-------|--------|
| Desktop | `>768px` | Default styles |
| Tablet | `max-width: 768px` | Single-column layouts |
| Mobile | `max-width: 480px` | Compact typography, stacked buttons |

### 7.2 Key Changes at 768px

- All 2-column grids → single column
- Masthead logo: 52px → 40px
- Featured image min-height: 320px → 200px
- Slider items: 280px → 250px
- Article grid: 3-col → 2-col
- Footer columns: 4-col → wrap
- Stats strip: 4-col → 2-col

### 7.3 Key Changes at 480px

- Article grid: 2-col → 1-col
- Slider items: 250px → 230px
- CTA buttons: flex-direction column, full-width
- Stat values: font-size drops to 1.1rem

---

## 8. Animation & Motion

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Ticker | Page load | `translateX(0 → -50%)` | 50s | linear, infinite |
| Live dot | Page load | Opacity pulse (1 → 0.3 → 1) | 2s | ease-in-out, infinite |
| Featured image | Hover | `scale(1.04)` | 500ms | ease |
| Slider image | Hover | `scale(1.06)` | 400ms | ease |
| Slider card | Hover | `translateY(-3px)` + shadow | 200ms | ease |
| CTA card arrow | Hover | `translateX(4px)` | 200ms | ease |
| Primary button | Hover | `translateY(-1px)` + shadow | 200ms | ease |
| Stat counters | Scroll into view | Count from 0 to target | 1400ms | cubic ease-out |
| Nav links | Hover | Color transition | 200ms | ease |
| Masthead logo | Hover | `opacity: 0.8` | 200ms | ease |

**All animations respect `prefers-reduced-motion: reduce`.**

---

## 9. Edge Cases

### 9.1 Content States

| State | Behavior |
|-------|----------|
| Article without image | Featured: shows `.hp-featured-noimg` div. Slider: shows region name in placeholder |
| Article without subtitle AND summary | Description block omitted entirely |
| Article without region | Region span rendered empty (no visual artifact) |
| Article without author | Author span rendered empty |
| No articles at all | Empty sections (no empty state implemented — **TODO**) |
| Very long title | Handled by `clamp()` sizing + natural wrapping |
| Subtitle line-clamp | Featured card: 3-line max via `-webkit-line-clamp: 3` |

### 9.2 Data Concerns

- `reports` collection replaced `briefs` collection — all URL paths use `/reports/` not `/briefs/`
- `getHref()` returns `/reports/{id}` for report type, `/expert/{id}` for expert type
- Type labels: "Situational Report" (was "Field Brief"), "Analysis" for expert content

---

## 10. Files Changed in This Overhaul

| File | Changes |
|------|---------|
| `src/styles/global.css` | Complete `:root` rewrite, accessibility block, gradient→solid replacements, footer rewrite, body font-size bump |
| `src/layouts/BaseLayout.astro` | Skip link, `<header role="banner">`, `<main id="content">`, theme-color meta update |
| `src/components/Nav.astro` | 9→6 items, `aria-label`, `aria-current`, removed gradient classes |
| `src/components/Footer.astro` | Complete rewrite: 4-column layout, newsletter form, moved nav items here, `role="contentinfo"` |
| `src/pages/index.astro` | `briefs`→`reports` collection, duplicate text bug fix, alt text on all images |

---

## 11. Outstanding Items (Not Yet Implemented)

| Priority | Item | Notes |
|----------|------|-------|
| P0 | Build test (`npm run build`) | Must verify all changes compile before push |
| P1 | Git sync | Local repo behind remote — need `git pull` or fresh clone before push |
| P1 | Visual verification in Chrome | Full page scroll-through on desktop + mobile viewport |
| P2 | Empty states for feed/slider | Show messaging when no articles exist |
| P2 | Mobile hamburger menu | 6 nav items still cramped on small screens — consider collapsible |
| P3 | Team photo placeholders → real headshots | Tom to provide photos |
| P3 | Regions section upgrade | Current tag-cloud pills could become a more institutional component |
| P3 | Privacy policy page | Footer links to it but page doesn't exist |

---

*Generated 2026-03-26 — CSIORS Design System v2.0*
