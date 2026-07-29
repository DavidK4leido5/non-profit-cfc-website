import { For } from "solid-js";
import { motion } from "motion-solid";
import { easeOut, fadeUpItem, fadeUpStagger, viewportOnce } from "../motion/presets";

export type TrustStripItem = {
  value: string;
  label: string;
};

export type TrustStripProps = {
  title?: string;
  items: TrustStripItem[];
  class?: string;
};

export function TrustStrip(props: TrustStripProps) {
  return (
    <motion.section
      class={`border-t border-border bg-surface-subtle ${props.class ?? ""}`}
      initial="initial"
      whileInView="animate"
      viewport={viewportOnce}
      variants={fadeUpStagger}
    >
      <div class="mx-auto max-w-page px-4 py-10 sm:py-12 lg:px-10">
        {props.title && (
          <motion.p
            class="text-ink-subtle mb-6 text-center text-xs font-medium uppercase tracking-wider sm:mb-8 sm:text-sm"
            variants={fadeUpItem}
            transition={easeOut}
          >
            {props.title}
          </motion.p>
        )}
        <div class="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          <For each={props.items}>
            {(item) => (
              <motion.div class="text-center" variants={fadeUpItem} transition={easeOut}>
                <p class="text-ink-heading text-xl font-semibold sm:text-2xl md:text-3xl">
                  {item.value}
                </p>
                <p class="text-ink-muted mt-1.5 text-xs leading-snug sm:mt-2 sm:text-sm">
                  {item.label}
                </p>
              </motion.div>
            )}
          </For>
        </div>
      </div>
    </motion.section>
  );
}
