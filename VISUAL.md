# Effective Agents — Visual System

**Direction:** Clean editorial manifesto energy with a raw, high-contrast, ink-on-steel edge. Red / black / white. Not pastel. Slightly “greasy” = industrial grit, not grunge clutter.

**Primary tagline:** Ship Outcomes, Not Chat

**Layout lineage:** TypeSafe manifesto *geometry and vibe* (gutters, crop marks, oversized grotesk H1, mono labels, vertical rules, footer symbols) adapted to our palette — never their teal/purple, never proprietary fonts.

---

## Palette

| Token | Role | Hex | Notes |
|-------|------|-----|-------|
| `--black` | Background, heavy rules | `#0A0A0A` | Deep black, not pure `#000` on large fields if OLED bloom is a concern — `#0A0A0A` is the brand black |
| `--ink` | True ink for fine rules / logo / inverted chips | `#000000` | Use sparingly on marks |
| `--white` | Primary type on black; nav chip fill | `#F5F2EB` | Off-white / paper; warmer than `#FFF` |
| `--white-pure` | Highlights, H1, hairlines | `#FFFFFF` | Accents only |
| `--red` | Signal / CTA / emphasis | `#E10600` | Signal red — industrial, not candy |
| `--red-deep` | Hover / pressed | `#B00000` | |
| `--steel` | Secondary text, labels | `#A8A29A` | Cool grey with slight warmth |
| `--steel-dim` | Footnotes, crop marks, meta | `#6B6560` | |
| `--hazard` | Warnings only | `#FF3B30` | Do not use for decoration |
| `--success` | Metrics positive | `#C4C4C4` | Prefer white/steel; avoid green competing with red brand |

### Combinations

- **Manifesto page:** `--black` bg · `--white` body · `--red` for H1 accent words, links, last-words rule, label ticks  
- **Print / PDF:** Black type on `--white` paper; red for section ticks only  
- **UI chrome:** Black panels, steel labels, red for primary button and focus ring  

### Do / Don’t (colour)

**Do:** High contrast; red as a sparse signal (≤5% of pixels).  
**Don’t:** Gradients, neon, pastel pinks, Microsoft Fluent purple as brand colour, glassmorphism, TypeSafe teal/purple.

---

## Typography

### Editorial manifesto pair (TypeSafe-mapped, open fonts)

| Role | Recommendation | Fallback stack |
|------|----------------|----------------|
| **Display / H1** | *Inter* or *IBM Plex Sans* **oversized grotesk** (prefer this over serif for closer TypeSafe vibe) | `system-ui, -apple-system, "Segoe UI", sans-serif` |
| **Body / nav** | *IBM Plex Sans* or *Inter* (sharp grotesk) | `system-ui, -apple-system, "Segoe UI", sans-serif` |
| **Labels / footnotes / mono** | *JetBrains Mono* (small labels, appendix, foot chips) | `"IBM Plex Mono", "SF Mono", Consolas, monospace` |

**Do not** use Die Grotesk or other licensed TypeSafe faces — Inter / IBM Plex Sans are the open stand-ins.

Optional alternate: *Newsreader* for serif display if a print/PDF deck needs editorial warmth — web manifesto prefers oversized grotesk H1.

### Scale (web manifesto)

| Step | Size | Weight | Tracking |
|------|------|--------|----------|
| Label | 11px (JetBrains Mono) | 500 | 0.12–0.16em; uppercase |
| Body | 17–19px | 400 | 0 |
| H2 | 25–34px | 600 | -0.025em |
| H1 | **44–84px** (oversized grotesk) | 700 | -0.04em |
| Tagline | 13–15px mono | 500 | 0.1em uppercase |
| Appendix | 11–12px mono | 400 | 0 |

**en-GB** copy; curly quotes optional; prefer straight in UI chrome.

---

## Layout geometry (TypeSafe-derived → our black field)

| Spec | Value | Notes |
|------|-------|-------|
| Outer gutters | **~30px** (`--gutter`) | Letterbox frame; 20px on narrow viewports |
| Main reading column | **~800px** centered | Long-scroll manifesto, calm text-led |
| Paragraph spacing | **~20px** | Label → gap → text rhythm |
| Section spacing | **~50px** | Between ruled blocks |
| Vertical rules | 1px steel at ~28% opacity | Left edge of each content block |
| Crop marks | 10×10px L-corners in `--steel-dim` | Around major blocks (hero, last words) |
| Appendix width | Narrower (~34rem) | Mono footnotes under vertical rule |
| Nav | **Non-sticky**; white/off-white rectangular chips on black | Invert of TypeSafe’s white-field chips |
| Footer marks | `⊢ ∵` · `■ □` · `⊣` | Effective Agents registration marks (inspired by TypeSafe ∵ ⩆ — invent, don’t copy) |

