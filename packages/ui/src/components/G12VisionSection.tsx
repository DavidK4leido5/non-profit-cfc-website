import { For, Show } from "solid-js";
import { motion } from "motion-solid";
import { easeOut, fadeUpItem, fadeUpStagger, viewportOnce } from "../motion/presets";

export type G12VisionStep = {
  title: string;
  description: string;
};

export type G12VisionScripture = {
  reference: string;
  text: string;
};

export type G12VisionLogo = {
  src: string;
  alt: string;
};

export type G12VisionSectionProps = {
  headerTitle: string;
  logo: G12VisionLogo;
  eyebrow: string;
  title: string;
  scripture: G12VisionScripture;
  intro: string;
  steps: readonly G12VisionStep[];
  closing?: string;
  class?: string;
};

export function G12VisionSection(props: G12VisionSectionProps) {
  return (
    <motion.section
      id="g12-vision"
      class={`border-t border-border bg-surface ${props.class ?? ""}`}
      initial="initial"
      whileInView="animate"
      viewport={viewportOnce}
      variants={fadeUpStagger}
    >
      <div class="mx-auto max-w-page px-4 py-14 sm:py-16 lg:px-10 lg:py-20">
        <motion.header
          class="mb-10 flex flex-col items-center gap-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:mb-14"
          variants={fadeUpItem}
          transition={easeOut}
        >
          <h2 class="font-display text-ink-heading text-center text-4xl font-light tracking-tight uppercase sm:text-5xl lg:text-left lg:text-6xl xl:text-7xl">
            {props.headerTitle}
          </h2>
          <img
            src={props.logo.src}
            alt={props.logo.alt}
            class="h-20 w-auto max-w-[min(100%,18rem)] rounded-xl object-contain sm:h-24 lg:h-28"
            loading="lazy"
            decoding="async"
          />
        </motion.header>

        <div class="flex flex-col gap-10 lg:flex-row-reverse lg:items-start lg:gap-14 xl:gap-20">
          <motion.div
            class="lg:w-1/2 lg:shrink-0 lg:pt-1"
            variants={fadeUpItem}
            transition={easeOut}
          >
            <p class="font-ui text-brand-600 text-xs font-semibold uppercase tracking-wider sm:text-sm">
              {props.eyebrow}
            </p>

            <blockquote class="border-brand-200 mt-5 border-s-4 ps-5 sm:mt-6">
              <p class="font-body text-ink-heading text-lg leading-relaxed font-medium italic sm:text-xl">
                &ldquo;{props.scripture.text}&rdquo;
              </p>
              <footer class="font-ui text-ink-subtle mt-3 text-sm font-medium not-italic">
                — {props.scripture.reference}
              </footer>
            </blockquote>

            <p class="font-body text-ink-muted mt-6 text-base leading-relaxed sm:mt-8 sm:text-lg">
              {props.intro}
            </p>

            <Show when={props.closing}>
              <p class="font-body text-ink-heading mt-6 text-sm leading-relaxed font-medium sm:text-base">
                {props.closing}
              </p>
            </Show>
          </motion.div>

          <motion.div class="lg:w-1/2" variants={fadeUpItem} transition={{ ...easeOut, delay: 0.06 }}>
            <h3 class="font-display text-ink-heading text-2xl font-light tracking-tight sm:text-3xl">
              {props.title}
            </h3>

            <ol class="mt-6 space-y-5 sm:mt-8 sm:space-y-6">
              <For each={props.steps}>
                {(step, index) => (
                  <li class="flex gap-4 sm:gap-5">
                    <span
                      class="bg-accent-500 text-on-hero font-ui flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold sm:h-10 sm:w-10"
                      aria-hidden="true"
                    >
                      {index() + 1}
                    </span>
                    <div class="min-w-0 pt-0.5">
                      <h4 class="font-display text-ink-heading text-lg font-light tracking-tight sm:text-xl">
                        {step.title}
                      </h4>
                      <p class="font-body text-ink-muted mt-1.5 text-sm leading-relaxed sm:text-base">
                        {step.description}
                      </p>
                    </div>
                  </li>
                )}
              </For>
            </ol>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
