#!/usr/bin/env node
/**
 * Generate supporting Gemini images for Effective Agents section pages.
 * Pattern mirrors scripts/roadmap-blog.mjs (gemini-2.5-flash-image + brand SVG fallback).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'img');

const GEMINI_IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3.1-flash-image',
];

const IMAGES = [
  {
    name: 'our-goal-hero',
    subject:
      'Closed-loop agents delivering finished outcomes: geometric agents completing cycles and stacking finished artefacts, production outcomes not chat bubbles or speech balloons',
  },
  {
    name: 'our-goal-section',
    subject:
      'Closed-loop outcomes system: circular feedback geometry with completed work stacks flowing into a governed loop, industrial editorial, no chat UI',
  },
  {
    name: 'insights-hero',
    subject:
      'Telemetry flowing into a value lens: abstract signal streams converging through a circular lens into a dashboard abstraction of worth, steel panels, red accents',
  },
  {
    name: 'insights-section',
    subject:
      'Value lens dashboard abstraction: arcs and bars transforming raw telemetry into rising assisted-value geometry, no readable numbers or UI chrome',
  },
  {
    name: 'choice-hero',
    subject:
      'Abstract workflow spine forking into three shape-coded routes: upper route of solid discs, middle route of interlocking cogs, lower route of quiet dashed track; pure geometry only',
  },
  {
    name: 'choice-section',
    subject:
      'Central node with three outgoing geometric arms: rising concentric arcs, horizontal cog train, downward quiet stub block; communicate by shape alone',
  },
  {
    name: 'measurements-hero',
    subject:
      'Overlapping scorecard frames and board-pack panels as abstract rectangles and grids with red signal ticks; pure geometry, serious production mood',
  },
  {
    name: 'measurements-section',
    subject:
      'Linked geometric nodes forming a measurement chain into dual balanced panes — rising bars versus jagged risk polygons — ending in stacked pack frames; pure geometry',
  },
];

function geminiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    const candidates = [
      '/home/box/agent-data/box-secrets.json',
      '/home/box/sand-data/box-secrets.json',
      path.join(ROOT, '..', 'agent-data', 'box-secrets.json'),
      path.join(ROOT, '..', 'sand-data', 'box-secrets.json'),
      path.join(process.env.HOME || '', 'agent-data', 'box-secrets.json'),
      path.join(process.env.HOME || '', 'sand-data', 'box-secrets.json'),
    ];
    for (const cand of candidates) {
      if (!fs.existsSync(cand)) continue;
      const j = JSON.parse(fs.readFileSync(cand, 'utf8'));
      const k = j?.card?.GEMINI_API_KEY || j?.GEMINI_API_KEY || '';
      if (k) {
        process.env.GEMINI_API_KEY = k;
        return k;
      }
    }
  } catch {
    /* ignore */
  }
  return '';
}

function redactErr(s) {
  const key = geminiKey();
  let out = String(s || '');
  if (key) out = out.split(key).join('***');
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function geminiGenerate(model, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': geminiKey(),
    },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    json = { raw: raw.slice(0, 400) };
  }
  if (!res.ok) {
    const msg = json?.error?.message || json?.raw || res.statusText;
    const err = new Error(`${model} HTTP ${res.status}: ${redactErr(msg).slice(0, 240)}`);
    err.status = res.status;
    throw err;
  }
  return json;
}

function firstInline(json) {
  const parts = json?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    const inline = p.inlineData || p.inline_data;
    if (inline?.data) return inline;
  }
  return null;
}

