---
target: landing page
total_score: 15
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
timestamp: 2026-08-19T08-27-45Z
slug: src-app-pages-landingpage-tsx
---
Method: dual-agent (A: 92e673d1-8fa8-450b-8336-c8681c23bb73 · B: 45ddc6f7-1955-4a2d-b4db-bb7b3523b42c)

Target: `apps/web/src/app/pages/LandingPage.tsx` (live http://localhost:5173)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Hash sections never get `nav-link-active` (pathname-only). Visit “success” is a scroll with no confirmation. |
| 2 | Match System / Real World | 2 | “Sermons” is testimonials. “Watch Welcome Video” has no video. Events dated Apr–Jul still titled upcoming on 19 Aug 2026. |
| 3 | User Control and Freedom | 2 | Esc closes the mobile menu. Plan Your Visit is a closed loop. Event rows go to missing hashes. |
| 4 | Consistency and Standards | 2 | Same CTA copy in three places, no visit artifact. Learn More About Us → `#about` while already in About. Give Online → `#give`. |
| 5 | Error Prevention | 1 | Dummy `tel:+639123456789` looks real. Dead hashes. “Upcoming” dates already past. Privacy/Terms → `#`. |
| 6 | Recognition Rather Than Recall | 3 | Labels are text. Desktop utility + footer repeat time/place. Mobile hides when/where until the footer. |
| 7 | Flexibility and Efficiency | n/a | Persuade landing; no expert-repeat task. |
| 8 | Aesthetic and Minimalist Design | 2 | Six same-weight cards; Sign in competing with visit; gold kickers fail contrast on cream/white. |
| 9 | Error Recovery | 1 | No forms, so no recovery copy. Broken links fail silently. |
| 10 | Help and Documentation | n/a | Persuade; visitor needs a visit packet, not a help center. |
| **Total** | | **15/32** | **Poor (~47%)** |

#### Design Specificity Verdict

**LLM assessment**: Category-interchangeable navy-and-gold church kit with local labels glued on. Unsplash sanctuary, uppercase slogan, icon-grid ministries, stats row, three quote cards, and a gold strip CTA could ship for any evangelical site. What is *this* church (G12 Philippines, cell groups, Negros) lives in one About paragraph and three city names under stock faces. The G12 logo and Win/Consolidate/Disciple/Send block exist in content (`g12Vision`, `g12Logo`) and never render on the landing. Hero overlay reads as a navy wall; golden-hour photography is mostly sacrificed.

**Deterministic scan**: CLI `detect.mjs --json` on HomeLanding, Navbar, SiteFooter, LandingPage, Layout: **0 findings**, exit 0 (static markup cannot see computed contrast). In-page detector: **14 anti-patterns** — `low-contrast` 13, `kicker-above-heading` 6, `overused-font` 1 (Inter 82%), `layout-transition` 1. Detector caught gold `#c9a227` on `#f7f7f5` / `#ffffff` at 2.3–2.4:1 (need 4.5) and body gray `#5b6472` on navy `#0b1e3d` at 2.8:1 — contrast the design review underweighted until overlays. False positives: kicker-above-heading (intentional eyebrows); overused Inter on a marketing page; white-on-white / `#b9c2d0` on cream almost certainly sampled against the wrong parent.

**Visual overlays**: Injection of `detect.js` succeeded in a Playwright tab (`overlay success: true`). The harness has no bring-to-front/present tool, so overlays are **not** guaranteed in your Cursor browser panel. Live server on port 8400 was stopped after the scan.

#### Overall Impression

Competent template execution that fails the Sunday-visit job. Biggest opportunity: turn Plan Your Visit into a real visit packet (place, 10:00 AM, kids, next step) and stop asking for money and scale before that exists.

#### What's Working

1. When gathering time is shown, it is plain: utility bar and footer **Sundays 10:00 AM**, skip link, 44px primary buttons and Open menu.
2. About copy is the only sentence that sounds like CFC: G12 win / consolidate / disciple / send, cell groups, Negros Occidental.
3. Stories name Bacolod, Talisay, Silay instead of “our community.”

#### Priority Issues

**[P0] Plan Your Visit does not plan a visit**
- **Why it matters**: Primary user cannot decide “can I get there this Sunday.” Hero, nav, and `#visit` CtaBanner all `href="#visit"`; after click, still a button. No form, map, parking, kids, or street address (province only).
- **Fix**: Make `#visit` a packet: landmark until street is known, 10:00 AM, what to expect, kids, one form or WhatsApp/email. Stop linking the button to itself.
- **Suggested command**: `/impeccable onboard` the visit CTA / `#visit` section

**[P0] “Upcoming Events” are already past**
- **Why it matters**: Apr 10 / May 3 / Jul 14 on 19 Aug 2026 reads as a parked template. Rows link to missing `#retreat` / `#picnic` / `#youth-camp`.
- **Fix**: Show only future dated items (or an honest empty state); wire rows to `/board` posts that exist.
- **Suggested command**: `/impeccable clarify` events list and dead hashes

**[P1] Nav and hero lie about Sermons / Welcome Video**
- **Why it matters**: Sermons and Watch Welcome Video land on `#sermons` = *Real People. Real Stories.* No player. First-timers feel bait-and-switched.
- **Fix**: Point at a real film or drop the play CTA; rename the quotes block; don’t call it Sermons.
- **Suggested command**: `/impeccable clarify` nav labels and the play CTA

**[P1] Trust leaks presented as live contact, plus gold contrast**
- **Why it matters**: Dummy `tel:+639123456789`, generic social URLs, Unsplash alts as documentary congregation; G12 mark omitted. Detector: gold kickers 2.3–2.4:1 on cream/white; gray-on-navy 2.8:1.
- **Fix**: Label placeholders until real; pass `g12Logo` into footer; don’t documentary-caption Unsplash; use `--color-gold-600` or navy for small gold type on light.
- **Suggested command**: `/impeccable polish` contact chrome, imagery honesty, kicker contrast

**[P2] Ministry Learn More dumps visitors into the wrong product**
- **Why it matters**: Kids/Youth → `/board#youth`; Young Adults/Men/Women → `/resources` (member surface). Competes with come-Sunday.
- **Fix**: One public dest per ministry or in-page copy; keep `/resources` off the landing.
- **Suggested command**: `/impeccable distill` ministry grid destinations

#### Persona Red Flags

**Jordan (First-Timer)**: Clicks Watch Welcome Video, gets quotes. Reads G12 / consolidating with no glossary. Plan Your Visit is a gold strip that does not collect a visit. Sign in looks required.

**Riley (Stress Tester)**: Event hashes fail in place. Give Online self-hash. Learn More About Us self-hash. Privacy/Terms `#`. Stale “this month.”

**Casey (Distracted Mobile)**: Utility bar gone — no 10 AM / province in the first screen. Plan Your Visit mid-hero, not thumb-zone. Hamburger holds the whole IA.

**Liza, first Sunday from Bacolod (project)**: Needs a place, jeep/parking, kids room. Gets province + dummy phone + megachurch slogan. No G12 Philippines mark. Cannot tell this is her city’s church.

#### Minor Observations

- Kids / Youth / Young Adults share UsersIcon; Men / Women share HandsIcon; stats use four ChurchIcons.
- `Layout` never passes `g12Logo`. `LandingPage` never mounts `g12Vision`.
- Hero Worship / Grow / Serve burns first-viewport attention.
- `layout-transition` on width/height (detector); likely card/hover.

#### Questions to Consider

- If success is a body in a seat at 10:00 AM, why does Give sit beside events before visit logistics exist?
- What would the first viewport be if it were a map pin + Sunday clock, not a slogan?
- Is G12 the product, or a buried adjective — and if it is the product, why is the mark off-canvas?
