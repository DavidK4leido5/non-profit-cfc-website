# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a first-time or returning visitor in Negros Occidental (and nearby cities named in copy: Bacolod, Talisay, Silay) deciding whether to come on Sunday. Job: understand who this church is, when and where to gather, and take a next step (Plan Your Visit, watch a welcome video, find a ministry).

Other audiences exist in the same SPA and are not the design priority: signed-in members (ministry board, gated resources) and staff/admins (publish board posts, activities, articles, manage people). Do not optimize public pages for those jobs.

## Product Purpose

Christian Fellowship Church’s public website helps people belong, believe, and become — join worship, community, and growth. Success on the public site is a visitor who feels welcomed enough to come this Sunday (or take Give / Contact / ministry next steps).

## Positioning

This is a G12 Philippines church family: win people to Christ, consolidate new believers, disciple leaders, and send multipliers into the city. Cell groups that feel like family, a clear discipleship path, and ministries for every season of life are the mechanism a generic “welcome home” church site could not truthfully claim.

## Operating Context

- Sunday worship at 10:00 AM in Negros Occidental, Philippines.
- Public landing: hero, about, ministries, events, give, stats, stories, visit CTA, G12 vision, footer.
- Ministry board (`/board`) for announcements; `/resources` for authenticated members; `/auth/*` and `/admin/*` / dashboard for staff.
- Content is edited from `apps/web/src/content/site.content.ts` (and later admin). Shared UI lives in `packages/ui`.
- Local: Vite web on http://localhost:5173; API on :8080; Storybook on :6006.

## Capabilities and Constraints

- SolidJS SPA (`@church/web`) with shared `@church/ui`, Go API, Better Auth/session flows, Cloudinary uploads, Neon Postgres — confirmed by the repo, not by marketing claims.
- Public capabilities: home, about/ministries/sermons/events/give/contact anchors, Plan Your Visit, ministry board, sign-in.
- Member/staff capabilities: resources by role, admin editor for board/articles/activities/assets, branch and user management — present, out of primary-user scope.
- Legal name and voice in live copy: **Christian Fellowship Church** (CFC). Root `DESIGN.md` still titles the system “Grace Community Church”; that name is not the product name.
- Terminology to preserve: G12 vision, cell groups, Plan Your Visit, Love God / Love People / Make a Difference, ministries (Kids, Youth, Young Adults, Men, Women, Outreach).
- Phone shown as `+63 912 345 6789` is placeholder; do not treat it as a real contact number.
- Generic social hrefs (`facebook.com`, `instagram.com`, `youtube.com` with no church page) are not confirmed channels.
- Hero/about/give/testimonial photography from Unsplash, and Unsplash-style avatar faces, are stock — not church photography. Do not present them as documentary proof of this congregation.
- Undecided: exact street address (province-level only), real phone, real social URLs, whether `hello@christianfellowshipchurch.org` is a live inbox.

## Brand Commitments

- Church name: Christian Fellowship Church. Logos in-repo: CFC mark (`apps/web/src/assets/images/cfc-logo.png`) and G12 Philippines (`g12philippines_logo.png`).
- Voice in copy: warm, direct, invitational (“come as you are”, “we’ll save you a seat”), not corporate SaaS.
- G12 affiliation is binding identity, not decoration.

## Evidence on Hand

Treat as real product facts unless listed as placeholder above: church name and G12 affiliation; Negros Occidental; Sundays 10:00 AM; about copy and ministry lineup; events (Spring Retreat, Family Picnic Day, Youth Summer Camp); give copy; stats (1,200+ people, 40+ cell groups, 12 ministries, serving since 1985); named stories (Maria Santos / Bacolod, James Cruz / Talisay, Alyssa Reyes / Silay) as church-approved copy; email in footer.

Do not fabricate additional testimonials, attendance numbers, press, sermons, or pastoral quotes. Do not invent a street address or phone. Do not claim Unsplash images depict this congregation.

Canonical copy and assets: `apps/web/src/content/site.content.ts` and `apps/web/src/assets/images/`.

## Product Principles

1. A stranger should know who we are, when we gather, and how to come — in one pass.
2. G12 discipleship (win, consolidate, disciple, send) is the distinctive; generic church-welcome language is not enough.
3. Public pages serve the visitor; member and admin tools stay secondary and must not compete with “come this Sunday.”
4. Use only confirmed church facts; placeholders (phone, stock faces, generic social URLs) stay labeled until replaced.
5. Preserve CFC naming and G12 marks; do not revive “Grace Community Church” as the product name.
