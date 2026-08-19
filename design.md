# Grace Community Church — Website Design System

> A warm, trustworthy, modern church website design. Feed this document to an LLM/design tool as the single source of truth for building the site. Follow it exactly — colors, type scale, spacing, and component patterns are all specified so the output matches the reference design.

---

## 1. Design Philosophy

- **Mood**: Warm, welcoming, credible, modern-traditional. Navy conveys trust and stability; gold conveys warmth, warmth of faith, and celebration.
- **Feel**: Clean whitespace, soft photography with warm golden-hour tones, generous padding, rounded-but-restrained corners, subtle shadows.
- **Approach**: **Mobile-first, fully fluid/responsive.** Design and build for the smallest screen first, then progressively enhance for larger breakpoints. No fixed pixel layouts — use fluid type, fluid spacing, and flexible grids so the design adapts smoothly to *any* viewport width, not just fixed breakpoints.

---

## 2. Color Palette

Use these as CSS custom properties (design tokens). Names in parentheses describe the role.

```css
:root {
  /* Primary */
  --color-navy-900: #0B1E3D;   /* Primary brand navy — header bar, footer, dark sections, headings */
  --color-navy-800: #10264A;   /* Slightly lighter navy for gradients/hover states */
  --color-navy-700: #16305C;   /* Card/section variant */

  /* Accent */
  --color-gold-500: #C9A227;   /* Primary accent — logo cross, CTAs, highlighted text, icons */
  --color-gold-600: #B08B1C;   /* Gold hover/active state */
  --color-gold-100: #F7EFD8;   /* Soft gold tint for badges/backgrounds */

  /* Neutrals */
  --color-white: #FFFFFF;
  --color-bg-light: #F7F7F5;   /* Section background alternate (off-white/warm gray) */
  --color-bg-muted: #F2F0EA;   /* Card backgrounds, subtle panels */
  --color-border: #E6E4DD;     /* Hairline borders, dividers */

  /* Text */
  --color-text-heading: #101828;  /* Near-black navy for headings */
  --color-text-body: #5B6472;     /* Body copy gray */
  --color-text-muted: #8B93A1;    /* Captions, meta text, timestamps */
  --color-text-on-dark: #FFFFFF;
  --color-text-on-dark-muted: #B9C2D0;

  /* Utility */
  --color-success: #2F7D5E;
  --color-overlay-dark: rgba(11, 30, 61, 0.55); /* Navy overlay on hero image */
}
```

**Usage rules:**
- Navy (`--color-navy-900`) is the anchor color: top utility bar, footer, dark CTA banners ("Your Generosity Changes Lives"), stat bands, buttons.
- Gold (`--color-gold-500`) is used **sparingly** as an accent: small eyebrow labels ("WELCOME HOME", "ABOUT US", "OUR MINISTRIES"), the logo cross icon, underline accents, icon strokes, one hero headline word for emphasis, and secondary buttons/outlines.
- Never use gold for large background fills — it stays as accents, text, icons, and thin CTA buttons.
- Body backgrounds alternate between `--color-white` and `--color-bg-light` to separate sections without hard borders.
- Photography should always carry warm, golden-hour tones (sunset/sunrise church photography, warm skin tones) to reinforce the gold accent.

---

## 3. Typography

Two-font pairing: a confident serif for headings (traditional, trustworthy) + a clean sans-serif for UI/body text (modern, readable).

```css
:root {
  --font-heading: "Playfair Display", "Georgia", serif;
  --font-body: "Inter", "Helvetica Neue", Arial, sans-serif;
}
```

### Fluid type scale
Use `clamp()` for every text size so type scales smoothly across all viewport widths instead of jumping at fixed breakpoints. Formula pattern: `clamp(min, preferred-vw, max)`.

```css
:root {
  --text-xs:   clamp(0.75rem, 0.7rem + 0.2vw, 0.8125rem);   /* eyebrow labels, meta */
  --text-sm:   clamp(0.875rem, 0.82rem + 0.25vw, 0.9375rem);/* nav links, small body */
  --text-base: clamp(1rem, 0.95rem + 0.3vw, 1.0625rem);     /* body copy */
  --text-lg:   clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem);   /* card titles, lead text */
  --text-xl:   clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem);    /* section subheads */
  --text-2xl:  clamp(1.75rem, 1.5rem + 1.2vw, 2.25rem);     /* section titles ("Ministries for Every Season of Life") */
  --text-3xl:  clamp(2.25rem, 1.8rem + 2vw, 3rem);          /* stat numbers, secondary hero */
  --text-hero: clamp(2.5rem, 2rem + 3.5vw, 4.25rem);        /* hero headline "LOVE GOD. LOVE PEOPLE." */
}
```

