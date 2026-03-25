#!/usr/bin/env node
/**
 * CSIORS OG Image Generator
 *
 * Generates branded Open Graph images for all articles at build time.
 * Uses Satori (SVG) + Sharp (PNG) for server-side rendering.
 *
 * Output: public/og/<slug>.png (1200x630)
 *
 * Run: node scripts/generate-og-images.mjs
 * Or add to package.json build step.
 */

import fs from 'fs';
import path from 'path';
import satori from 'satori';
import sharp from 'sharp';

// ── Config ──────────────────────────────────────────────────────────
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OUTPUT_DIR = path.join('public', 'og');
const CONTENT_DIRS = [
  path.join('src', 'content', 'expert'),
  path.join('src', 'content', 'briefs'),
];

// ── Font loading ────────────────────────────────────────────────────
// Font search paths — tries local canvas-design skill fonts first, then project fonts
const FONT_SEARCH_DIRS = [
  // Cowork session skill fonts
  path.join('..', '..', 'mnt', '.claude', 'skills', 'canvas-design', 'canvas-fonts'),
  // Absolute fallback paths
  '/sessions/gallant-pensive-pascal/mnt/.claude/skills/canvas-design/canvas-fonts',
];

function findFont(filename) {
  for (const dir of FONT_SEARCH_DIRS) {
    const p = path.resolve(dir);
    const fp = path.join(p, filename);
    if (fs.existsSync(fp)) return fp;
  }
  return null;
}

async function loadFonts() {
  const fonts = [];

  // Try local fonts first
  const sansPath = findFont('InstrumentSans-Regular.ttf');
  const sansBoldPath = findFont('InstrumentSans-Bold.ttf');
  const serifBoldPath = findFont('IBMPlexSerif-Bold.ttf');
  const monoPath = findFont('IBMPlexMono-Regular.ttf');

  if (sansPath) fonts.push({ name: 'Inter', data: fs.readFileSync(sansPath).buffer, weight: 400, style: 'normal' });
  if (sansBoldPath) fonts.push({ name: 'Inter', data: fs.readFileSync(sansBoldPath).buffer, weight: 700, style: 'normal' });
  if (serifBoldPath) fonts.push({ name: 'IBM Plex Serif', data: fs.readFileSync(serifBoldPath).buffer, weight: 700, style: 'normal' });
  if (monoPath) fonts.push({ name: 'IBM Plex Mono', data: fs.readFileSync(monoPath).buffer, weight: 400, style: 'normal' });

  // If no local fonts, try fetching from Google Fonts
  if (fonts.length === 0) {
    console.log('  ⚠️  No local fonts found, trying remote...');
    try {
      const interUrl = 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf';
      const res = await fetch(interUrl);
      if (res.ok) fonts.push({ name: 'Inter', data: await res.arrayBuffer(), weight: 400, style: 'normal' });
    } catch (e) { /* no fonts available */ }
  }

  return fonts;
}

// ── Parse frontmatter ───────────────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    // Remove quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    fm[key] = val;
  }
  return fm;
}

// ── Generate OG image for one article ───────────────────────────────
async function generateOgImage(article, fonts) {
  const { title, region, author, date, type } = article;

  // Truncate title if too long
  const displayTitle = title.length > 120 ? title.slice(0, 117) + '...' : title;
  const displayRegion = region || '';
  const displayAuthor = (author || 'CSIORS').replace(/"/g, '');
  const displayDate = date || '';
  const typeLabel = type === 'brief' ? 'FIELD BRIEF' : 'EXPERT ANALYSIS';

  // Satori JSX-like element tree (uses objects, not JSX)
  const element = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 70px',
        background: 'linear-gradient(135deg, #0a0c14 0%, #0f1119 50%, #151821 100%)',
        fontFamily: 'Inter',
      },
      children: [
        // Top bar: type label + region
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '16px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    background: 'linear-gradient(135deg, #0693E3, #9B51E0)',
                    padding: '6px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    color: 'white',
                    fontFamily: 'IBM Plex Mono',
                  },
                  children: typeLabel,
                },
              },
              displayRegion ? {
                type: 'div',
                props: {
                  style: {
                    fontSize: '14px',
                    letterSpacing: '0.08em',
                    color: '#7a7f94',
                    fontFamily: 'IBM Plex Mono',
                  },
                  children: displayRegion.toUpperCase(),
                },
              } : null,
            ].filter(Boolean),
          },
        },
        // Title
        {
          type: 'div',
          props: {
            style: {
              fontSize: displayTitle.length > 80 ? '36px' : '44px',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#d8dae2',
              fontFamily: 'IBM Plex Serif',
              maxWidth: '1000px',
            },
            children: displayTitle,
          },
        },
        // Bottom bar: author, date, CSIORS branding
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '16px', color: '#a4a8b8', fontWeight: 500 },
                        children: displayAuthor,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '14px', color: '#4a4f63', fontFamily: 'IBM Plex Mono' },
                        children: displayDate,
                      },
                    },
                  ],
                },
              },
              // CSIORS brand
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '28px',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          background: 'linear-gradient(135deg, #0693E3, #9B51E0)',
                          backgroundClip: 'text',
                          color: 'transparent',
                          fontFamily: 'IBM Plex Serif',
                        },
                        children: 'CSIORS',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: '10px', color: '#4a4f63', letterSpacing: '0.12em', fontFamily: 'IBM Plex Mono' },
                        children: 'CZECH-SLOVAK INSTITUTE OF ORIENTAL STUDIES',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Gradient line at bottom
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, #0693E3, #9B51E0)',
            },
          },
        },
      ],
    },
  };

  const svg = await satori(element, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });

  const png = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();
  return png;
}

// ── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  CSIORS OG Image Generator');
  console.log('═══════════════════════════════════════════════\n');

  // Ensure output dir
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Load fonts
  console.log('📦 Loading fonts...');
  const fonts = await loadFonts();
  console.log(`   → ${fonts.length} fonts loaded\n`);

  if (fonts.length === 0) {
    console.error('❌ No fonts available. Cannot generate OG images.');
    process.exit(1);
  }

  // Collect all articles
  const articles = [];
  for (const dir of CONTENT_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const type = dir.includes('briefs') ? 'brief' : 'expert';
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      const fm = parseFrontmatter(content);
      const slug = file.replace(/\.md$/, '');
      articles.push({ slug, type, ...fm });
    }
  }

  console.log(`📝 Found ${articles.length} articles\n`);

  // Generate OG images
  let generated = 0;
  let skipped = 0;

  for (const article of articles) {
    const outPath = path.join(OUTPUT_DIR, `${article.slug}.png`);

    // Skip if already exists (incremental)
    if (fs.existsSync(outPath)) {
      skipped++;
      continue;
    }

    try {
      const png = await generateOgImage(article, fonts);
      fs.writeFileSync(outPath, png);
      generated++;
      if (generated % 20 === 0) console.log(`   → ${generated} generated...`);
    } catch (err) {
      console.error(`   ⚠️  Failed: ${article.slug} — ${err.message}`);
    }
  }

  console.log(`\n✅ Done! ${generated} generated, ${skipped} skipped (already exist)`);
  console.log(`   Output: ${OUTPUT_DIR}/`);
}

main().catch(err => {
  console.error('❌ OG generation failed:', err.message);
  process.exit(1);
});