function brandSvg(name, subject) {
  // Abstract geometric SVG — no readable body text (brand marks only at edges)
  const motifs = {
    'our-goal-hero': `
  <rect x="180" y="200" width="140" height="220" fill="#1a1a1a" stroke="#A8A29A" stroke-width="2"/>
  <rect x="360" y="160" width="140" height="260" fill="#141414" stroke="#A8A29A" stroke-width="2"/>
  <rect x="540" y="120" width="140" height="300" fill="#121212" stroke="#E10600" stroke-width="3"/>
  <circle cx="610" cy="100" r="18" fill="#E10600"/>
  <path d="M720 280 H980" stroke="#6B6560" stroke-width="2"/>
  <path d="M960 260 L980 280 L960 300" stroke="#E10600" stroke-width="3" fill="none"/>`,
    'our-goal-section': `
  <circle cx="400" cy="315" r="120" fill="none" stroke="#A8A29A" stroke-width="3"/>
  <circle cx="400" cy="315" r="70" fill="none" stroke="#6B6560" stroke-width="2"/>
  <path d="M400 195 A120 120 0 0 1 520 315" stroke="#E10600" stroke-width="6" fill="none"/>
  <polygon points="510,290 540,315 510,340" fill="#E10600"/>
  <rect x="700" y="240" width="80" height="80" fill="#1a1a1a" stroke="#F5F2EB" stroke-width="2"/>
  <path d="M740 220 V240 M740 320 V340" stroke="#A8A29A" stroke-width="2"/>`,
    'insights-hero': `
  <rect x="160" y="140" width="880" height="360" fill="#121212" stroke="#6B6560" stroke-width="1"/>
  <rect x="200" y="380" width="40" height="80" fill="#A8A29A"/>
  <rect x="280" y="320" width="40" height="140" fill="#A8A29A"/>
  <rect x="360" y="260" width="40" height="200" fill="#E10600"/>
  <rect x="440" y="300" width="40" height="160" fill="#A8A29A"/>
  <rect x="520" y="220" width="40" height="240" fill="#F5F2EB"/>
  <path d="M620 400 Q700 200 780 280 T940 240" stroke="#E10600" stroke-width="3" fill="none"/>
  <circle cx="940" cy="240" r="8" fill="#E10600"/>`,
    'insights-section': `
  <rect x="200" y="400" width="160" height="80" fill="#1a1a1a" stroke="#6B6560"/>
  <rect x="400" y="320" width="160" height="160" fill="#161616" stroke="#A8A29A"/>
  <rect x="600" y="220" width="160" height="260" fill="#141414" stroke="#A8A29A"/>
  <rect x="800" y="140" width="160" height="340" fill="#121212" stroke="#E10600" stroke-width="3"/>
  <circle cx="880" cy="120" r="14" fill="#E10600"/>`,
    'choice-hero': `
  <path d="M200 315 H480" stroke="#A8A29A" stroke-width="4"/>
  <circle cx="200" cy="315" r="16" fill="#E10600"/>
  <path d="M480 315 L700 180" stroke="#F5F2EB" stroke-width="3"/>
  <path d="M480 315 L700 315" stroke="#A8A29A" stroke-width="3"/>
  <path d="M480 315 L700 450" stroke="#6B6560" stroke-width="3"/>
  <rect x="720" y="150" width="100" height="60" fill="#1a1a1a" stroke="#F5F2EB"/>
  <rect x="720" y="285" width="100" height="60" fill="#1a1a1a" stroke="#E10600" stroke-width="3"/>
  <rect x="720" y="420" width="100" height="60" fill="#1a1a1a" stroke="#6B6560"/>`,
    'choice-section': `
  <rect x="180" y="180" width="60" height="100" fill="#1a1a1a" stroke="#F5F2EB"/>
  <rect x="180" y="320" width="60" height="100" fill="#1a1a1a" stroke="#A8A29A"/>
  <rect x="180" y="460" width="60" height="60" rx="30" fill="#1a1a1a" stroke="#6B6560"/>
  <path d="M260 230 H400 M260 370 H400 M260 490 H400" stroke="#6B6560" stroke-width="2"/>
  <circle cx="460" cy="230" r="28" fill="none" stroke="#E10600" stroke-width="3"/>
  <circle cx="460" cy="370" r="28" fill="none" stroke="#A8A29A" stroke-width="2"/>
  <circle cx="460" cy="490" r="28" fill="none" stroke="#6B6560" stroke-width="2"/>
  <path d="M500 230 H700 V370 H500 M700 370 V490 H500" stroke="#A8A29A" stroke-width="2" fill="none"/>
  <rect x="740" y="340" width="200" height="60" fill="#121212" stroke="#E10600" stroke-width="2"/>`,
    'measurements-hero': `
  <rect x="160" y="120" width="520" height="390" fill="#121212" stroke="#A8A29A"/>
  <rect x="180" y="150" width="200" height="140" fill="#1a1a1a" stroke="#6B6560"/>
  <rect x="400" y="150" width="260" height="140" fill="#1a1a1a" stroke="#E10600" stroke-width="2"/>
  <rect x="180" y="310" width="480" height="170" fill="#161616" stroke="#6B6560"/>
  <rect x="720" y="120" width="280" height="390" fill="#0f0f0f" stroke="#A8A29A"/>
  <line x1="740" y1="200" x2="960" y2="200" stroke="#6B6560"/>
  <line x1="740" y1="280" x2="920" y2="280" stroke="#A8A29A"/>
  <line x1="740" y1="360" x2="880" y2="360" stroke="#E10600" stroke-width="3"/>`,
    'measurements-section': `
  <circle cx="220" cy="315" r="40" fill="#1a1a1a" stroke="#E10600" stroke-width="3"/>
  <circle cx="400" cy="315" r="40" fill="#1a1a1a" stroke="#A8A29A" stroke-width="2"/>
  <circle cx="580" cy="315" r="40" fill="#1a1a1a" stroke="#A8A29A" stroke-width="2"/>
  <circle cx="760" cy="315" r="40" fill="#1a1a1a" stroke="#A8A29A" stroke-width="2"/>
  <circle cx="940" cy="315" r="40" fill="#1a1a1a" stroke="#F5F2EB" stroke-width="2"/>
  <path d="M260 315 H360 M440 315 H540 M620 315 H720 M800 315 H900" stroke="#6B6560" stroke-width="3"/>
  <rect x="500" y="420" width="200" height="100" fill="#121212" stroke="#E10600" stroke-width="2"/>
  <rect x="720" y="420" width="200" height="100" fill="#121212" stroke="#A8A29A"/>
  <path d="M580 355 V420 M820 355 V420" stroke="#6B6560" stroke-width="2"/>`,
  };
  const art = motifs[name] || motifs['our-goal-hero'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="${name}">
  <rect width="1200" height="675" fill="#0A0A0A"/>
  <rect x="0" y="0" width="8" height="675" fill="#E10600"/>
  <path d="M40 40 H60 M40 40 V60" stroke="#6B6560" stroke-width="1" fill="none"/>
  <path d="M1140 40 H1160 M1160 40 V60" stroke="#6B6560" stroke-width="1" fill="none"/>
  <path d="M40 635 H60 M40 635 V615" stroke="#6B6560" stroke-width="1" fill="none"/>
  <path d="M1140 635 H1160 M1160 635 V615" stroke="#6B6560" stroke-width="1" fill="none"/>
  ${art}
  </svg>`;
}

async function maybeGeminiImage(name, subject) {
  if (!geminiKey()) return null;
  const prompt = `Minimal industrial editorial illustration, flat vector, palette ONLY #E10600 #0A0A0A #F5F2EB and steel greys. Abstract enterprise systems. CRITICAL RULE: the image must contain ZERO typography — no alphabet characters, no numerals, no captions, no annotations, no watermarks. Communicate only with shapes, lines, and colour. Mood: serious production systems. 16:9. Subject: ${subject.slice(0, 200)}`;
  const bodies = [
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: '16:9' },
      },
    },
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    },
  ];
  for (const model of GEMINI_IMAGE_MODELS) {
    for (const body of bodies) {
      try {
        const json = await geminiGenerate(model, body);
        const inline = firstInline(json);
        if (!inline) {
          console.warn(`Gemini image ${model}: no inline for ${name}`);
          continue;
        }
        const ext = (inline.mimeType || inline.mime_type || 'image/png').includes('jpeg')
          ? 'jpg'
          : 'png';
        // Always write as .png filename for embed consistency when jpeg
        const outName = `${name}.png`;
        const out = path.join(OUT_DIR, outName);
        fs.writeFileSync(out, Buffer.from(inline.data, 'base64'));
        const svg = path.join(OUT_DIR, `${name}.svg`);
        if (fs.existsSync(svg)) fs.unlinkSync(svg);
        console.log(`OK ${model} → ${outName} (${fs.statSync(out).size} bytes)`);
        return outName;
      } catch (e) {
        console.warn(`FAIL ${name}:`, e.message);
        if (e.status === 429) await sleep(8000);
      }
    }
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const hasKey = !!geminiKey();
  console.log(`GEMINI key: ${hasKey ? 'present' : 'missing'}`);
  const results = [];
  const only = (process.env.ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
  for (const img of IMAGES) {
    if (only.length && !only.includes(img.name)) continue;
    let file = null;
    if (hasKey) {
      file = await maybeGeminiImage(img.name, img.subject);
      if (!file) await sleep(1500);
    }
    if (!file) {
      const svgPath = path.join(OUT_DIR, `${img.name}.svg`);
      fs.writeFileSync(svgPath, brandSvg(img.name, img.subject));
      // remove stale png if any
      const png = path.join(OUT_DIR, `${img.name}.png`);
      if (fs.existsSync(png)) fs.unlinkSync(png);
      console.log(`SVG fallback → ${img.name}.svg`);
      file = `${img.name}.svg`;
    }
    results.push(file);
    // gentle pacing between calls
    if (hasKey) await sleep(1200);
  }
  console.log('Done:', results.join(', '));
}

main().catch((e) => {
  console.error(redactErr(e.stack || e.message));
  process.exit(1);
});
