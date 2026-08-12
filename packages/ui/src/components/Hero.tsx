import { JSX, Show } from "solid-js";
import { motion } from "motion-solid";
import { easeOut, fadeUpItem, fadeUpStagger } from "../motion/presets";
import { CtaButton } from "./CtaButton";
import { GradedImage } from "./GradedImage";
import {
  HeroFeatureStrip,
  type HeroFeatureStripProps,
} from "./HeroFeatureStrip";

export type HeroCta = {
  label: string;
  href: string;
};

export type HeroBackground = {
  src: string;
  alt: string;
  /** Flip horizontally (e.g. move a left-side subject to the right) */
  mirror?: boolean;
};

export type HeroStat = {
  value: string;
  label: string;
};

export type HeroProps = {
  headline: string;
  subcopy: string;
  primaryCta: HeroCta;
  /** Full-bleed background — set in site.content.ts */
  background: HeroBackground;
  /** Three-column band flush under the photo (quote / media / next service) */
  featureStrip?: HeroFeatureStripProps;
  /** @deprecated Kept for Storybook legacy stories */
  secondaryCta?: HeroCta;
  eyebrow?: string;
  badge?: string;
  stats?: readonly HeroStat[];
  preview?: JSX.Element;
  class?: string;
};

/**
 * Landing hero — photo + copy + optional feature strip in one 100vh composition.
 * Site nav stays in Navbar; colors stay on brand tokens.
 */
export function Hero(props: HeroProps) {
  return (
    <section
      class={`relative flex h-dvh max-h-dvh flex-col ${props.class ?? ""}`}
    >
      <div class="relative flex min-h-0 flex-1 flex-col">
        <div
          class="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <GradedImage
            src={props.background.src}
            alt={props.background.alt}
            scrim="hero"
            responsive={false}
            fill
            class={`object-center ${props.background.mirror ? "-scale-x-100" : ""}`}
            loading="eager"
          />
        </div>

        <div class="relative mx-auto mt-auto flex w-full max-w-page flex-col">
          <motion.div
            class="max-w-3xl px-4 pb-8 pt-28 text-left sm:pb-10 sm:pt-32 md:px-4 lg:px-12 mb-16"
            initial="initial"
            animate="animate"
            variants={fadeUpStagger}
          >
            <motion.h1
              class="font-hero text-on-hero text-[2.35rem] font-extralight leading-[1.05] tracking-[-0.03em] sm:text-5xl md:text-6xl lg:text-7xl"
              variants={fadeUpItem}
              transition={easeOut}
            >
              {props.headline}
            </motion.h1>
            <motion.p
              class="font-hero text-on-hero-muted mt-4 max-w-xl text-base font-light leading-relaxed tracking-wide sm:text-lg md:text-xl"
              variants={fadeUpItem}
              transition={easeOut}
            >
              {props.subcopy}
            </motion.p>
            <motion.div
              class="mt-7 overflow-visible p-0.5 sm:mt-8"
              variants={fadeUpItem}
              transition={easeOut}
            >
              <CtaButton href={props.primaryCta.href} variant="cta" size="md">
                {props.primaryCta.label}
              </CtaButton>
            </motion.div>
          </motion.div>

          <Show when={props.featureStrip}>
            {(strip) => (
              <div class="relative z-10 mb-4 h-[min(28vh,16.5rem)] shrink-0 overflow-hidden rounded-md sm:mb-6 sm:h-[min(30vh,18rem)]">
                <HeroFeatureStrip {...strip()} />
              </div>
            )}
          </Show>
        </div>
      </div>
    </section>
  );
}
