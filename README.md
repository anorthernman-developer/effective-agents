# Effective Agents

**Ship Outcomes, Not Chat**

Outcome-shipping agents on Microsoft’s stack (SharePoint agents, Copilot, Copilot Studio, Agent Builder, Microsoft Foundry, Purview, Scout). Independent brand — built on Microsoft technologies; not affiliated with Microsoft or TypeSafe AI.

Spelling: **en-GB**.

---

## Site (static / Netlify)

| Path | Purpose |
|------|---------|
| [`/`](./index.html) | Our Goal (home) |
| [`/start/`](./start/) | Challenge funnel (typeform-style) → capability path |
| [`/capabilities/`](./capabilities/) | Capability hub + five lenses (GRC, licence-value, processes, agents, ROI) |
| [`/insights/`](./insights/) | Effective Insights — telemetry → ROI narrative |
| [`/choice/`](./choice/) | Effective Choice — augment / automate / leave be |
| [`/measurements/`](./measurements/) | Effective Measurements — board packs & gates |
| [`/blog/`](./blog/) | Short roadmap articles (what / does / worry / means for users) |
| [`/explore/`](./explore/) | Interactive filtered roadmap — pin & personalise (`localStorage`) |
| [`/game/`](./game/) | Vintage retro turn-by-turn humorous game on the same dataset |
| [`/our-goal.md`](./our-goal.md) | Markdown Our Goal mirror |
| [`/manifesto.md`](./manifesto.md) | Redirect stub → our-goal.md |
| [`/llms.txt`](./llms.txt) | Machine-readable site map |
| [`/data/roadmap-ai.json`](./data/roadmap-ai.json) | Cached filtered M365 AI/agent roadmap (offline-friendly) |
| [`sitemap.xml`](./sitemap.xml) / [`robots.txt`](./robots.txt) | Crawlers |

**Modes:** light/dark (persisted), plain-text mode, quiet Web Audio ambient (user-start + mute).

**Brand kit (docs):** [BRAND.md](./BRAND.md) · [OUR-GOAL.md](./OUR-GOAL.md) · [FRAMEWORK.md](./FRAMEWORK.md) · [BUSINESS.md](./BUSINESS.md) · [VISUAL.md](./VISUAL.md) · [TAGLINES.md](./TAGLINES.md)

---

## Local preview

```bash
python3 -m http.server 8765 --bind 127.0.0.1
# http://127.0.0.1:8765/
```

Or open `index.html` via `file://` (fetch of `/data/roadmap-ai.json` needs a local server for Explore/Game).

---

## Roadmap → blog pipeline

```bash
node scripts/roadmap-blog.mjs
# optional:
node scripts/roadmap-blog.mjs --force --limit 3
```

1. Fetches [Microsoft 365 Roadmap RSS](https://www.microsoft.com/releasecommunications/api/v2/m365/rss)
2. Filters AI / Agent / Copilot / Cowork / Copilot Studio / Foundry / SharePoint agent / Agent Builder (from **1 Sept 2026**)
3. Queues items (`data/blog-queue.json`) and emits up to **3 posts per day cycle**
4. Writes `content/blog/*.md`, `blog/<slug>/index.html` + `.md` mirrors, refreshes `blog/index.html`, updates `data/roadmap-ai.json`

### `GEMINI_API_KEY` (optional)

| Feature | With key | Without key |
|---------|----------|-------------|
| Blog hero images | Gemini image generation | Brand SVG under `assets/img/blog/` |
| Short audio (~12–20s) | Gemini TTS → `assets/audio/blog/` | Omitted |

**Never commit secrets.** Use Netlify env vars or a local `.env` (gitignored).

---

## Deploy

Static site — Netlify publish directory is repo root (`netlify.toml`). Push to `main` to deploy when the site is linked.

```bash
git push origin main
```

---

## Disclaimer

Effective Agents is not affiliated with, endorsed by, or sponsored by Microsoft Corporation or TypeSafe AI. Product names describe interoperability. Roadmap titles and descriptions © Microsoft.

## Config

- `assets/js/site-config.js` — set `TIP_URL` to your Buy Me a Coffee / Stripe Payment Link (leave empty for `#tip` instructions only). Never commit API keys.
- `GEMINI_API_KEY` from env or `/home/box/agent-data/box-secrets.json` card (pipeline only).

## Notable paths

- `/` Our Goal · `/start/` · `/capabilities/` (+ `/grc/`, `/licence-value/`, `/processes/`, `/agents/`, `/roi/`) · `/insights/` · `/choice/` · `/measurements/` · `/blog/` · `/explore/` · `/game/` · `/game/v2/` · `/legal/` · see `AUDIT.md`
