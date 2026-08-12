# Color Palette

**Primary:** deep navy `#0C1428` (footer, dark sections) — use `bg-primary` / `--color-primary`.  
**Accent:** royal blue `#4169E1` (CTAs, interactive fills) — use `bg-accent-500` / `--color-accent-*`.  
**Gold:** warm highlight (sparingly) — `--color-gold-*`.

Design reference: [Bobbin](https://withbobbin.com/). Map tokens in `src/tokens.css`; consume via Tailwind (`@theme`) or CSS variables.

---

## Design intent

| Role | Token | Hex | Usage |
|------|-------|-----|--------|
| Primary | `primary` | `#0C1428` | Footer, board page, dark section backgrounds |
| Accent | `accent-500` | `#4169E1` | CTA / button fills, interactive highlights |
| Accent hover | `accent-600` | `#3454B4` | Button hover |
| Gold | `gold-500` | `#F59E0B` | Optional warm badges / seasonal |

The `brand-*` scale remains as a full royal-blue ramp for migration; prefer `primary` / `accent-*` in new UI.

---

## Neutrals — Ink & Surface

Cool grays aligned with blue undertones.

### Ink (text)

| Token | Hex | Usage |
|-------|-----|--------|
| `ink` | `#0F172A` | Primary body on light surfaces |
| `ink-heading` | `#0C1428` | H1–H3 on light backgrounds |
| `ink-muted` | `#475569` | Subcopy, descriptions |
| `ink-subtle` | `#64748B` | Captions, meta, placeholders |
| `ink-inverse` | `#F8FAFC` | Text on dark / accent fills |

### Surface (backgrounds)

| Token | Hex | Usage |
|-------|-----|--------|
| `surface` | `#FFFFFF` | Cards, modals, nav bar |
| `surface-subtle` | `#F8FAFC` | Light page background |
| `surface-muted` | `#F1F5F9` | Trust strip, table headers |
| `surface-hero` | `#EEF2FC` | Soft hero wash |
| `surface-elevated` | `#FFFFFF` | Elevated cards |

---

## Brand ramp (legacy / migration)

| Token | Hex |
|-------|-----|
| `brand-50` … `brand-950` | Same values as before; `brand-950` ≡ `primary`, `brand-500` ≡ `accent-500` |

---

## Accessibility notes

- Prefer `accent-600`+ for text on white; `accent-500` is fine for large solid CTAs with white label.
- On `primary` backgrounds, use `text-on-hero` / `text-on-hero-muted`.
