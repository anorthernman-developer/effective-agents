#!/usr/bin/env node
/**
 * Effective Agents — roadmap → blog pipeline
 *
 * Fetch M365 RSS → filter AI/Agent/Copilot/… from 1 Sept 2026+
 * → queue → emit up to 3 posts per day cycle
 * → write content/blog/*.md + blog HTML + data/roadmap-ai.json
 *
 * Images: Gemini 2.5/3.1 flash-image when GEMINI_API_KEY else brand SVG
 * Audio: Gemini TTS ~5s (PCM wrapped as WAV) when key else omit
 *
 * Usage: node scripts/roadmap-blog.mjs [--force] [--limit N]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RSS_URL = 'https://www.microsoft.com/releasecommunications/api/v2/m365/rss';
const FROM_DATE = new Date('2026-09-01T00:00:00Z');
const MAX_PER_CYCLE = 3;
const QUEUE_PATH = path.join(ROOT, 'data', 'blog-queue.json');
const DATA_PATH = path.join(ROOT, 'data', 'roadmap-ai.json');
const CONTENT_DIR = path.join(ROOT, 'content', 'blog');
const BLOG_DIR = path.join(ROOT, 'blog');
const STATE_PATH = path.join(ROOT, 'data', 'blog-state.json');

const KEYWORDS = [
  /\bai\b/i,
  /\bagents?\b/i,
  /\bcopilot\b/i,
  /\bcowork\b/i,
  /copilot\s*studio/i,
  /\bfoundry\b/i,
  /sharepoint\s+agents?/i,
  /agent\s+builder/i,
  /azure\s+ai/i,
];

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const limitIdx = args.indexOf('--limit');
const LIMIT = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : MAX_PER_CYCLE;

function ensureDirs() {
  for (const d of [
    path.join(ROOT, 'data'),
    CONTENT_DIR,
    BLOG_DIR,
    path.join(ROOT, 'assets', 'img', 'blog'),
    path.join(ROOT, 'assets', 'audio', 'blog'),
  ]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRss(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const b = m[1];
    const g = (t) => {
      const r = b.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`));
      return r ? stripHtml(r[1]) : '';
    };
    const cats = [...b.matchAll(/<category>([\s\S]*?)<\/category>/g)].map((x) =>
      stripHtml(x[1])
    );
    const rawDesc = (b.match(/<description[^>]*>([\s\S]*?)<\/description>/) || [])[1] || '';
    return {
      id: g('guid'),
      title: g('title'),
      link: g('link'),
      description: stripHtml(rawDesc),
      pubDate: g('pubDate'),
      categories: cats,
      updated: (b.match(/<a10:updated>([\s\S]*?)<\/a10:updated>/) || [])[1] || g('pubDate'),
    };
  });
}

function matchesKeywords(item) {
  const hay = `${item.title} ${item.description} ${item.categories.join(' ')}`;
  return KEYWORDS.some((re) => re.test(hay));
}

function slugify(title, id) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${base || 'item'}-${id}`;
}

function pickTags(item) {
  const tags = new Set();
  const hay = `${item.title} ${item.description} ${item.categories.join(' ')}`.toLowerCase();
  if (/copilot\s*studio/.test(hay)) tags.add('Copilot Studio');
  if (/\bcopilot\b/.test(hay)) tags.add('Copilot');
  if (/\bcowork\b/.test(hay)) tags.add('Cowork');
  if (/\bfoundry\b/.test(hay)) tags.add('Foundry');
  if (/sharepoint/.test(hay) && /agent/.test(hay)) tags.add('SharePoint agent');
  if (/agent\s+builder/.test(hay)) tags.add('Agent Builder');
  if (/\bagents?\b/.test(hay)) tags.add('Agent');
  if (/\bai\b/.test(hay)) tags.add('AI');
  if (/purview/.test(hay)) tags.add('Purview');
  if (/teams/.test(hay)) tags.add('Teams');
  return [...tags].slice(0, 5);
}

function classifyWorry(item) {
  const hay = `${item.title} ${item.description}`.toLowerCase();
  if (/cost|consumption|credit|billing/.test(hay))
    return 'Cost visibility without outcome metrics can become another chat bill. Tie spend to completed work.';
  if (/approval|human|escalat/.test(hay))
    return 'Human approval gates are good — unless they become permanent babysitting. Close the feedback loop.';
  if (/dlp|purview|security|readiness/.test(hay))
    return 'Governance that only blocks is incomplete. Pair controls with eval sets and preference signals.';
  if (/notification|async/.test(hay))
    return 'Async notifications help when agents finish jobs. Noise without completion is chat theatre again.';
  if (/chat|search|ask/.test(hay))
    return 'Search-plus-chat is useful discovery. Do not mistake fluent answers for shipped outcomes.';
  return 'New surface area without grounding, feedback, and measurement risks decorative intelligence.';
}

function whatItDoes(item) {
  const d = item.description;
  if (d.length > 280) return d.slice(0, 277).replace(/\s+\S*$/, '') + '…';
  return d || 'Microsoft roadmap item related to AI or agents in Microsoft 365.';
}

function meansForUsers(item) {
  const tags = pickTags(item);
  if (tags.includes('Copilot Studio'))
    return 'Makers and CoE leads get clearer levers on agent lifecycle cost and behaviour — use them to prove effectiveness, not just publish bots.';
  if (tags.includes('Cowork'))
    return 'Cowork surfaces need the same Purview and preference discipline as any other agent channel.';
  if (tags.includes('SharePoint agent') || /sharepoint/i.test(item.title))
    return 'SharePoint remains the corpus. Prefer agents that update libraries and workflows over agents that only summarise them.';
  if (tags.includes('Copilot'))
    return 'Treat Copilot as the door people already open. Route work through agents that finish steps under identity and audit.';
  return 'For operators: ask what finishes, what is logged, and what preference signal improves the next run.';
}

function brandSvg(title, id) {
  const safe = String(title)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const short = safe.length > 48 ? safe.slice(0, 45) + '…' : safe;
  const lines = [];
  const words = short.split(/\s+/);
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > 28) {
      lines.push(line.trim());
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) lines.push(line);
  const textEls = lines
    .slice(0, 3)
    .map(
      (l, i) =>
        `<text x="48" y="${210 + i * 36}" fill="#F5F2EB" font-family="IBM Plex Sans, Inter, sans-serif" font-size="28" font-weight="600">${l}</text>`
    )
    .join('\n  ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${safe}">
  <rect width="1200" height="630" fill="#0A0A0A"/>
  <rect x="0" y="0" width="8" height="630" fill="#E10600"/>
  <!-- crop marks -->
  <path d="M40 40 H60 M40 40 V60" stroke="#6B6560" stroke-width="1" fill="none"/>
  <path d="M1140 40 H1160 M1160 40 V60" stroke="#6B6560" stroke-width="1" fill="none"/>
  <path d="M40 590 H60 M40 590 V570" stroke="#6B6560" stroke-width="1" fill="none"/>
  <path d="M1140 590 H1160 M1160 590 V570" stroke="#6B6560" stroke-width="1" fill="none"/>
  <text x="48" y="120" fill="#A8A29A" font-family="JetBrains Mono, monospace" font-size="14" letter-spacing="4">ROADMAP · ${id}</text>
  <text x="48" y="168" fill="#E10600" font-family="Inter, sans-serif" font-size="18" font-weight="700" letter-spacing="3">SHIP OUTCOMES, NOT CHAT</text>
  ${textEls}
  <text x="48" y="580" fill="#6B6560" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="2">EFFECTIVE AGENTS</text>
</svg>`;
}

const GEMINI_IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-3.1-flash-image',
];
const GEMINI_TTS_MODELS = [
  'gemini-2.5-flash-preview-tts',
  'gemini-3.1-flash-tts-preview',
];

function geminiKey() {
  return process.env.GEMINI_API_KEY || '';
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

function pcmToWav(pcm, sampleRate = 24000, channels = 1, bitDepth = 16) {
  if (pcm.length >= 12 && pcm.toString('ascii', 0, 4) === 'RIFF') return pcm;
  const header = Buffer.alloc(44);
  const dataSize = pcm.length;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * (bitDepth / 8), 28);
  header.writeUInt16LE(channels * (bitDepth / 8), 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

function clip(s, n) {
  const t = String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= n) return t;
  return t.slice(0, n).replace(/\s+\S*$/, '');
}

function ttsScript(item) {
  const what = clip(item.title.replace(/^Microsoft\s+/i, ''), 36);
  const does = clip(whatItDoes(item), 28);
  const worry = clip(classifyWorry(item), 28);
  const means = clip(meansForUsers(item), 28);
  // Ultra-short: ~5s spoken at brisk pace (~20–25 words).
  return (
    'In five seconds, brisk calm British voice, transcript only: ' +
    `It is ${what}. Does: ${does}. Worry: ${worry}. Users: ${means}.`
  );
}

async function maybeGeminiImage(title, slug) {
  if (!geminiKey()) return null;
  const prompt = `Minimal industrial editorial illustration, flat vector, palette only #E10600 #0A0A0A #F5F2EB and steel greys. Abstract Microsoft 365 agent / Copilot theme. No logos. No readable text. Mood: serious production systems. 16:9 landscape. Subject hint: ${title.slice(0, 120)}`;
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
          console.warn(`Gemini image ${model}: no inline image in response`);
          continue;
        }
        const ext = (inline.mimeType || inline.mime_type || 'image/png').includes('jpeg')
          ? 'jpg'
          : 'png';
        const out = path.join(ROOT, 'assets', 'img', 'blog', `${slug}.${ext}`);
        fs.writeFileSync(out, Buffer.from(inline.data, 'base64'));
        const svg = path.join(ROOT, 'assets', 'img', 'blog', `${slug}.svg`);
        if (ext !== 'svg' && fs.existsSync(svg)) fs.unlinkSync(svg);
        console.log(`Gemini image ${model} → ${slug}.${ext} (${fs.statSync(out).size} bytes)`);
        return `/assets/img/blog/${slug}.${ext}`;
      } catch (e) {
        console.warn('Gemini image failed:', e.message);
        if (e.status === 429) await sleep(8000);
      }
    }
  }
  return null;
}


function squeezeWavTowardFiveSeconds(filePath, sampleRate = 24000, targetSec = 5.2) {
  try {
    const buf = fs.readFileSync(filePath);
    const dur = Math.max(0.01, (buf.length - 44) / (sampleRate * 2));
    if (dur <= 6) return;
    let tempo = dur / targetSec;
    const filters = [];
    while (tempo > 2) {
      filters.push('atempo=2.0');
      tempo /= 2;
    }
    if (tempo > 1.02) filters.push(`atempo=${tempo.toFixed(3)}`);
    if (!filters.length) return;
    const tmp = `${filePath}.tmp.wav`;
    const r = spawnSync(
      'ffmpeg',
      ['-y', '-i', filePath, '-filter:a', filters.join(','), '-ac', '1', '-ar', String(sampleRate), tmp],
      { encoding: 'utf8' }
    );
    if (r.status === 0 && fs.existsSync(tmp) && fs.statSync(tmp).size > 44) {
      fs.renameSync(tmp, filePath);
      const after = (fs.statSync(filePath).size - 44) / (sampleRate * 2);
      console.log(`TTS squeezed ${dur.toFixed(1)}s → ~${after.toFixed(1)}s`);
    } else if (fs.existsSync(tmp)) {
      fs.unlinkSync(tmp);
    }
  } catch (e) {
    console.warn('TTS squeeze skipped:', e.message);
  }
}

async function maybeGeminiTts(item, slug) {
  if (!geminiKey()) return null;
  const spoken = ttsScript(item);
  const body = {
    contents: [{ parts: [{ text: spoken }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  };
  for (const model of GEMINI_TTS_MODELS) {
    try {
      const json = await geminiGenerate(model, body);
      const inline = firstInline(json);
      if (!inline) {
        console.warn(`Gemini TTS ${model}: no audio in response`);
        continue;
      }
      const pcm = Buffer.from(inline.data, 'base64');
      const mime = String(inline.mimeType || inline.mime_type || '');
      const rateMatch = mime.match(/rate=(\d+)/i);
      const rate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      const wav = pcmToWav(pcm, rate);
      const out = path.join(ROOT, 'assets', 'audio', 'blog', `${slug}.wav`);
      fs.writeFileSync(out, wav);
      squeezeWavTowardFiveSeconds(out, rate);
      const finalSize = fs.statSync(out).size;
      console.log(`Gemini TTS ${model} → ${slug}.wav (${finalSize} bytes)`);
      return `/assets/audio/blog/${slug}.wav`;
    } catch (e) {
      console.warn('Gemini TTS failed:', e.message);
      if (e.status === 429) await sleep(8000);
    }
  }
  return null;
}

function loadJson(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function articleMarkdown(item, meta) {
  const tags = pickTags(item);
  const date = new Date(item.pubDate).toISOString().slice(0, 10);
  return `---
title: "${item.title.replace(/"/g, '\\"')}"
date: ${date}
roadmap_id: "${item.id}"
source: "${item.link}"
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
slug: "${meta.slug}"
image: "${meta.image}"
audio: "${meta.audio || ''}"
---

# ${item.title}

**Ship Outcomes, Not Chat** — a short read on a Microsoft 365 roadmap item.

## What it is

${item.title} (${tags.join(', ') || 'AI / agents'}). Roadmap id \`${item.id}\`.

## What it does

${whatItDoes(item)}

## What to worry about

${classifyWorry(item)}

## What it means for users

${meansForUsers(item)}

---

Source: [Microsoft 365 Roadmap](${item.link})
`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sharedHead(title, desc, prefix = '../..') {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — Effective Agents</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <meta name="theme-color" content="#0A0A0A" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}/assets/css/site.css" />
  <script src="${prefix}/assets/js/theme-boot.js"></script>
</head>`;
}

function sharedNav(prefix = '../..', active = '') {
  const a = (name, href) =>
    `<a class="chip${active === name ? ' chip--active' : ''}" href="${prefix}${href}">${name}</a>`;
  return `<nav class="site-nav" aria-label="Primary">
    <div class="inner">
      <a class="chip chip--brand" href="${prefix}/">Effective <span>Agents</span></a>
      <div class="nav-cluster nav-cluster--links">
        ${a('Manifesto', '/')}
        ${a('Blog', '/blog/')}
        ${a('Explore', '/explore/')}
        ${a('Game', '/game/')}
      </div>
      <div class="nav-cluster">
        <button type="button" class="chip chip--ghost chip--toggle" data-theme-toggle>Light</button>
        <button type="button" class="chip chip--ghost chip--toggle" data-plain-toggle>Plain</button>
        <button type="button" class="chip chip--ghost chip--toggle" data-ambient-start>Ambient</button>
        <button type="button" class="chip chip--ghost chip--toggle" data-ambient-mute>Mute</button>
      </div>
    </div>
  </nav>`;
}

function sharedFoot(prefix = '../..') {
  return `<footer class="site-foot">
    <div class="inner">
      <div class="foot-marks"><span class="mark-l">EA</span><span>EA</span></div>
      <div class="foot-chips">
        <a class="foot-chip" href="${prefix}/">Manifesto</a>
        <a class="foot-chip" href="${prefix}/blog/">Blog</a>
        <a class="foot-chip" href="${prefix}/explore/">Explore</a>
        <a class="foot-chip" href="${prefix}/game/">Game</a>
        <a class="foot-chip" href="${prefix}/llms.txt">llms.txt</a>
        <a class="foot-chip" href="${prefix}/manifesto.md">manifesto.md</a>
      </div>
      <p class="foot-meta">Ship Outcomes, Not Chat · en-GB · Not affiliated with Microsoft or TypeSafe AI.<br />Roadmap data © Microsoft — filtered for AI / agent relevance.</p>
    </div>
  </footer>
  <div class="ambient-dock grain-hide-plain" aria-hidden="true"></div>
  <script src="${prefix}/assets/js/site.js"></script>
  <script src="${prefix}/assets/js/ambient.js"></script>`;
}

function articleHtml(item, meta, bodyMd) {
  const tags = pickTags(item);
  const date = new Date(item.pubDate).toISOString().slice(0, 10);
  const audio = meta.audio
    ? `<div class="audio-bar">Listen (~5s)<audio controls preload="none" src="../..${meta.audio}"></audio></div>`
    : '';
  const img =
    meta.image && meta.image.endsWith('.svg')
      ? `<img class="hero-art" src="../..${meta.image}" alt="" width="1200" height="630" />`
      : meta.image
        ? `<img class="hero-art" src="../..${meta.image}" alt="" />`
        : '';

  return `${sharedHead(item.title, whatItDoes(item).slice(0, 160), '../..')}
<body>
  ${sharedNav('../..', 'Blog')}
  <article class="page hero">
    <div class="col framed prose">
      <span class="crop-bl" aria-hidden="true"></span>
      <span class="crop-br" aria-hidden="true"></span>
      <p class="label">Blog · ${date}</p>
      <h1>${escapeHtml(item.title)}</h1>
      <p class="tagline">Ship Outcomes, Not Chat</p>
      <p class="meta" style="font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);margin-bottom:1rem;">
        ${tags.map((t) => `<span class="badge badge--red">${escapeHtml(t)}</span>`).join(' ')}
        · id ${escapeHtml(item.id)}
      </p>
      ${img}
      ${audio}
      <h2>What it is</h2>
      <p>${escapeHtml(item.title)}. Tags: ${escapeHtml(tags.join(', ') || 'AI / agents')}. Roadmap id <code>${escapeHtml(item.id)}</code>.</p>
      <h2>What it does</h2>
      <p>${escapeHtml(whatItDoes(item))}</p>
      <div class="worry">
        <h2>What to worry about</h2>
        <p>${escapeHtml(classifyWorry(item))}</p>
      </div>
      <h2>What it means for users</h2>
      <p>${escapeHtml(meansForUsers(item))}</p>
      <p style="margin-top:2rem;font-size:0.9em;color:var(--muted);">Source: <a href="${escapeHtml(item.link)}" rel="noopener">Microsoft 365 Roadmap</a> · <a href="./index.md">Markdown mirror</a></p>
    </div>
  </article>
  ${sharedFoot('../..')}
</body>
</html>`;
}

function blogIndexHtml(posts) {
  const cards = posts
    .map(
      (p) => `<article class="card">
      <a href="./${escapeHtml(p.slug)}/">
        <p class="meta">${escapeHtml(p.date)} · ${escapeHtml((p.tags || []).slice(0, 2).join(' · '))}</p>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml((p.summary || '').slice(0, 140))}${(p.summary || '').length > 140 ? '…' : ''}</p>
      </a>
    </article>`
    )
    .join('\n');

  return `${sharedHead('Blog', 'Short articles on Microsoft 365 AI and agent roadmap items.', '..')}
<body>
  ${sharedNav('..', 'Blog')}
  <header class="hero page">
    <div class="col framed">
      <span class="crop-bl" aria-hidden="true"></span>
      <span class="crop-br" aria-hidden="true"></span>
      <p class="label">Blog</p>
      <h1>Roadmap, <em>filtered</em> for effectiveness.</h1>
      <p class="tagline">Ship Outcomes, Not Chat</p>
      <p class="lede">Short reads on AI, Agent, Copilot, Cowork, Copilot Studio, Foundry, and SharePoint agent items from the Microsoft 365 roadmap (1 Sept 2026 onwards).</p>
    </div>
  </header>
  <main class="page">
    <div class="col">
      <div class="card-grid">
        ${cards || '<p>No posts yet. Run <code>node scripts/roadmap-blog.mjs</code>.</p>'}
      </div>
    </div>
  </main>
  ${sharedFoot('..')}
</body>
</html>`;
}

async function fetchRss() {
  const res = await fetch(RSS_URL, {
    headers: { 'User-Agent': 'EffectiveAgentsBlogBot/1.0 (+https://github.com/anorthernman-developer/effective-agents)' },
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  return res.text();
}

async function main() {
  ensureDirs();
  console.log('Fetching RSS…');
  let xml;
  try {
    xml = await fetchRss();
  } catch (e) {
    console.warn('Live fetch failed, trying cached sample…', e.message);
    if (!fs.existsSync(DATA_PATH)) throw e;
    xml = null;
  }

  let filtered;
  if (xml) {
    const items = parseRss(xml);
    filtered = items
      .filter((i) => {
        const d = new Date(i.pubDate);
        return !isNaN(d) && d >= FROM_DATE && matchesKeywords(i);
      })
      .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const payload = {
      generatedAt: new Date().toISOString(),
      source: RSS_URL,
      from: '2026-09-01',
      count: filtered.length,
      items: filtered,
    };
    fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2));
    console.log(`Cached ${filtered.length} items → data/roadmap-ai.json`);
  } else {
    filtered = loadJson(DATA_PATH, { items: [] }).items || [];
    console.log(`Using cache: ${filtered.length} items`);
  }

  let queue = loadJson(QUEUE_PATH, { pending: [], emitted: [] });
  const emittedSet = new Set(queue.emitted || []);
  const pendingIds = new Set((queue.pending || []).map((p) => p.id));

  for (const item of filtered) {
    if (emittedSet.has(item.id) || pendingIds.has(item.id)) continue;
    queue.pending.push({
      id: item.id,
      title: item.title,
      enqueuedAt: new Date().toISOString(),
    });
    pendingIds.add(item.id);
  }
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));

  const state = loadJson(STATE_PATH, { lastCycleDay: '', emittedToday: 0 });
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastCycleDay !== today) {
    state.lastCycleDay = today;
    state.emittedToday = 0;
  }

  const budget = FORCE ? LIMIT : Math.max(0, Math.min(LIMIT, MAX_PER_CYCLE - state.emittedToday));
  // Always emit enough for initial site (≥3) if fewer than 3 posts exist
  const existingPosts = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md')).length;
  const needInitial = Math.max(0, 3 - existingPosts);
  const toEmit = Math.max(budget, FORCE ? LIMIT : needInitial);

  console.log(`Emit budget this cycle: ${toEmit} (existing posts: ${existingPosts})`);

  const byId = Object.fromEntries(filtered.map((i) => [i.id, i]));
  const postsMeta = [];
  let emitted = 0;

  // --force: refresh existing posts (images/audio) before draining the pending queue
  const existingEntries = [];
  if (FORCE) {
    const seen = new Set();
    for (const f of fs.readdirSync(CONTENT_DIR).filter((x) => x.endsWith('.md'))) {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
      const m = raw.match(/^roadmap_id:\s*"?([^"\n]+)"?/m);
      const id = m ? m[1].trim() : '';
      if (!id || seen.has(id) || !byId[id]) continue;
      seen.add(id);
      existingEntries.push({ id, title: byId[id].title });
    }
    console.log(`Force-refresh existing posts: ${existingEntries.length}`);
  }
  const emitList = FORCE ? [...existingEntries, ...queue.pending] : [...queue.pending];

  for (const entry of emitList) {
    if (emitted >= toEmit) break;
    const item = byId[entry.id];
    if (!item) {
      queue.pending = queue.pending.filter((p) => p.id !== entry.id);
      continue;
    }
    const slug = slugify(item.title, item.id);
    const postPath = path.join(CONTENT_DIR, `${slug}.md`);
    if (fs.existsSync(postPath) && !FORCE) {
      queue.pending = queue.pending.filter((p) => p.id !== entry.id);
      if (!emittedSet.has(item.id)) {
        queue.emitted.push(item.id);
        emittedSet.add(item.id);
      }
      continue;
    }

    console.log(`Emitting: ${item.title.slice(0, 70)}`);
    let image = await maybeGeminiImage(item.title, slug);
    if (!image) {
      const svgPath = path.join(ROOT, 'assets', 'img', 'blog', `${slug}.svg`);
      fs.writeFileSync(svgPath, brandSvg(item.title, item.id));
      image = `/assets/img/blog/${slug}.svg`;
    }
    const audio = await maybeGeminiTts(item, slug);

    const meta = { slug, image, audio: audio || '' };
    const md = articleMarkdown(item, meta);
    fs.writeFileSync(postPath, md);

    const dir = path.join(BLOG_DIR, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), articleHtml(item, meta, md));
    fs.writeFileSync(path.join(dir, 'index.md'), md);

    queue.pending = queue.pending.filter((p) => p.id !== entry.id);
    if (!emittedSet.has(item.id)) {
      queue.emitted.push(item.id);
      emittedSet.add(item.id);
    }
    emitted++;
    state.emittedToday++;

    postsMeta.push({
      slug,
      title: item.title,
      date: new Date(item.pubDate).toISOString().slice(0, 10),
      tags: pickTags(item),
      summary: whatItDoes(item),
      id: item.id,
      image,
    });
  }

  // Rebuild index from all content/*.md
  const allPosts = [];
  for (const f of fs.readdirSync(CONTENT_DIR).filter((x) => x.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const get = (k) => {
      const m = fm[1].match(new RegExp(`^${k}:\\s*(.*)$`, 'm'));
      return m ? m[1].replace(/^"|"$/g, '') : '';
    };
    const tagsRaw = (fm[1].match(/^tags:\s*\[(.*)\]$/m) || [])[1] || '';
    const tags = [...tagsRaw.matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    allPosts.push({
      slug: get('slug') || f.replace(/\.md$/, ''),
      title: get('title'),
      date: get('date'),
      tags,
      summary: whatItDoes({ description: raw.split('## What it does')[1]?.split('##')[0] || '' }),
      id: get('roadmap_id'),
      image: get('image'),
    });
  }
  allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));

  fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), blogIndexHtml(allPosts));
  fs.writeFileSync(
    path.join(BLOG_DIR, 'index.md'),
    `# Effective Agents Blog\n\n${allPosts.map((p) => `- [${p.title}](./${p.slug}/) — ${p.date}`).join('\n')}\n`
  );

  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
  fs.writeFileSync(
    path.join(ROOT, 'data', 'blog-posts.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), posts: allPosts }, null, 2)
  );

  console.log(`Done. Emitted ${emitted} this run. Total posts: ${allPosts.length}.`);
  if (!process.env.GEMINI_API_KEY) {
    console.log('Note: GEMINI_API_KEY not set — used brand SVG images; audio omitted.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
