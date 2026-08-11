import { For, Show } from "solid-js";
import { motion } from "motion-solid";
import { easeOut, fadeUpItem, fadeUpStagger, viewportOnce } from "../motion/presets";
import { BentoCard, BentoGrid, type BentoCardProps } from "./BentoGrid";

export type UpcomingActivitiesSectionProps = {
  title: string;
  subtitle?: string;
  items: readonly BentoCardProps[];
  class?: string;
};

export function UpcomingActivitiesSection(props: UpcomingActivitiesSectionProps) {
  return (
    <motion.section
      id="activities"
      class={`border-t border-border bg-surface-subtle ${props.class ?? ""}`}
      initial="initial"
      whileInView="animate"
      viewport={viewportOnce}
      variants={fadeUpStagger}
    >
      <div class="mx-auto max-w-page px-4 py-14 sm:py-16 lg:px-10 lg:py-20">
        <motion.div class="mx-auto mb-10 max-w-2xl text-center sm:mb-12" variants={fadeUpItem} transition={easeOut}>
          <h2 class="font-display text-ink-heading text-2xl font-light tracking-tight sm:text-3xl lg:text-4xl">
            {props.title}
          </h2>
          <Show when={props.subtitle}>
            <p class="font-body text-ink-muted mt-3 text-base leading-relaxed sm:mt-4 sm:text-lg">
              {props.subtitle}
            </p>
          </Show>
        </motion.div>

        <motion.div variants={fadeUpItem} transition={easeOut}>
          <BentoGrid>
            <For each={props.items}>
              {(item) => (
                <BentoCard
                  name={item.name}
                  description={item.description}
                  href={item.href}
                  cta={item.cta}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  icon={item.icon}
                  dateLabel={item.dateLabel}
                  class={item.class}
                />
              )}
            </For>
          </BentoGrid>
        </motion.div>
      </div>
    </motion.section>
  );
}
