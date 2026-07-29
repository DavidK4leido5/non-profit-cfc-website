import { MotionConfig } from "motion-solid";
import { ParentProps } from "solid-js";

/** Respects `prefers-reduced-motion` via Motion — https://motion.dev */
export function MotionProvider(props: ParentProps) {
  return <MotionConfig reducedMotion="user">{props.children}</MotionConfig>;
}
