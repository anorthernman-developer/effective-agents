#!/usr/bin/env node
/**
 * Generate supporting Gemini images for Effective Agents section pages.
 * Writes 16:9 PNGs into assets/img/sections/ (canonical names).
 * Retry once per image; branded SVG + PNG fallback.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, 'assets', 'img', 'sections');

const MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3.1-flash-image',
];

const IMAGES = [
  {
    name: 'our-goal-hero',
    subject:
      'Abstract geometric agents finishing work: closed loops completing, production stacks of finished artefacts, block-figure workers closing cycles. No speech bubbles, no chat panes.',
  },
  {
    name: 'our-goal-intent',
    subject:
      'Intent-to-Governance as six stacked geometric strata or nested planes, distinguished only by thickness, tone, and a red tick. Pure geometry. ZERO letters ZERO words ZERO labels.',
  },
  {
    name: 'insights-hero',
    subject:
      'Telemetry ROI dashboard signals as abstract data forms: bars, arcs, pulses, sparse red marks on steel panels. No numbers, no UI chrome, no logos.',
  },
  {
    name: 'insights-value',
    subject:
      'Hours saved becoming assisted value: clock-like arcs transforming into a rising value mass of blocks and gears. Abstract metaphor. No numbers.',
  },
  {
    name: 'choice-hero',
    subject:
      'Block-silhouette people on a work-flow spine that forks into three unlabeled paths. Distinguish paths by shape only. ZERO letters ZERO words ZERO labels.',
  },
  {
    name: 'choice-triage',
    subject:
      'Three paths branching from one origin as distinct geometric routes. No labels, no text.',
  },
  {
    name: 'measurements-hero',
    subject:
      'Board pack and balanced scorecard as overlapping abstract panels and lenses, four frames. No readable text.',
  },
  {
    name: 'measurements-chain',
    subject:
      'Horizontal chain of four linked geometric nodes (square, circle, octagon, arrow-block). ZERO letters ZERO words ZERO numerals ZERO labels.',
  },
];

function geminiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  try {
    for (const cand of [
      '/home/box/agent-data/box-secrets.json',
      '/home/box/sand-data/box-secrets.json',
    ]) {
      if (!fs.existsSync(cand)) continue;
      const j = JSON.parse(fs.readFileSync(cand, 'utf8'));
      const k = j?.card?.GEMINI_API_KEY || j?.GEMINI_API_KEY || '';
      if (k) {
        process.env.GEMINI_API_KEY = k;
        return k;
      }
    }
  } catch {}
  return '';
}

function redact(s) {
  const key = geminiKey();
  let out = String(s || '');
  if (key) out = out.split(key).join('***');
  return out;
}

async function geminiGenerate(model, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey() },
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let json;
  try { json = JSON.parse(raw); } catch { json = { raw: raw.slice(0, 400) }; }
  if (!res.ok) {
    const msg = json?.error?.message || json?.raw || res.statusText;
    const err = new Error(`${model} HTTP ${res.status}: ${redact(msg).slice(0, 240)}`);
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

function brandSvg(name) {
  const motifs = {
    'our-goal-hero': `<circle cx="280" cy="338" r="110" fill="none" stroke="#A8A29A" stroke-width="3"/><path d="M280 228 A110 110 0 1 1 170 338" stroke="#E10600" stroke-width="8" fill="none"/><rect x="470" y="250" width="90" height="220" fill="#1a1a1a" stroke="#6B6560"/><rect x="590" y="200" width="90" height="270" fill="#161616" stroke="#A8A29A"/><rect x="710" y="150" width="90" height="320" fill="#121212" stroke="#E10600" stroke-width="3"/><circle cx="755" cy="128" r="14" fill="#E10600"/>`,
    'our-goal-intent': `<rect x="240" y="470" width="720" height="70" fill="#141414" stroke="#6B6560"/><rect x="270" y="390" width="660" height="70" fill="#161616" stroke="#A8A29A"/><rect x="300" y="310" width="600" height="70" fill="#181818" stroke="#A8A29A"/><rect x="330" y="230" width="540" height="70" fill="#1a1a1a" stroke="#A8A29A"/><rect x="360" y="150" width="480" height="70" fill="#1c1c1c" stroke="#F5F2EB"/><rect x="390" y="70" width="420" height="70" fill="#121212" stroke="#E10600" stroke-width="3"/><rect x="250" y="492" width="12" height="12" fill="#E10600"/><rect x="400" y="92" width="12" height="12" fill="#E10600"/>`,
    'insights-hero': `<rect x="140" y="120" width="920" height="430" fill="#121212" stroke="#6B6560"/><rect x="180" y="380" width="36" height="120" fill="#A8A29A"/><rect x="240" y="320" width="36" height="180" fill="#A8A29A"/><rect x="300" y="250" width="36" height="250" fill="#E10600"/><rect x="360" y="290" width="36" height="210" fill="#A8A29A"/><rect x="420" y="200" width="36" height="300" fill="#F5F2EB"/><path d="M560 400 Q640 180 740 260 T940 200" stroke="#E10600" stroke-width="3" fill="none"/><circle cx="940" cy="200" r="8" fill="#E10600"/>`,
    'insights-value': `<circle cx="320" cy="338" r="150" fill="none" stroke="#6B6560" stroke-width="18"/><path d="M320 188 A150 150 0 0 1 470 338" stroke="#E10600" stroke-width="18" fill="none"/><rect x="560" y="430" width="120" height="70" fill="#1a1a1a" stroke="#6B6560"/><rect x="700" y="340" width="120" height="160" fill="#161616" stroke="#A8A29A"/><rect x="840" y="200" width="120" height="300" fill="#121212" stroke="#E10600" stroke-width="3"/>`,
    'choice-hero': `<rect x="120" y="290" width="40" height="90" fill="#1a1a1a" stroke="#F5F2EB"/><path d="M260 335 H480" stroke="#A8A29A" stroke-width="4"/><circle cx="480" cy="335" r="16" fill="#E10600"/><path d="M496 335 L760 180" stroke="#F5F2EB" stroke-width="3"/><path d="M496 335 L760 335" stroke="#A8A29A" stroke-width="3"/><path d="M496 335 L760 490" stroke="#6B6560" stroke-width="3"/><rect x="780" y="150" width="220" height="60" fill="#1a1a1a" stroke="#F5F2EB"/><rect x="780" y="305" width="220" height="60" fill="#1a1a1a" stroke="#E10600" stroke-width="3"/><rect x="780" y="460" width="220" height="60" fill="#1a1a1a" stroke="#6B6560"/>`,
    'choice-triage': `<circle cx="240" cy="338" r="28" fill="#1a1a1a" stroke="#E10600" stroke-width="4"/><path d="M268 338 H420" stroke="#A8A29A" stroke-width="4"/><path d="M420 338 L780 160" stroke="#F5F2EB" stroke-width="3"/><path d="M420 338 L900 338" stroke="#E10600" stroke-width="4"/><path d="M420 338 L780 516" stroke="#6B6560" stroke-width="3"/><rect x="800" y="130" width="160" height="60" fill="#1a1a1a" stroke="#F5F2EB"/><rect x="920" y="308" width="160" height="60" fill="#1a1a1a" stroke="#E10600" stroke-width="3"/><rect x="800" y="486" width="160" height="60" fill="#1a1a1a" stroke="#6B6560"/>`,
    'measurements-hero': `<rect x="150" y="130" width="280" height="200" fill="#121212" stroke="#A8A29A"/><rect x="460" y="110" width="300" height="220" fill="#141414" stroke="#E10600" stroke-width="3"/><rect x="790" y="140" width="260" height="190" fill="#121212" stroke="#A8A29A"/><rect x="220" y="370" width="760" height="180" fill="#161616" stroke="#6B6560"/><rect x="270" y="160" width="110" height="40" fill="#E10600"/><line x1="250" y1="430" x2="900" y2="430" stroke="#6B6560"/><line x1="250" y1="520" x2="700" y2="520" stroke="#E10600" stroke-width="3"/>`,
    'measurements-chain': `<circle cx="180" cy="300" r="48" fill="#1a1a1a" stroke="#E10600" stroke-width="3"/><circle cx="420" cy="300" r="48" fill="#1a1a1a" stroke="#A8A29A" stroke-width="3"/><circle cx="660" cy="300" r="48" fill="#1a1a1a" stroke="#A8A29A" stroke-width="3"/><circle cx="900" cy="300" r="48" fill="#1a1a1a" stroke="#F5F2EB" stroke-width="3"/><path d="M228 300 H372 M468 300 H612 M708 300 H852" stroke="#6B6560" stroke-width="6"/>`,
  };
  const art = motifs[name] || motifs['our-goal-hero'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <rect width="1200" height="675" fill="#0A0A0A"/>
  <rect x="0" y="0" width="8" height="675" fill="#E10600"/>
  ${art}
</svg>`;
}

function writeFallback(name) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const svgPath = path.join(OUT_DIR, `${name}.svg`);
  const pngPath = path.join(OUT_DIR, `${name}.png`);
  fs.writeFileSync(svgPath, brandSvg(name));
  const drawer = `
from PIL import Image, ImageDraw
W, H = 1200, 675
im = Image.new('RGB', (W, H), '#0A0A0A')
d = ImageDraw.Draw(im)
RED, STEEL, DIM, PAPER, GREY = '#E10600', '#A8A29A', '#6B6560', '#F5F2EB', '#1a1a1a'
d.rectangle([0, 0, 8, H], fill=RED)
name = ${JSON.stringify(name)}
if name == 'our-goal-hero':
    d.ellipse([170,228,390,448], outline=STEEL, width=3)
    d.rectangle([470,250,560,470], outline=DIM, fill=GREY)
    d.rectangle([590,200,680,470], outline=STEEL, fill='#161616')
    d.rectangle([710,150,800,470], outline=RED, fill='#121212', width=3)
    d.ellipse([741,114,769,142], fill=RED)
elif name == 'our-goal-intent':
    layers = [(240,470,960,540),(270,390,930,460),(300,310,900,380),(330,230,870,300),(360,150,840,220),(390,70,810,140)]
    for i, box in enumerate(layers):
        d.rectangle(list(box), outline=RED if i==5 else STEEL, fill='#141414', width=3 if i==5 else 2)
        d.rectangle([box[0]+10, box[1]+22, box[0]+22, box[1]+34], fill=RED)
elif name == 'insights-hero':
    d.rectangle([140,120,1060,550], outline=DIM, fill='#121212')
    for x0,y0,x1,y1,c in [(180,380,216,500,STEEL),(240,320,276,500,STEEL),(300,250,336,500,RED),(360,290,396,500,STEEL),(420,200,456,500,PAPER)]:
        d.rectangle([x0,y0,x1,y1], fill=c)
elif name == 'insights-value':
    d.ellipse([170,188,470,488], outline=DIM, width=18)
    d.arc([170,188,470,488], -90, 0, fill=RED, width=18)
    d.rectangle([560,430,680,500], outline=DIM, fill=GREY)
    d.rectangle([700,340,820,500], outline=STEEL, fill='#161616')
    d.rectangle([840,200,960,500], outline=RED, fill='#121212', width=3)
elif name == 'choice-hero':
    d.line([(260,335),(480,335)], fill=STEEL, width=4)
    d.ellipse([464,319,496,351], fill=RED)
    d.line([(496,335),(760,180)], fill=PAPER, width=3)
    d.line([(496,335),(760,335)], fill=STEEL, width=3)
    d.line([(496,335),(760,490)], fill=DIM, width=3)
    d.rectangle([780,150,1000,210], outline=PAPER, fill=GREY)
    d.rectangle([780,305,1000,365], outline=RED, fill=GREY, width=3)
    d.rectangle([780,460,1000,520], outline=DIM, fill=GREY)
elif name == 'choice-triage':
    d.ellipse([212,310,268,366], outline=RED, fill=GREY, width=4)
    d.line([(268,338),(420,338)], fill=STEEL, width=4)
    d.line([(420,338),(780,160)], fill=PAPER, width=3)
    d.line([(420,338),(900,338)], fill=RED, width=4)
    d.line([(420,338),(780,516)], fill=DIM, width=3)
elif name == 'measurements-hero':
    d.rectangle([150,130,430,330], outline=STEEL, fill='#121212')
    d.rectangle([460,110,760,330], outline=RED, fill='#141414', width=3)
    d.rectangle([790,140,1050,330], outline=STEEL, fill='#121212')
    d.rectangle([220,370,980,550], outline=DIM, fill='#161616')
elif name == 'measurements-chain':
    for x, col in [(180,RED),(420,STEEL),(660,STEEL),(900,PAPER)]:
        d.ellipse([x-48,252,x+48,348], outline=col, fill=GREY, width=3)
    d.line([(228,300),(372,300)], fill=DIM, width=6)
    d.line([(468,300),(612,300)], fill=DIM, width=6)
    d.line([(708,300),(852,300)], fill=DIM, width=6)
im.save(${JSON.stringify(pngPath)}, 'PNG')
print('PIL', ${JSON.stringify(pngPath)})
`;
  const r = spawnSync('python3', ['-c', drawer], { encoding: 'utf8' });
  if (r.status !== 0) console.warn('PIL fallback failed:', (r.stderr || r.stdout || '').slice(0, 240));
  else console.log((r.stdout || '').trim());
  console.log(`SVG fallback → ${name}.svg`);
  return fs.existsSync(pngPath) ? `${name}.png` : `${name}.svg`;
}

async function maybeGemini(name, subject) {
  if (!geminiKey()) return null;
  const prompt = `Minimal industrial editorial illustration, flat vector-ish, palette ONLY #E10600 #0A0A0A #F5F2EB and steel greys. Abstract enterprise agents. CRITICAL: ZERO typography — no letters, numbers, captions, labels, logos, Microsoft marks, speech bubbles, UI chrome. Shapes and colour only. Mood: serious production systems, ink-on-steel. 16:9 landscape. Subject: ${subject.slice(0, 280)}`;
  const bodies = [
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } } },
    { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseModalities: ['TEXT', 'IMAGE'] } },
  ];
  async function attempt(model, body) {
    const json = await geminiGenerate(model, body);
    const inline = firstInline(json);
    if (!inline) {
      console.warn(`no inline ${model} ${name}`);
      return false;
    }
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const out = path.join(OUT_DIR, `${name}.png`);
    fs.writeFileSync(out, Buffer.from(inline.data, 'base64'));
    const svg = path.join(OUT_DIR, `${name}.svg`);
    if (fs.existsSync(svg)) fs.unlinkSync(svg);
    console.log(`OK ${model} → ${name}.png (${fs.statSync(out).size} bytes)`);
    return true;
  }
  for (const model of MODELS) {
    for (const body of bodies) {
      try {
        if (await attempt(model, body)) return `${name}.png`;
      } catch (e) {
        console.warn(`FAIL ${name}:`, e.message);
        if (e.status === 429) await new Promise((r) => setTimeout(r, 8000));
      }
      try {
        await new Promise((r) => setTimeout(r, 1200));
        if (await attempt(model, body)) return `${name}.png`;
      } catch (e) {
        console.warn(`RETRY FAIL ${name}:`, e.message);
        if (e.status === 429) await new Promise((r) => setTimeout(r, 8000));
      }
    }
  }
  return null;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const hasKey = !!geminiKey();
  console.log(`GEMINI key: ${hasKey ? 'present' : 'missing'}; OUT_DIR=${OUT_DIR}`);
  const only = (process.env.ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);
  const results = [];
  for (const img of IMAGES) {
    if (only.length && !only.includes(img.name)) continue;
    let file = hasKey ? await maybeGemini(img.name, img.subject) : null;
    if (!file) file = writeFallback(img.name);
    results.push(file);
    if (hasKey) await new Promise((r) => setTimeout(r, 800));
  }
  console.log('Done:', results.join(', '));
}

main().catch((e) => {
  console.error(redact(e.stack || e.message));
  process.exit(1);
});
