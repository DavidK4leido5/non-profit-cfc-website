/** Shared Motion presets — https://motion.dev */
export const easeOut = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const springSnappy = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
};

export const fadeUpItem = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export const fadeUpStagger = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const viewportOnce = {
  once: true,
  margin: "-8% 0px -8% 0px",
};