### Typographic rules
- **Eyebrow labels** (e.g. "WELCOME HOME", "ABOUT US", "OUR MINISTRIES", "UPCOMING EVENTS"): `--font-body`, `--text-xs`, uppercase, `letter-spacing: 0.12em`, `font-weight: 600`, color `--color-gold-500`.
- **Hero / section headlines**: `--font-heading`, bold, tight `line-height: 1.05–1.15`, uppercase for the hero specifically, color `--color-text-heading` (navy/near-black), with the final emphasis line in `--color-gold-500`.
- **Body copy**: `--font-body`, `--text-base`, `line-height: 1.6–1.7`, color `--color-text-body`, max line-length ~60–70ch for readability.
- **Nav links**: `--font-body`, `--text-sm`, `font-weight: 500`, uppercase optional, active link underlined in gold.
- **Buttons**: `--font-body`, `--text-sm`, `font-weight: 600`, letter-spacing `0.02em`.
- All font sizes must use the fluid `clamp()` tokens above — never hardcode fixed `px`/`rem` values that don't scale.

---

## 4. Layout & Grid — Mobile-First & Fully Fluid

**Core rule: design the single-column mobile layout first, then use fluid/flexible techniques (`clamp()`, `%`, `fr`, `minmax()`, `auto-fit`/`auto-fill`) so the layout adapts continuously — not just at fixed breakpoints.**

### Container
```css
.container {
  width: min(100% - 2rem, 1280px); /* fluid gutter that scales, capped max-width */
  margin-inline: auto;
}
```

### Fluid spacing scale
```css
:root {
  --space-xs:  clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-sm:  clamp(0.75rem, 0.6rem + 0.75vw, 1.25rem);
  --space-md:  clamp(1.25rem, 1rem + 1.25vw, 2rem);
  --space-lg:  clamp(2rem, 1.5rem + 2vw, 3.5rem);
  --space-xl:  clamp(3rem, 2rem + 4vw, 6rem);      /* section vertical padding */
  --space-2xl: clamp(4rem, 2.5rem + 6vw, 8rem);
}
```
Apply `--space-xl` as the default top/bottom padding for full sections, `--space-lg` between sub-blocks, `--space-md`/`--space-sm` for card internal padding and gaps.

### Grid strategy (no fixed breakpoints where avoidable)
- Use CSS Grid with `repeat(auto-fit, minmax(Xrem, 1fr))` for card rows (ministries, stats, testimonials) so columns reflow automatically from 1 → 2 → 3+ across any screen width without hard-coded breakpoints.
  ```css
  .ministries-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    gap: var(--space-md);
  }
  ```
- Use Flexbox with `flex-wrap: wrap` for nav bars, button groups, footer columns, and icon+label rows.
- Only use explicit `@media` breakpoints as a **fallback** for structural changes CSS alone can't fluidly handle (e.g., collapsing nav into a hamburger menu, stacking a two-column hero into one column). Suggested reference breakpoints:
  - `< 640px` — mobile (base styles, single column, hamburger nav)
  - `640–1023px` — tablet (2-column grids begin, nav may still collapse)
  - `≥ 1024px` — desktop (full multi-column layouts, expanded nav)
- Images always `width: 100%; height: auto;` with `object-fit: cover` inside fixed-aspect-ratio containers (`aspect-ratio: 16/9`, `4/3`, or `1/1` depending on placement) so photos never distort at any width.
- Never use fixed `px` widths on layout containers or grid items — use `%`, `fr`, `min()`, `max()`, `clamp()`, and `minmax()` throughout.

---

## 5. Site Structure (Sections, top to bottom)

