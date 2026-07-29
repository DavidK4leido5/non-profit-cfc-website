import { motion } from "motion-solid";
import { easeOut, fadeUpItem, fadeUpStagger, viewportOnce } from "../motion/presets";
import { Button } from "./Button";

export type VisitInviteCta = {
  label: string;
  href: string;
};

export type VisitInviteSectionProps = {
  title: string;
  subtitle?: string;
  cta: VisitInviteCta;
  class?: string;
};

export function VisitInviteSection(props: VisitInviteSectionProps) {
  return (
    <motion.section
      id="visit"
      class={`bg-surface-subtle ${props.class ?? ""}`}
      initial="initial"
      whileInView="animate"
      viewport={viewportOnce}
      variants={fadeUpStagger}
    >
      <div class="mx-auto max-w-page px-4 py-14 text-center sm:py-16 lg:px-10 lg:py-20">
        <motion.h2
          class="text-ink-heading mx-auto max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl"
          variants={fadeUpItem}
          transition={easeOut}
        >
          {props.title}
        </motion.h2>
        {props.subtitle && (
          <motion.p
            class="text-ink-muted mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg"
            variants={fadeUpItem}
            transition={easeOut}
          >
            {props.subtitle}
          </motion.p>
        )}
        <motion.div class="mt-8" variants={fadeUpItem} transition={easeOut}>
          <Button href={props.cta.href} variant="primary" class="w-full sm:w-auto">
            {props.cta.label}
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
}
