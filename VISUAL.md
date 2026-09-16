# Effective Agents — Visual System

**Direction:** Clean editorial manifesto energy with a raw, high-contrast, ink-on-steel edge. Red / black / white. Not pastel. Slightly “greasy” = industrial grit, not grunge clutter.

**Primary tagline:** Ship Outcomes, Not Chat

---

## Palette

| Token | Role | Hex | Notes |
|-------|------|-----|-------|
| `--black` | Background, heavy rules | `#0A0A0A` | Deep black, not pure `#000` on large fields if OLED bloom is a concern — `#0A0A0A` is the brand black |
| `--ink` | True ink for fine rules / logo | `#000000` | Use sparingly on marks |
| `--white` | Primary type on black | `#F5F2EB` | Off-white / paper; warmer than `#FFF` |
| `--white-pure` | Highlights, hairlines | `#FFFFFF` | Accents only |
| `--red` | Signal / CTA / emphasis | `#E10600` | Signal red — industrial, not candy |
| `--red-deep` | Hover / pressed | `#B00000` | |
| `--steel` | Secondary text, labels | `#A8A29A` | Cool grey with slight warmth |
| `--steel-dim` | Footnotes, meta | `#6B6560` | |
| `--hazard` | Warnings only | `#FF3B30` | Do not use for decoration |
| `--success` | Metrics positive | `#C4C4C4` | Prefer white/steel; avoid green competing with red brand |

### Combinations

- **Manifesto page:** `--black` bg · `--white` body · `--red` for H1 accent marks, links, “LAST WORDS” rule  
- **Print / PDF:** Black type on `--white` paper; red for section ticks only  
- **UI chrome:** Black panels, steel labels, red for primary button and focus ring  

### Do / Don’t (colour)

**Do:** High contrast; red as a sparse signal (≤5% of pixels).  
**Don’t:** Gradients, neon, pastel pinks, Microsoft Fluent purple as brand colour, glassmorphism.

---

## Typography

### Editorial manifesto pair (premium)

| Role | Recommendation | Fallback stack |
|------|----------------|----------------|
| **Display / H1** | *Newsreader* or *Source Serif 4* (serif, editorial) | `Georgia, "Times New Roman", serif` |
| **Body** | *Inter* or *IBM Plex Sans* (sharp grotesk) | `system-ui, -apple-system, "Segoe UI", sans-serif` |
| **Labels / small caps / mono** | *IBM Plex Mono* or *JetBrains Mono* | `"SF Mono", "Consolas", "Liberation Mono", monospace` |

TypeSafe-adjacent feel = **sharp grotesk body + serif display + mono labels** — not soft rounded sans everywhere.

### Scale (web manifesto)

| Step | Size | Weight | Tracking |
|------|------|--------|----------|
| Label | 11–12px | 500 | 0.12–0.18em; uppercase / small-caps |
| Body | 18–20px | 400 | 0 |
| H2 | 28–36px | 600 | -0.02em |
| H1 | 48–72px | 600–700 | -0.03em |
| Tagline | 20–24px | 500 | 0.02em |

**en-GB** copy; curly quotes optional; prefer straight in UI chrome.

---

## Logo concepts

### Wordmark

`EFFECTIVE AGENTS`

- All caps, tracked out slightly (0.06–0.1em)
- Grotesk bold or condensed grotesk
- Optional: “EFFECTIVE” in `--white`, “AGENTS” in `--red` — or a red underscore / em-dash rule beneath

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
- Generous whitespace (manifesto margins ≥ 10vw or 64px)
- Hairline rules in steel or white at 1px
- Section labels in mono uppercase before each H2
- Red used for: links, emphasis words, primary CTA, focal rule under LAST WORDS
- Slight texture optional: 2–3% noise overlay on black (keep subtle — “greasy steel”, not distressed scrapbook)

### Don’t
- Stock “AI neural net” illustrations
- Soft drop shadows and pastel cards
- Comic agents / robot mascots
- Dense paragraph walls without subheads
- Centred everything — prefer strong left editorial axis
- Claiming Microsoft or TypeSafe visual identity (no Microsoft logo in brand mark; Fluent icons OK *inside product UI mockups only* with trademark care)

---

## UI chrome notes (manifesto site)

| Element | Spec |
|---------|------|
| Background | `#0A0A0A` full bleed |
| Max content width | 720–800px for reading; 1120px for split layouts |
| Nav | Minimal: wordmark left, Manifesto / Framework links; mono labels |
| Links | `--red`; underline on hover only |
| Footnotes | `--steel-dim`, smaller; superscript in red or white |
| Buttons | Red fill, black or white text; square corners or 2px radius max |
| Focus | 2px red outline, offset 2px |
| Selection | `background: #E10600; color: #F5F2EB` |
| Footer | Steel text; disclaimer: built on Microsoft technologies; no affiliation |
| Motion | Optional 120–200ms fade on section enter; no parallax gimmicks |

### Texture (optional CSS)

```css
body::before {
  content: "";
  pointer-events: none;
  position: fixed;
  inset: 0;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,...noise...");
  /* or CSS noise via repeating gradients */
}
```

Keep grit subordinate to type.

---

## Application checklist

- [ ] Manifesto landing (`index.html`) matches palette + type pair  
- [ ] Slide master: black title slides, white content slides, red accent bar left  
- [ ] Proposal PDF: serif titles, grotesk body, red section ticks  
- [ ] Favicon: signal bar or EA stamp on black  
- [ ] Social OG: black field, large serif H1, red rule, tagline in mono  