1. **Top utility bar** — dark navy, thin strip. Left: address with pin icon. Center: phone number with phone icon. Right: service times with clock icon + social icons (Facebook, Instagram, YouTube). Hidden or condensed to icons-only on mobile.
2. **Main header/nav** — white background. Left: logo (gold cross mark + "GRACE / COMMUNITY CHURCH" wordmark, navy text). Center/right: nav links (Home, About Us, Ministries [dropdown], Sermons, Events, Give, Contact Us). Far right: solid navy "Plan Your Visit" button. Collapses to a hamburger menu on mobile with a slide-in/drawer panel.
3. **Hero section** — full-width warm sunset photo of a church exterior with a subtle navy gradient overlay on the left side for text legibility. Content: gold eyebrow ("WELCOME HOME"), large serif uppercase headline across 3 lines with the last line in gold ("LOVE GOD. / LOVE PEOPLE. / MAKE A DIFFERENCE."), short supporting paragraph, two CTA buttons (solid navy "Plan Your Visit", outline "▶ Watch Welcome Video"), and a row of 3 small icon+label value props below (Worship, Grow, Serve) each with a thin gold icon.
4. **About / "A Place to Belong" section** — two-column on desktop (image left, text right), stacked on mobile. Rounded-corner interior photo of a worship service. Right column: gold eyebrow ("ABOUT US"), serif heading, paragraph, a checklist (gold checkmark icons) of 5 short benefits, and a navy "Learn More About Us" button.
5. **Ministries grid** — centered gold eyebrow ("OUR MINISTRIES") + serif section title. A responsive auto-fit grid of 6 cards (Kids, Youth, Young Adults, Men, Women, Outreach), each: circular gold-tinted icon at top, bold title, one-line description, gold "Learn More →" text link. Cards sit on white with soft shadow, subtle hover lift.
6. **Events + Give split section** — two-column (stacks on mobile). Left: white card, gold eyebrow ("UPCOMING EVENTS"), a list of 3 events each with a navy date-badge (month abbreviation + day), title, date/time line, short description, chevron link; "View All Events →" link at bottom. Right: full-bleed navy-overlaid photo card ("hands forming a heart" sunset image), gold eyebrow ("GIVE"), serif heading "Your Generosity Changes Lives", short paragraph, solid gold "♥ Give Online" button.
7. **Stats band** — full-width solid navy strip, 4 columns (stacks to 2x2 then 1-column on smaller screens), each with a gold icon, large bold number (e.g. "1,200+"), and small label underneath, all centered.
8. **Testimonials** — centered gold eyebrow ("WHAT PEOPLE ARE SAYING") + serif heading ("Real People. Real Stories."). 3-column auto-fit grid of quote cards: large gold quotation mark, italic/regular quote text, circular avatar photo + name + location. Carousel dots below on mobile.
9. **CTA banner** — gold/amber solid background strip, small church icon, bold heading "We'd love to meet you!", subtext, and a navy "Plan Your Visit" button on the right (stacks centered on mobile).
10. **Footer** — solid navy, 4-column layout (stacks to 1 column on mobile): Column 1 — logo + tagline + social icons; Column 2 — Quick Links; Column 3 — Ministries links; Column 4 — Contact Us (address, phone, email, service times, each with a small gold icon). Bottom bar: copyright left, Privacy Policy / Terms of Use links right, separated by a thin translucent border-top.

---

## 6. Components

### Buttons
```css
.btn-primary {
  background: var(--color-navy-900);
  color: var(--color-white);
  padding: clamp(0.75rem, 0.6rem + 0.5vw, 1rem) clamp(1.5rem, 1.2rem + 1vw, 2rem);
  border-radius: 6px;
  font-weight: 600;
  transition: background 0.2s ease, transform 0.15s ease;
}
.btn-primary:hover { background: var(--color-navy-800); transform: translateY(-1px); }

.btn-outline {
  background: transparent;
  color: var(--color-white); /* or navy, depending on surface */
  border: 1.5px solid currentColor;
  padding: same as above;
  border-radius: 6px;
}

.btn-gold {
  background: var(--color-gold-500);
  color: var(--color-navy-900);
  border-radius: 6px;
  font-weight: 700;
}
.btn-gold:hover { background: var(--color-gold-600); }
```
All buttons: pill-ish rounded corners (6–8px, not fully pilled), icon-left when paired with an icon (e.g. play icon, heart icon), comfortable fluid padding via `clamp()`, subtle hover lift + shadow.

### Cards
- White or `--color-bg-muted` background, `border-radius: 12px`, `box-shadow: 0 4px 20px rgba(11,30,61,0.06)`, hover state raises shadow + slight `translateY(-4px)`.
- Icon cards (ministries): centered content, circular icon container (~64px, fluid via `clamp()`) with `--color-gold-100` background and `--color-gold-500` icon stroke.

### Icons
- Thin-line/outline style icons (not filled), consistent 1.5–2px stroke weight.
- Default icon color: gold on light backgrounds, white on navy backgrounds.
- Use for: location pin, phone, clock, social (Facebook/Instagram/YouTube), checkmarks, calendar/date badges, worship/grow/serve symbols, heart, globe (outreach), quote marks.

### Badges / Date blocks
- Small navy rounded-square block, gold or white month abbreviation on top row, larger white day number below (e.g. "MAY / 19").

### Forms / Inputs (for contact, give, newsletter if needed)
```css
input, textarea, select {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: var(--space-sm);
  font-size: var(--text-base);
  background: var(--color-white);
}
input:focus { outline: none; border-color: var(--color-gold-500); box-shadow: 0 0 0 3px var(--color-gold-100); }
```

