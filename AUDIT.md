# Originality / leftover audit

**Date:** 16 Sep 2026 (Europe/London)  
**Scope:** HTML / MD / JS / CSS / txt / xml (skipped `.git`, `previews/`, `_sources/`, binary)

## Findings summary

| Category | Count | Action |
|----------|------:|--------|
| TypeSafe slogan echoes (horseless carriage, Build Prod Not God, Cambrian, Composable AI, System One, machine-native, databases before SQL, LAST WORDS) | 0 | None present in user-facing or source text |
| TypeSafe affiliation / derivation language | 6 | Softened in `VISUAL.md` (see below). Kept intentional “not affiliated with … TypeSafe AI” disclaimers sitewide |
| User-facing “Manifesto” labels | 0 | Nav/footer already say **Our Goal**; `manifesto.md` remains redirect stub only |
| Verbatim ValueLens / AIO / board-blueprint lifts | 0 | Insights & Measurements already EA summaries with short fair-use name-checks |
| Demo / lorem / “sample dataset as ours” | 0 | Only UI `placeholder=` attrs and legal contact placeholder via `site-config.js` |

**Findings addressed this pass:** 6 (VISUAL.md) + documentation of clean scan → **AUDIT recorded**.

## Fixes applied

### `VISUAL.md`
- Removed “closer TypeSafe vibe” / “TypeSafe-derived” / “Invert of TypeSafe’s…” / “inspired by TypeSafe ∵…” / “licensed TypeSafe faces” / “TypeSafe palette” phrasing.
- Replaced with EA-owned editorial language. Disclaimers elsewhere still correctly deny affiliation.

### Preserved on purpose
- `manifesto.md` → stub to `our-goal.md` / `/`
- Fair-use mentions of ValueLens, AI-in-One, Balanced Scorecard, NIST AI RMF, DORA-style caution in Insights / Measurements (short attribution, original EA prose)
- “Not affiliated with Microsoft or TypeSafe AI” footers and brand docs

### Image embeds (verified, not regenerated)
| Page | Hero | Secondary |
|------|------|-----------|
| `/` | `assets/img/sections/our-goal-hero.png` | `our-goal-intent.png` |
| `/insights/` | `insights-hero.png` | `insights-value.png` |
| `/choice/` | `choice-hero.png` | `choice-triage.png` |
| `/measurements/` | `measurements-hero.png` | `measurements-chain.png` |

All four pages already had `<img>` embeds; no missing embeds found.

## Related ship work (same change-set)
- `/start/` typeform-style challenge funnel + `assets/js/funnel.js`
- `/capabilities/` hub + five lenses (`grc`, `licence-value`, `processes`, `agents`, `roi`)
- Nav/footer: Start + Capabilities sitewide; sitemap / llms.txt / README updated
