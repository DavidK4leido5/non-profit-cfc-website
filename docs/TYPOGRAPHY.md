# Typography

Reference: [Normal is Boring](https://normalisboring.es/) — editorial real-estate aesthetic with stacked display headlines, serif body copy, and restrained sans labels.

## Source site (Normal is Boring)

Fonts are self-hosted commercial typefaces:

| Role | Font | Weights used | CSS variable |
|------|------|--------------|--------------|
| Display / hero | **Editorial New** | Ultralight, Regular, Ultralight Italic | `--f-edit`, `--f-edit-regular`, `--f-edit-italic` |
| Body / paragraphs | **Juana** | Light, Regular, Medium | `--f-light`, `--f-regular`, `--f-medium` |
| UI / labels | **Izmir** | Regular | `--f-izmir` |

Global settings from their theme:

- `font-kerning: none`
- `-webkit-font-smoothing: antialiased`
- Tight display line-heights (`0.85`–`0.9`)
- Negative letter-spacing on large type (`≈ -0.08rem` at desktop scale)

### Type scale (desktop)

| Token | Size | Line height | Typical use |
|-------|------|-------------|-------------|
| `--supertitulo-xl` | 12rem | 10.5rem | Full-bleed stacked hero lines |
| `--supertitulo-l` | 9.5rem | 9.5rem | Large hero |
| `--supertitulo` | 6.5rem | 6.5rem | Section hero |
| `--titulo-xxl` | 3.5rem | 3.5rem | Page titles |
| `--titulo-xl` | 3rem | 3.5rem | Section titles |
| `--titulo-l` | 2.25rem | 2.7rem | Subsections |
| `--titulo` | 1.65rem | 2.2rem | Card titles |
| `--parrafo-xl` | 1.4rem | 1.85rem | Lead paragraphs |
| `--parrafo-l` | 1rem | 1.4rem | Body large |
| `--parrafo` | 0.85rem | 1.15rem | Body |
| `--subtitulo` | 0.7rem | 0.9rem | Eyebrows, meta |

Responsive breakpoints rescale these down on tablet/mobile (see their `main.css`).

## Our implementation (site-wide)

We do **not** hotlink or ship Normal is Boring’s font files (commercial licenses). We use Google Fonts with a documented mapping, applied on `:root` / `body` / headings:

| Reference | Our font | Token / class |
|-----------|----------|---------------|
| Editorial New Ultralight | **Cormorant Garamond** 300 | `--font-display`, `.font-display`, `h1–h4` |
| Juana Regular | **Lora** 400 | `--font-body`, `.font-body`, `body` |
| Izmir Regular | **DM Sans** 500–700 | `--font-ui`, `.font-ui`, buttons/inputs/nav |

Loaded in `apps/web/index.html`:

```html
Cormorant Garamond (300, 400) + Lora (400, 500) + DM Sans (500, 600, 700)
```

### Board-specific styles (`packages/ui/src/tokens.css`)

- **Display titles** — weight 300, line-height 0.9–0.92, letter-spacing -0.04em to -0.045em
- **Body copy** — Lora, relaxed line-height (~1.45–1.55)
- **UI labels** — DM Sans, uppercase eyebrows with wide tracking (`0.22em`)

### Upgrading to licensed fonts

If you purchase Editorial New, Juana, and Izmir:

1. Add `.woff2` files under `apps/web/public/fonts/`
2. Declare `@font-face` rules mirroring their theme
3. Swap `--font-display` / `--font-body` / `--font-ui` in `tokens.css`

No component changes required — only CSS tokens and font files.
