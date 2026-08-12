import { motion } from "motion-solid";
import { easeOut } from "../motion/presets";
import { GradedImage } from "./GradedImage";

export type HeroFeatureStripProps = {
  quote: {
    text: string;
    portrait: { src: string; alt: string };
  };
  media: {
    src: string;
    alt: string;
    href: string;
    label: string;
  };
  service: {
    title: string;
    detail: string;
    cta: { label: string; href: string };
  };
};

/**
 * Three-panel band inside the landing hero — quote, media, next service.
 * Flush grid; brand colors (not the reference earth tones).
 */
export function HeroFeatureStrip(props: HeroFeatureStripProps) {
  return (
    <motion.div
      class="grid max-w-page h-full mx-auto overflow-hidden border-t border-brand-900/20 md:grid-cols-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...easeOut, delay: 0.22 }}
    >
      {/* Quote */}
      <article class="bg-brand-950 text-on-hero flex h-full min-h-0 gap-0">
        <div class="relative w-[38%] shrink-0 overflow-hidden sm:w-36 md:w-[40%]">
          <GradedImage
            src={props.quote.portrait.src}
            alt={props.quote.portrait.alt}
            scrim="none"
            responsive={false}
            fill
            class="object-cover object-center"
            loading="lazy"
          />
        </div>
        <div class="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
          <span
            class="font-hero text-brand-300/90 text-3xl font-extralight leading-none sm:text-4xl"
            aria-hidden="true"
          >
            “
          </span>
          <p class="font-hero text-on-hero-muted mt-1 line-clamp-4 text-sm font-light leading-relaxed tracking-wide sm:text-[0.9rem]">
            {props.quote.text}
          </p>
        </div>
      </article>

      {/* Media */}
      <a
        href={props.media.href}
        class="group relative block h-full min-h-0 overflow-hidden"
        aria-label={props.media.label}
      >
        <GradedImage
          src={props.media.src}
          alt={props.media.alt}
          scrim="none"
          responsive={false}
          fill
          class="object-cover object-center transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-brand-950/25 transition group-hover:bg-brand-950/15" />
        <span class="absolute inset-0 flex items-center justify-center">
          <span class="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-white/25 sm:h-14 sm:w-14">
            <svg
              viewBox="0 0 24 24"
              class="ml-0.5 h-5 w-5 fill-current"
              aria-hidden="true"
            >
              <path d="M8 5.14v13.72L19 12 8 5.14z" />
            </svg>
          </span>
        </span>
      </a>

      {/* Next service */}
      <article class="bg-surface text-ink relative flex h-full min-h-0 flex-col justify-between px-5 py-5 sm:px-7 sm:py-6">
        <div>
          <h2 class="font-hero text-ink-heading text-lg font-medium tracking-tight sm:text-xl">
            {props.service.title}
          </h2>
          <p class="font-hero text-ink-muted mt-1.5 text-sm font-light tracking-wide">
            {props.service.detail}
          </p>
        </div>
        <div class="mt-4 flex items-end justify-between gap-4">
          <a
            href={props.service.cta.href}
            class="font-hero text-ink-heading focus-visible:ring-accent-500 focus-visible:ring-offset-surface inline-flex min-h-11 items-center gap-1.5 py-2 text-sm font-medium tracking-wide underline decoration-ink/25 underline-offset-[0.35em] transition hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            {props.service.cta.label}
            <span aria-hidden="true">↗</span>
          </a>
          <span
            class="text-brand-500/80 pointer-events-none select-none text-2xl leading-none"
            aria-hidden="true"
          >
            ✦
          </span>
        </div>
      </article>
    </motion.div>
  );
}
