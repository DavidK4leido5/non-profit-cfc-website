import { For, Show } from "solid-js";
import {
  BookIcon,
  CheckIcon,
  ChurchIcon,
  GlobeIcon,
  HandsIcon,
  HeartIcon,
  QuoteIcon,
  UsersIcon,
} from "../icons/grace-icons";

export type HomeHeroProps = {
  eyebrow: string;
  lines: readonly [string, string, string];
  subcopy: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  background: { src: string; alt: string };
  gathering: { when: string; where: string };
  values: readonly { title: string; icon: "worship" | "grow" | "serve" }[];
};

const valueIcons = {
  worship: HeartIcon,
  grow: BookIcon,
  serve: HandsIcon,
};

function responsivePhoto(src: string) {
  const path = src.split("?")[0];
  return {
    src: `${path}?w=1280&q=75`,
    srcSet: [640, 960, 1280, 1920].map((width) => `${path}?w=${width}&q=75 ${width}w`).join(", "),
  };
}

function avatarPhoto(src: string) {
  const path = src.split("?")[0];
  return {
    src: `${path}?w=96&q=70`,
    srcSet: `${path}?w=96&q=70 96w, ${path}?w=192&q=70 192w`,
  };
}

export function HomeHero(props: HomeHeroProps) {
  const photo = () => responsivePhoto(props.background.src);
  return (
    <section class="hero-stage">
      <img
        src={photo().src}
        srcSet={photo().srcSet}
        sizes="100vw"
        alt={props.background.alt}
        class="absolute inset-0 h-full w-full object-cover"
        width="1920"
        height="1080"
        fetchpriority={"high" as const}
      />
      <div class="hero-overlay absolute inset-0" />
      <div class="container hero-copy">
        <div class="hero-lead">
          <p class="type-item-title tracking-[0.01em] text-white">
            {props.gathering.when} · {props.gathering.where}
          </p>
          <p class="eyebrow eyebrow-on-dark">
            {props.eyebrow}
          </p>
          <h1 class="type-hero max-w-5xl text-white">
            {props.lines[0]}
            <br />
            {props.lines[1]}
            <br />
            <span class="text-[var(--color-gold-100)]">{props.lines[2]}</span>
          </h1>
        </div>
        <p class="type-lede-on-dark max-w-[36rem] text-white">
          {props.subcopy}
        </p>
        <div class="hero-actions">
          <a class="btn-primary" href={props.primaryCta.href}>
            {props.primaryCta.label}
          </a>
          <a class="btn-outline" href={props.secondaryCta.href}>
            {props.secondaryCta.label}
          </a>
        </div>
        <ul class="hero-values">
          <For each={props.values}>
            {(item) => {
              const Icon = valueIcons[item.icon];
              return (
                <li class="type-label-on-dark flex items-center gap-2 font-medium text-white">
                  <span class="text-[var(--color-gold-100)]">
                    <Icon class="h-5 w-5" />
                  </span>
                  {item.title}
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </section>
  );
}

export function AboutBelongSection(props: {
  eyebrow: string;
  title: string;
  body: string;
  benefits: readonly string[];
  cta: { label: string; href: string };
  image: { src: string; alt: string };
}) {
  return (
    <section id="about" class="grace-section bg-white">
      <div class="container grid min-w-0 items-center gap-[var(--space-xl)] lg:grid-cols-2">
        <div class="aspect-[4/3] overflow-hidden rounded-xl">
          <img
            src={responsivePhoto(props.image.src).src}
            srcSet={responsivePhoto(props.image.src).srcSet}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt={props.image.alt}
            class="h-full w-full object-cover"
            loading="lazy"
            width="1200"
            height="900"
          />
        </div>
        <div class="stack-sm">
          <div class="section-head">
            <p class="eyebrow">{props.eyebrow}</p>
            <h2 class="type-section text-[var(--color-text-heading)]">
              {props.title}
            </h2>
          </div>
          <p class="type-body text-[var(--color-text-body)]">
            {props.body}
          </p>
          <ul class="stack-xs">
            <For each={props.benefits}>
              {(item) => (
                <li class="type-list flex min-w-0 items-start gap-2.5 text-[var(--color-text-body)]">
                  <span class="mt-0.5 shrink-0 text-[var(--color-gold-600)]" aria-hidden="true">
                    <CheckIcon class="h-5 w-5" />
                  </span>
                  <span class="min-w-0 break-long">{item}</span>
                </li>
              )}
            </For>
          </ul>
          <a class="btn-primary mt-[var(--space-xs)] w-full sm:w-fit" href={props.cta.href}>
            {props.cta.label}
          </a>
        </div>
      </div>
    </section>
  );
}

export function MinistriesIconGrid(props: {
  eyebrow: string;
  title: string;
  items: readonly {
    title: string;
    description: string;
    href: string;
    icon: "kids" | "youth" | "adults" | "men" | "women" | "outreach";
  }[];
}) {
  const iconFor = (key: string) => {
    if (key === "outreach") return GlobeIcon;
    if (key === "kids") return UsersIcon;
    if (key === "youth") return BookIcon;
    if (key === "adults") return ChurchIcon;
    if (key === "women") return HeartIcon;
    return HandsIcon;
  };

  const iconTone: Record<string, string> = {
    kids: "bg-[#F7EFD8] text-[#9A7614]",
    youth: "bg-[#FDE8D8] text-[#C45C26]",
    adults: "bg-[#E4EEF5] text-[#2A5A7A]",
    men: "bg-[#E8E4F0] text-[#4A3D73]",
    women: "bg-[#F8E4EA] text-[#A33D5C]",
    outreach: "bg-[#E4F0E8] text-[#2F7D5E]",
  };

  return (
    <section id="ministries" class="grace-section bg-[var(--color-bg-light)]">
      <div class="container">
        <div class="section-head section-head-center">
          <p class="eyebrow">{props.eyebrow}</p>
          <h2 class="type-section text-[var(--color-text-heading)]">
            {props.title}
          </h2>
        </div>
        <ul class="ministries-grid mt-[var(--space-lg)]">
          <For each={props.items}>
            {(item) => {
              const Icon = iconFor(item.icon);
              return (
                <li class="grace-card flex flex-col gap-[var(--space-sm)] p-[var(--space-md)] text-center">
                  <span class={`icon-bubble mx-auto ${iconTone[item.icon] ?? "bg-[var(--color-gold-100)] text-[var(--color-gold-600)]"}`}>
                    <Icon class="h-7 w-7" />
                  </span>
                  <h3 class="type-ui-title text-[var(--color-text-heading)]">
                    {item.title}
                  </h3>
                  <p class="type-caption text-[var(--color-text-body)]">
                    {item.description}
                  </p>
                  <a
                    class="type-nav mt-auto inline-flex min-h-11 items-center justify-center font-semibold text-[var(--color-navy-900)] underline decoration-[var(--color-gold-600)] underline-offset-4"
                    href={item.href}
                  >
                    Learn More →
                  </a>
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </section>
  );
}

export function EventsGiveSection(props: {
  eventsEyebrow: string;
  eventsTitle: string;
  eventsCta: { label: string; href: string };
  events: readonly {
    month: string;
    day: string;
    title: string;
    when: string;
    description: string;
    href: string;
  }[];
  give: {
    eyebrow: string;
    title: string;
    body: string;
    cta: { label: string; href: string };
    image: { src: string; alt: string };
  };
}) {
  return (
    <section id="events" class="grace-section bg-white">
      <div class="container grid min-w-0 items-stretch gap-[var(--space-lg)] lg:grid-cols-2">
        <div class="grace-card flex flex-col p-[var(--space-md)]">
          <div class="section-head">
            <p class="eyebrow">{props.eventsEyebrow}</p>
            <h2 class="type-section text-[var(--color-text-heading)]">
              {props.eventsTitle}
            </h2>
          </div>
          <Show
            when={props.events.length > 0}
            fallback={
              <p class="type-body mt-5 text-[var(--color-text-body)]">
                Dated gatherings on this page have passed. See the ministry board for what is actually coming up.
              </p>
            }
          >
            <ul class="mt-[var(--space-md)] flex flex-1 flex-col gap-[var(--space-sm)]">
              <For each={props.events}>
                {(event) => (
                  <li>
                    <a class="flex min-h-11 gap-[var(--space-sm)] rounded-lg p-1 hover:bg-[var(--color-bg-muted)]" href={event.href}>
                      <span class="date-badge shrink-0">
                        <span class="date-badge-month">{event.month}</span>
                        <span class="date-badge-day">{event.day}</span>
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="type-item-title text-[var(--color-text-heading)]">{event.title}</span>
                        <span class="type-meta mt-0.5 block text-[var(--color-text-body)]">
                          {event.when}
                        </span>
                        <span class="type-caption mt-1 block text-[var(--color-text-body)]">
                          {event.description}
                        </span>
                      </span>
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </Show>
          <a
            class="type-nav mt-auto pt-[var(--space-md)] inline-flex min-h-11 items-center font-semibold text-[var(--color-navy-900)] underline decoration-[var(--color-gold-600)] underline-offset-4"
            href={props.eventsCta.href}
          >
            {props.eventsCta.label}
          </a>
        </div>

        <div id="give" class="relative isolate min-h-[22rem] overflow-hidden rounded-xl md:min-h-0">
          <img
            src={responsivePhoto(props.give.image.src).src}
            srcSet={responsivePhoto(props.give.image.src).srcSet}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt={props.give.image.alt}
            class="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            width="1200"
            height="800"
          />
          <div class="absolute inset-0 bg-[var(--color-overlay-dark)]" />
          <div class="relative z-10 flex h-full flex-col justify-end gap-[var(--space-sm)] p-[var(--space-md)]">
            <div class="section-head">
              <p class="eyebrow eyebrow-on-dark">{props.give.eyebrow}</p>
              <h2 class="type-section text-white">
                {props.give.title}
              </h2>
            </div>
            <p class="type-body-on-dark max-w-[42ch] text-white">
              {props.give.body}
            </p>
            <a class="btn-gold w-full sm:w-fit" href={props.give.cta.href}>
              <HeartIcon class="h-4 w-4" />
              {props.give.cta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const statIcons = [UsersIcon, ChurchIcon, HandsIcon, BookIcon];

export function StatsBand(props: {
  items: readonly { value: string; label: string }[];
}) {
  return (
    <section class="bg-[var(--color-navy-900)] py-[var(--space-md)]">
      <ul class="stats-row container">
        <For each={props.items}>
          {(item, index) => {
            const Icon = statIcons[index() % statIcons.length];
            return (
                <li class="flex w-full flex-col items-center gap-2 py-2 text-center lg:flex-row lg:justify-start lg:gap-[var(--space-sm)] lg:py-1 lg:text-left">
                  <Icon class="h-7 w-7 shrink-0 text-[var(--color-gold-100)]" />
                  <div class="w-full lg:w-auto">
                    <p class="type-stat text-white">{item.value}</p>
                    <p class="type-label-on-dark mt-1 text-white">{item.label}</p>
                  </div>
                </li>
            );
          }}
        </For>
      </ul>
    </section>
  );
}

export function TestimonialsSection(props: {
  eyebrow: string;
  title: string;
  items: readonly {
    quote: string;
    name: string;
    location: string;
    avatar: { src: string; alt: string };
  }[];
}) {
  return (
    <section id="stories" class="grace-section bg-[var(--color-bg-light)]">
      <div class="container">
        <div class="section-head section-head-center">
          <p class="eyebrow">{props.eyebrow}</p>
          <h2 class="type-section text-[var(--color-text-heading)]">
            {props.title}
          </h2>
        </div>
        <ul class="quotes-grid mt-[var(--space-lg)]">
          <For each={props.items}>
            {(item) => (
              <li class="grace-card flex snap-start flex-col gap-[var(--space-sm)] p-[var(--space-md)]">
                <QuoteIcon class="h-8 w-8 text-[var(--color-gold-600)]" />
                <p class="type-quote text-[var(--color-text-heading)]">
                  “{item.quote}”
                </p>
                <div class="mt-auto flex items-center gap-[var(--space-sm)]">
                  <img
                    src={avatarPhoto(item.avatar.src).src}
                    srcSet={avatarPhoto(item.avatar.src).srcSet}
                    sizes="48px"
                    alt={item.avatar.alt}
                    class="h-12 w-12 rounded-full object-cover shadow"
                    loading="lazy"
                    width="96"
                    height="96"
                  />
                  <div>
                    <p class="type-item-title text-[var(--color-text-heading)]">{item.name}</p>
                    <p class="type-meta text-[var(--color-text-body)]">{item.location}</p>
                  </div>
                </div>
              </li>
            )}
          </For>
        </ul>
      </div>
    </section>
  );
}

export function VisitPlan(props: {
  title: string;
  subtitle: string;
  when: string;
  where: string;
  email: string;
  notes: readonly string[];
  cta: { label: string; href: string };
}) {
  return (
    <section id="visit" class="bg-[var(--color-gold-500)] py-[var(--space-xl)]">
      <div class="container">
        <div class="mb-[var(--space-lg)] flex flex-col items-stretch gap-[var(--space-sm)] text-left lg:flex-row lg:items-center">
          <ChurchIcon class="h-10 w-10 shrink-0 text-[var(--color-navy-900)]" />
          <div class="section-head min-w-0 flex-1">
            <h2 class="type-section text-[var(--color-navy-900)]">
              {props.title}
            </h2>
            <p class="type-body text-[var(--color-navy-800)]">{props.subtitle}</p>
          </div>
          <a class="btn-primary w-full shrink-0 lg:w-auto" href={props.cta.href}>
            {props.cta.label}
          </a>
        </div>
        <div class="visit-packet grid min-w-0 gap-[var(--space-lg)] rounded-xl bg-[var(--color-navy-900)] p-[var(--space-md)] sm:p-[var(--space-lg)] lg:grid-cols-2">
          <dl class="stack-sm min-w-0 text-white">
            <div class="min-w-0">
              <dt class="type-label-on-dark font-semibold text-[var(--color-gold-100)]">When</dt>
              <dd class="type-ui-title mt-0.5 text-white">{props.when}</dd>
            </div>
            <div class="min-w-0">
              <dt class="type-label-on-dark font-semibold text-[var(--color-gold-100)]">Where</dt>
              <dd class="type-ui-title mt-0.5 break-long text-white">{props.where}</dd>
            </div>
            <div class="min-w-0">
              <dt class="type-label-on-dark font-semibold text-[var(--color-gold-100)]">Write us</dt>
              <dd class="min-w-0">
                <a class="type-caption mt-0.5 block break-long font-semibold text-white underline underline-offset-4" href={`mailto:${props.email}`}>
                  {props.email}
                </a>
              </dd>
            </div>
          </dl>
          <div class="stack-sm min-w-0">
            <h3 class="type-card-title text-white">
              What to expect
            </h3>
            <ul class="stack-sm">
              <For each={props.notes}>
                {(note) => (
                  <li class="type-body-on-dark flex gap-2.5 text-white">
                    <CheckIcon class="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-gold-100)]" />
                    <span class="min-w-0 break-long">{note}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
