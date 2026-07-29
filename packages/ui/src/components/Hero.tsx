import { JSX, Show } from "solid-js";
import { motion } from "motion-solid";
import { easeOut, fadeUpItem, fadeUpStagger } from "../motion/presets";
import { Button } from "./Button";
import { GradedImage } from "./GradedImage";

export type HeroCta = {
  label: string;
  href: string;
};

export type HeroBackground = {
  src: string;
  alt: string;
};

export type HeroStat = {
  value: string;
  label: string;
};

export type HeroProps = {
  eyebrow: string;
  headline: string;
  subcopy: string;
  primaryCta: HeroCta;
  secondaryCta?: HeroCta;
  /** Full-bleed background — set in site.content.ts (e.g. /images/hero-bg.jpg) */
  background: HeroBackground;
  badge?: string;
  stats?: readonly HeroStat[];
  /** Optional floating card (Storybook / legacy layouts) */
  preview?: JSX.Element;
  class?: string;
};

export function Hero(props: HeroProps) {
  return (
    <section
      class={`relative flex min-h-dvh items-center overflow-hidden ${props.class ?? ""}`}
    >
      <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <GradedImage
          src={props.background.src}
          alt={props.background.alt}
          scrim="hero"
          class="scale-105 object-center"
          loading="eager"
        />
      </div>

      <div class="relative mx-auto w-full max-w-page px-4 py-28 sm:px-6 sm:py-32 lg:px-10 lg:py-36">
        <div class="grid items-center gap-10 lg:grid-cols-[minmax(0,38rem)_1fr] lg:gap-16 xl:grid-cols-[minmax(0,42rem)_1fr]">
          <motion.div
            class="max-w-2xl text-left"
            initial="initial"
            animate="animate"
            variants={fadeUpStagger}
          >
            <Show when={props.badge}>
              <motion.span
                class="bg-brand-500/90 text-on-hero mb-4 inline-block rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm sm:text-sm"
                variants={fadeUpItem}
                transition={easeOut}
              >
                {props.badge}
              </motion.span>
            </Show>

            <motion.p
              class="text-brand-200 text-xs font-medium uppercase tracking-wider sm:text-sm"
              variants={fadeUpItem}
              transition={easeOut}
            >
              {props.eyebrow}
            </motion.p>
            <motion.h1
              class="text-on-hero mt-3 text-4xl font-semibold tracking-tight sm:mt-4 sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[1.05]"
              variants={fadeUpItem}
              transition={easeOut}
            >
              {props.headline}
            </motion.h1>
            <motion.p
              class="text-on-hero-muted mt-4 max-w-xl text-base leading-relaxed sm:mt-6 sm:text-lg lg:max-w-none lg:text-xl"
              variants={fadeUpItem}
              transition={easeOut}
            >
              {props.subcopy}
            </motion.p>
            <motion.div
              class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
              variants={fadeUpItem}
              transition={easeOut}
            >
              <Button href={props.primaryCta.href} variant="primary" class="w-full sm:w-auto">
                {props.primaryCta.label}
              </Button>
              <Show when={props.secondaryCta}>
                {(cta) => (
                  <Button
                    href={cta().href}
                    variant="secondary"
                    class="w-full border-white/30 bg-white/10 text-on-hero backdrop-blur-sm hover:bg-white/20 sm:w-auto"
                  >
                    {cta().label}
                  </Button>
                )}
              </Show>
            </motion.div>
          </motion.div>

          <Show when={props.stats && props.stats.length > 0}>
            <motion.div
              class="border-white/15 bg-white/10 grid w-full max-w-md grid-cols-2 gap-px overflow-hidden rounded-2xl border shadow-hero backdrop-blur-md lg:ml-auto lg:max-w-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...easeOut, delay: 0.3 }}
            >
              {props.stats!.map((stat) => (
                <div class="bg-brand-950/40 px-4 py-4 text-left sm:px-5 sm:py-5">
                  <p class="text-on-hero text-xl font-semibold sm:text-2xl">{stat.value}</p>
                  <p class="text-on-hero-subtle mt-1 text-xs sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </Show>

          <Show when={props.preview && !props.stats?.length}>
            <motion.div
              class="flex justify-start lg:justify-end"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ ...easeOut, delay: 0.28 }}
            >
              {props.preview}
            </motion.div>
          </Show>
        </div>
      </div>
    </section>
  );
}
