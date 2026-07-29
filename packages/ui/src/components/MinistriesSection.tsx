import { For, JSX, Show, createSignal } from "solid-js";
import { motion } from "motion-solid";
import { easeOut, fadeUpItem, fadeUpStagger, viewportOnce } from "../motion/presets";
import { useParallaxOffset } from "../motion/useParallaxOffset";
import { Button } from "./Button";
import { GradedImage } from "./GradedImage";
import { MinistryCard, type MinistryCardCta } from "./MinistryCard";

export type MinistryItem = {
  imageSrc: string;
  imageAlt: string;
  title: JSX.Element;
  description: string;
  primaryCta: MinistryCardCta;
  secondaryCta?: MinistryCardCta;
  imageObjectPosition?: string;
};

export type MinistriesMoreImage = {
  src: string;
  alt: string;
  imageObjectPosition?: string;
};

export type MinistriesMoreBlock = {
  eyebrow: string;
  title: string;
  description: string;
  cta: MinistryCardCta;
  image: MinistriesMoreImage;
};

export type MinistriesSectionProps = {
  title: string;
  subtitle?: string;
  items: readonly MinistryItem[];
  more: MinistriesMoreBlock;
  class?: string;
};

export function MinistriesSection(props: MinistriesSectionProps) {
  const [moreBannerRef, setMoreBannerRef] = createSignal<HTMLDivElement>();
  const moreParallaxY = useParallaxOffset(() => moreBannerRef(), 80);

  return (
    <motion.section
      id="get-connected"
      class={`border-t border-border bg-surface ${props.class ?? ""}`}
      initial="initial"
      whileInView="animate"
      viewport={viewportOnce}
      variants={fadeUpStagger}
    >
      <div class="mx-auto max-w-page px-4 py-14 sm:py-16 lg:px-10 lg:py-20">
        <motion.div class="mx-auto mb-10 max-w-2xl text-center sm:mb-12" variants={fadeUpItem} transition={easeOut}>
          <h2 class="text-ink-heading text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            {props.title}
          </h2>
          <Show when={props.subtitle}>
            <p class="text-ink-muted mt-3 text-base leading-relaxed sm:mt-4 sm:text-lg">
              {props.subtitle}
            </p>
          </Show>
        </motion.div>

        <div class="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          <For each={props.items}>
            {(item) => (
              <motion.div class="h-full" variants={fadeUpItem} transition={easeOut}>
                <MinistryCard
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  title={item.title}
                  description={item.description}
                  primaryCta={item.primaryCta}
                  secondaryCta={item.secondaryCta}
                  imageObjectPosition={item.imageObjectPosition}
                />
              </motion.div>
            )}
          </For>
        </div>
      </div>

      <motion.div
        ref={setMoreBannerRef}
        class="border-border relative mt-2 min-h-64 w-full overflow-hidden border-t sm:min-h-72 lg:min-h-80"
        variants={fadeUpItem}
        transition={{ ...easeOut, delay: 0.06 }}
      >
        <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            class="absolute inset-x-0 -top-[30%] h-[160%] will-change-transform"
            style={{
              transform: `translate3d(0, ${moreParallaxY()}px, 0)`,
            }}
          >
            <GradedImage
              src={props.more.image.src}
              alt={props.more.image.alt}
              scrim="none"
              tone="natural"
              fill={false}
              imageObjectPosition={props.more.image.imageObjectPosition ?? "72% center"}
              class="h-full w-full object-cover"
            />
          </div>
        </div>
        <div class="get-connected-more-overlay pointer-events-none absolute inset-0" aria-hidden="true" />

        <div class="relative z-10 flex min-h-[inherit] items-center">
          <div class="mx-auto w-full max-w-page px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
            <div class="max-w-md text-left sm:max-w-lg">
              <p class="text-brand-200 text-xs font-semibold uppercase tracking-wider sm:text-sm">
                {props.more.eyebrow}
              </p>
              <h3 class="text-on-hero mt-2 text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
                {props.more.title}
              </h3>
              <p class="text-on-hero-muted mt-2 text-sm leading-relaxed sm:text-base">
                {props.more.description}
              </p>
              <Button
                href={props.more.cta.href}
                variant="secondary"
                class="border-white/30 bg-white/10 text-on-hero hover:bg-white/20 mt-5 backdrop-blur-sm"
              >
                {props.more.cta.label}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