---

## 7. Imagery Style

- Warm, golden-hour / sunset-toned photography throughout (church exteriors at dusk, congregation in warm light, hands forming a heart against a sunset).
- Photos of people: candid, diverse, warm expressions, natural light.
- Interior shots (worship service): slightly moody/warm with visible stage lighting and a cross silhouette or screen.
- All hero/banner images use a navy gradient overlay (`--color-overlay-dark`) on the side where text sits, to guarantee contrast at every screen size.
- Avatar photos: circular crop, consistent size, soft shadow.

---

## 8. Motion & Interaction

- Subtle only: fade/slide-up on scroll for section content (200–400ms ease-out).
- Buttons/cards: hover lift (`translateY(-2px to -4px)`) + shadow increase, 150–200ms ease.
- Nav underline/gold accent slides in under active/hovered link.
- Mobile menu: slide-in drawer from right or top-down accordion, 250ms ease.
- Testimonial/stat sections may include a simple horizontal scroll-snap carousel on narrow viewports.

---

## 9. Accessibility & Responsiveness Checklist

- Maintain WCAG AA contrast: navy-on-white and white-on-navy pass easily; verify gold text (`#C9A227`) always sits on white/navy/dark-overlay backgrounds, never on light-gray backgrounds where contrast could fail — use `--color-gold-600` or add a dark text shadow if needed for small gold text.
- All interactive elements have visible focus states (gold outline ring).
- Nav collapses to an accessible hamburger + drawer with proper `aria-expanded`/`aria-controls` below the tablet breakpoint.
- Touch targets ≥ 44×44px on mobile.
- Use fluid `clamp()` units for **all** font-sizes, spacing, and icon sizes — the layout should look intentional and correctly proportioned at 320px, 768px, 1024px, 1440px, and 1920px+ without any awkward in-between states.
- Test grid reflow with `auto-fit`/`minmax()` so card grids degrade gracefully (3 → 2 → 1 columns) purely from available space, not just at breakpoint jumps.
- Images use `srcset`/responsive sizing and lazy loading below the fold.

---

## 10. Summary Token Reference (quick copy-paste)

```css
:root {
  /* Colors */
  --color-navy-900:#0B1E3D; --color-navy-800:#10264A; --color-navy-700:#16305C;
  --color-gold-500:#C9A227; --color-gold-600:#B08B1C; --color-gold-100:#F7EFD8;
  --color-white:#FFFFFF; --color-bg-light:#F7F7F5; --color-bg-muted:#F2F0EA; --color-border:#E6E4DD;
  --color-text-heading:#101828; --color-text-body:#5B6472; --color-text-muted:#8B93A1;
  --color-text-on-dark:#FFFFFF; --color-text-on-dark-muted:#B9C2D0;
  --color-overlay-dark: rgba(11,30,61,0.55);

  /* Fonts */
  --font-heading:"Playfair Display", Georgia, serif;
  --font-body:"Inter", Helvetica, Arial, sans-serif;

  /* Fluid type */
  --text-xs:clamp(.75rem,.7rem + .2vw,.8125rem);
  --text-sm:clamp(.875rem,.82rem + .25vw,.9375rem);
  --text-base:clamp(1rem,.95rem + .3vw,1.0625rem);
  --text-lg:clamp(1.125rem,1.05rem + .4vw,1.25rem);
  --text-xl:clamp(1.375rem,1.2rem + .8vw,1.75rem);
  --text-2xl:clamp(1.75rem,1.5rem + 1.2vw,2.25rem);
  --text-3xl:clamp(2.25rem,1.8rem + 2vw,3rem);
  --text-hero:clamp(2.5rem,2rem + 3.5vw,4.25rem);

  /* Fluid spacing */
  --space-xs:clamp(.5rem,.4rem + .5vw,.75rem);
  --space-sm:clamp(.75rem,.6rem + .75vw,1.25rem);
  --space-md:clamp(1.25rem,1rem + 1.25vw,2rem);
  --space-lg:clamp(2rem,1.5rem + 2vw,3.5rem);
  --space-xl:clamp(3rem,2rem + 4vw,6rem);
  --space-2xl:clamp(4rem,2.5rem + 6vw,8rem);
}
```

---

**Build instruction for the receiving LLM:** Implement mobile-first — write base CSS for the smallest screen, then layer fluid scaling via `clamp()`/`min()`/`max()`/`minmax()` and `auto-fit` grids so the design adapts continuously across all screen sizes, using the `@media` breakpoints in Section 4 only for structural shifts (nav collapse, column stacking) that fluid CSS alone cannot express. Match the color palette, typography, spacing, and component styling in this document exactly.
