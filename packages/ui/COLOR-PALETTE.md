# Color Palette

Design reference: [Bobbin](https://withbobbin.com/) — especially the hero: airy layout, soft tinted background, bold headline, eyebrow label, primary + secondary CTAs, and a product preview card on a calm surface.

**Brand anchor:** Royal Blue (`#4169E1`).

Use this file as the single source of truth. Map tokens in `src/tokens.css` and consume via Tailwind (`@theme`) or CSS variables.

---

## Design intent

| Bobbin pattern | Church site adaptation |
|----------------|------------------------|
| Soft off-white / tinted hero background | `surface-hero` — cool blue wash, not flat gray |
| Strong headline + muted subcopy | `ink` scale for hierarchy |
| One solid primary CTA | `brand-600` button on white text |
| Ghost / text secondary action | `brand-600` outline or `ink-muted` link |
| Floating UI preview card | `surface-elevated` + `shadow-hero` |
| Trust / social proof strip | `surface-subtle` band below hero |

---

## Brand — Royal Blue

| Token | Hex | Usage |
|-------|-----|--------|
| `brand-50` | `#EEF2FC` | Hero wash, hover backgrounds |
| `brand-100` | `#D9E4FA` | Selected rows, light badges |
| `brand-200` | `#B3C9F5` | Borders on tinted surfaces |
| `brand-300` | `#8DAEF0` | Icons, decorative accents |
| `brand-400` | `#5C85E8` | Links (dark mode), focus rings |
| `brand-500` | `#4169E1` | **Primary brand** — logo, key accents |
| `brand-600` | `#3454B4` | **Primary buttons**, active nav |
| `brand-700` | `#2A4390` | Button hover, pressed states |
| `brand-800` | `#1F326C` | Dark sections, footer bands |
| `brand-900` | `#15224A` | Headlines on light backgrounds |
| `brand-950` | `#0C1428` | Deepest brand tint |

---

## Neutrals — Ink & Surface

Cool grays aligned with blue undertones (Bobbin-style, not warm stone).

### Ink (text)

| Token | Hex | Usage |
|-------|-----|--------|
| `ink` | `#0F172A` | Primary body on light surfaces |
| `ink-heading` | `#0C1428` | H1–H3, hero headline |
| `ink-muted` | `#475569` | Subcopy, descriptions |
| `ink-subtle` | `#64748B` | Captions, meta, placeholders |
| `ink-inverse` | `#F8FAFC` | Text on `brand-700+` backgrounds |

### Surface (backgrounds)

| Token | Hex | Usage |
|-------|-----|--------|
| `surface` | `#FFFFFF` | Cards, modals, nav bar |
| `surface-subtle` | `#F8FAFC` | Page background, alternating sections |
| `surface-muted` | `#F1F5F9` | Trust strip, table headers |
| `surface-hero` | `#EEF2FC` | Hero section base (brand-50) |
| `surface-hero-end` | `#F8FAFC` | Hero gradient end (surface-subtle) |
| `surface-elevated` | `#FFFFFF` | Hero preview card, dropdowns |

---

## Accent — Gold (optional warmth)

Use sparingly for church context (seasonal highlights, icons). Not for primary actions.

| Token | Hex | Usage |
|-------|-----|--------|
| `accent-400` | `#FBBF24` | Highlights, stars |
| `accent-500` | `#F59E0B` | Badges, small emphasis |
| `accent-600` | `#D97706` | Accent hover |

---

## Semantic

| Token | Hex | Usage |
|-------|-----|--------|
| `success` | `#059669` | Confirmations, live status |
| `success-subtle` | `#ECFDF5` | Success banners |
| `warning` | `#D97706` | Caution states |
| `warning-subtle` | `#FFFBEB` | Warning banners |
| `error` | `#DC2626` | Errors, destructive |
| `error-subtle` | `#FEF2F2` | Error banners |
| `info` | `#4169E1` | Info = brand-500 |
| `info-subtle` | `#EEF2FC` | Info banners |

---

## Borders & focus

| Token | Hex | Usage |
|-------|-----|--------|
| `border` | `#E2E8F0` | Default dividers, card borders |
| `border-strong` | `#CBD5E1` | Input borders |
| `border-brand` | `#B3C9F5` | Brand-tinted borders (hero card) |
| `focus-ring` | `#4169E1` | Focus visible (brand-500) |
| `focus-ring-offset` | `#FFFFFF` | Ring offset on light UI |

---

## Shadows

| Token | Value | Usage |
|-------|-------|--------|
| `shadow-sm` | `0 1px 2px rgb(12 20 40 / 0.05)` | Buttons |
| `shadow-md` | `0 4px 12px rgb(12 20 40 / 0.08)` | Cards |
| `shadow-hero` | `0 24px 48px rgb(12 20 40 / 0.12), 0 8px 16px rgb(65 105 225 / 0.08)` | Hero preview card (Bobbin-style float) |
| `shadow-lg` | `0 12px 32px rgb(12 20 40 / 0.10)` | Modals |

---

## Hero section recipe

Inspired by [Bobbin's hero](https://withbobbin.com/):

```
Background:  linear-gradient(180deg, surface-hero → surface-hero-end)
Eyebrow:     brand-600, uppercase tracking-wide, text-sm
Headline:    ink-heading, text-4xl–6xl, font-semibold
Subcopy:     ink-muted, text-lg, max-w-2xl
Primary CTA: bg brand-600, text ink-inverse, hover brand-700
Secondary:   border border-strong, text ink, hover surface-muted
Preview card: surface-elevated, border border-brand, shadow-hero, rounded-2xl
```

### Tailwind examples (after tokens are loaded)

```html
<section class="bg-hero-gradient px-4 py-20">
  <p class="text-brand-600 text-sm font-medium uppercase tracking-wider">Welcome</p>
  <h1 class="text-ink-heading mt-3 text-5xl font-semibold tracking-tight">…</h1>
  <p class="text-ink-muted mt-4 max-w-2xl text-lg">…</p>
  <div class="mt-8 flex gap-4">
    <a class="bg-brand-600 text-ink-inverse hover:bg-brand-700 rounded-lg px-6 py-3">Primary</a>
    <a class="border-border text-ink hover:bg-surface-muted rounded-lg border px-6 py-3">Secondary</a>
  </div>
</section>
```

---

## CSS variables

Defined in `src/tokens.css`:

```css
--color-brand-500: #4169E1;
--color-surface-hero: #EEF2FC;
--color-ink-heading: #0C1428;
/* …see tokens.css for full list */
```

---

## Accessibility

- **Body text:** `ink` on `surface` → contrast ~16:1 (AAA).
- **Muted text:** `ink-muted` on `surface` → ~7:1 (AA).
- **Primary button:** `ink-inverse` on `brand-600` → ~4.9:1 (AA large text / UI).
- **Links:** prefer `brand-700` on light backgrounds for AA; underline on hover.
- Never use `brand-400` or lighter for small text on white.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-07-29 | Initial palette — royal blue brand, Bobbin-inspired hero tokens |
