import { For, Show } from "solid-js";
import { motion } from "motion-solid";
import { easeOut, fadeUpItem, fadeUpStagger } from "../motion/presets";
import { PosterImage } from "./PosterImage";

export type BoardHeroLink = {
  slug: string;
  label: string;
};

export type BoardHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  background: { src: string; alt: string };
  quickLinks: readonly BoardHeroLink[];
  class?: string;
};

export function BoardHero(props: BoardHeroProps) {
  return (
    <section
      class={`board-hero relative overflow-hidden ${props.class ?? ""}`}
    >
      <div class="pointer-events-none absolute inset-0" aria-hidden="true">
        <PosterImage
          src={props.background.src}
          alt={props.background.alt}
          class="h-full w-full object-cover object-center"
          loading="eager"
        />
        <div
          class="absolute inset-0 bg-gradient-to-b from-primary/55 via-primary/45 to-primary"
          aria-hidden="true"
        />
        <div
          class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary via-primary/90 to-transparent"
          aria-hidden="true"
        />
      </div>

      <motion.div
        class="relative mx-auto flex h-full max-w-page flex-col justify-end px-4 pb-8 pt-20 sm:px-6 sm:pb-9 lg:px-10 lg:pb-10"
        initial="initial"
        animate="animate"
        variants={fadeUpStagger}
      >
        <motion.p
          class="font-ui text-brand-200 text-xs font-bold uppercase tracking-[0.24em] sm:text-sm"
          variants={fadeUpItem}
          transition={easeOut}
        >
          {props.eyebrow}
        </motion.p>

        <motion.h1
          class="font-display bulletin-hero-title-compact text-on-hero mt-3 max-w-xl"
          variants={fadeUpItem}
          transition={easeOut}
        >
          {props.title}
        </motion.h1>

        <motion.p
          class="font-body text-on-hero-muted mt-3 max-w-lg text-sm leading-relaxed sm:text-base"
          variants={fadeUpItem}
          transition={easeOut}
        >
          {props.subtitle}
        </motion.p>

        <Show when={props.quickLinks.length > 0}>
          <motion.nav
            class="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-2.5"
            aria-label="Jump to ministry boards"
            variants={fadeUpItem}
            transition={{ ...easeOut, delay: 0.06 }}
          >
            <For each={props.quickLinks}>
              {(link, index) => (
                <a
                  href={`#${link.slug}`}
                  class={`bulletin-hero-link-compact bulletin-hero-link-tone-${index() % 3}`}
                  onClick={(event) => {
                    const target = document.getElementById(link.slug);
                    if (!target) return;
                    event.preventDefault();
                    const reduceMotion = window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches;
                    target.scrollIntoView({
                      behavior: reduceMotion ? "auto" : "smooth",
                      block: "start",
                    });
                    history.pushState(null, "", `#${link.slug}`);
                  }}
                >
                  {link.label}
                </a>
              )}
            </For>
          </motion.nav>
        </Show>
      </motion.div>
    </section>
  );
}