### Rhythm

1. Mono **label** (with red square tick)  
2. Short gap (~0.85rem)  
3. H2 / body  
4. ~50px air before next ruled block  

Large title at **start** (hero H1) **and** **end** (last-words H1 reprise).

---

## Logo concepts

### Wordmark

`EFFECTIVE AGENTS`

- All caps, tracked out slightly (0.06–0.1em)
- Grotesk bold or condensed grotesk
- Optional: “EFFECTIVE” in `--white`, “AGENTS” in `--red` — or a red underscore / em-dash rule beneath
- In-nav: rectangular chip, black type on `--white`, “Agents” in red

### Mark (icon)

Three concepts (pick one for v1):

1. **Signal bar** — Vertical red bar (1×4 modules) beside a black square; reads as “priority / industrial marker”
2. **Closed loop** — Square open at one corner with a red notch (feedback loop); geometric, not cute
3. **EA stamp** — Monospace “EA” in a steel-edged rectangle with a single red registration mark (corner tick)

**Clear space:** 0.5× mark height on all sides.  
**Minimum size:** 24px digital; 8mm print.

### Lockups

- Horizontal: Mark + wordmark  
- Stacked: Mark above wordmark for square avatars  
- Tagline lockup: Wordmark + “Ship Outcomes, Not Chat” in mono/label style beneath

---

## Do / Don’t

### Do
- Generous whitespace (30px gutters; 800px column)
- Hairline vertical rules + crop marks on major blocks
- Section labels in JetBrains Mono uppercase before each H2
- Oversized grotesk H1 at hero and last words
- Red used for: links, emphasis words, primary CTA, label ticks, last-words rule
- Slight texture optional: 2–4% scan/noise overlay on black (“greasy steel”)

### Don’t
- Stock “AI neural net” illustrations
- Soft drop shadows and pastel cards
- Comic agents / robot mascots
- Sticky nav (keep calm long-scroll)
- Teal / purple / vaporwave hero imagery (TypeSafe palette)
- Claiming Microsoft or TypeSafe visual identity

---

## UI chrome notes (manifesto site)

| Element | Spec |
|---------|------|
| Background | `#0A0A0A` full bleed |
| Max content width | **800px** reading; gutters 30px |
| Nav | Non-sticky white rectangular chips on black; brand chip left; section chips centre; appendix ghost chip right |
| Links | `--red`; underline on hover only |
| Footnotes / appendix | JetBrains Mono, `--steel-dim`, narrower column |
| Buttons / chips | Square corners (0 radius); white fill on black for nav |
| Focus | 2px red outline, offset 2px |
| Selection | `background: #E10600; color: #F5F2EB` |
| Footer | Black chips + `⊢ ∵ ■ □ ⊣` marks; disclaimer: built on Microsoft technologies; no affiliation |
| Motion | Optional 120–200ms fade on section enter; no parallax gimmicks |

### Texture (optional CSS)

```css
body::before {
  content: "";
  pointer-events: none;
  position: fixed;
  inset: 0;
  opacity: 0.035;
  /* repeating-linear scan + grit — keep subordinate to type */
}
```

Keep grit subordinate to type.

---

## Reference archive

TypeSafe geometry references (palette **not** adopted) live at:

`previews/typesafe-ref/`

- `01-hero-nav-chips-cropmarks.png`
- `02-hero-oversized-h1.png`
- `03-teal-hero-composable.png`
- `04-body-vertical-rules-labels.png`
- `05-split-column-vertical-rule.png`
- `06-appendix-footer-chips-symbols.png`

Use for spacing / crop / rule / chip geometry only.

---

## Application checklist

- [x] Manifesto landing (`index.html`) — TypeSafe geometry + EA red/black/white  
- [ ] Slide master: black title slides, white content slides, red accent bar left  
- [ ] Proposal PDF: grotesk titles, grotesk body, red section ticks  
- [ ] Favicon: signal bar or EA stamp on black  
- [ ] Social OG: black field, oversized grotesk H1, red rule, tagline in mono  
