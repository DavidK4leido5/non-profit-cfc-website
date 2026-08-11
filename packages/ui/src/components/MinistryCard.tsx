import { createSignal, JSX, Show, splitProps } from "solid-js";
import { motion } from "motion-solid";
import { easeOut } from "../motion/presets";
import { Button } from "./Button";

export type MinistryCardCta = {
  label: string;
  href: string;
};

export type MinistryCardProps = {
  imageSrc: string;
  imageAlt: string;
  title: JSX.Element;
  description: string;
  primaryCta: MinistryCardCta;
  secondaryCta?: MinistryCardCta;
  /** CSS object-position for rule-of-thirds framing — e.g. "33% 40%" */
  imageObjectPosition?: string;
  class?: string;
};

const CLIP_REST = "ellipse(100% 52% at 50% 26%)";
const CLIP_REVEAL = "ellipse(155% 118% at 50% 46%)";

const imageReveal = {
  initial: { opacity: 0, y: -32 },
  animate: { opacity: 1, y: 0 },
};

const contentReveal = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const revealTransition = { ...easeOut, duration: 0.6 };

export function MinistryCard(props: MinistryCardProps) {
  const [local] = splitProps(props, [
    "imageSrc",
    "imageAlt",
    "title",
    "description",
    "primaryCta",
    "secondaryCta",
    "imageObjectPosition",
    "class",
  ]);

  const [imageRevealed, setImageRevealed] = createSignal(false);

  const showImage = () => setImageRevealed(true);
  const hideImage = () => setImageRevealed(false);

  return (
    <article
      class={`border-border bg-surface flex h-full flex-col overflow-hidden rounded-2xl border shadow-md ${local.class ?? ""}`}
    >
      <motion.div
        class="relative h-56 w-full overflow-hidden sm:h-64 lg:h-72"
        initial={imageReveal.initial}
        whileInView={imageReveal.animate}
        viewport={{ once: true, margin: "-5% 0px" }}
        transition={{ ...easeOut, duration: 0.7 }}
      >
        <motion.img
          src={local.imageSrc}
          alt={local.imageAlt}
          class="h-full w-full object-cover"
          style={{
            "object-position": local.imageObjectPosition ?? "33% 40%",
            "clip-path": imageRevealed() ? CLIP_REVEAL : CLIP_REST,
          }}
          loading="lazy"
          decoding="async"
          animate={{
            scale: imageRevealed() ? 1.1 : 1,
          }}
          transition={revealTransition}
        />
      </motion.div>

      <motion.div
        class="flex flex-1 flex-col items-center justify-center space-y-4 px-6 py-6 text-center sm:space-y-5 sm:px-8 sm:py-8"
        initial={contentReveal.initial}
        whileInView={contentReveal.animate}
        viewport={{ once: true, margin: "-5% 0px" }}
        transition={{ ...easeOut, delay: 0.08 }}
      >
        <h3 class="font-display text-ink-heading text-xl font-light tracking-tight sm:text-2xl">
          {local.title}
        </h3>
        <p class="font-body text-ink-muted max-w-sm text-sm leading-relaxed sm:text-base">
          {local.description}
        </p>
      </motion.div>

      <div class="space-y-3 px-6 pb-6 sm:px-8 sm:pb-8">
        <Button
          href={local.primaryCta.href}
          variant="primary"
          class="w-full"
          onMouseEnter={showImage}
          onMouseLeave={hideImage}
          onFocus={showImage}
          onBlur={hideImage}
        >
          {local.primaryCta.label}
        </Button>
        <Show when={local.secondaryCta}>
          {(cta) => (
            <div class="text-center">
              <Button
                href={cta().href}
                variant="ghost"
                class="text-ink-subtle hover:text-brand-600 w-full text-sm font-normal underline-offset-4 hover:underline"
              >
                {cta().label}
              </Button>
            </div>
          )}
        </Show>
      </div>
    </article>
  );
}
