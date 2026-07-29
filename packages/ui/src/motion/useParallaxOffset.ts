import { createSignal, onCleanup, onMount } from "solid-js";

/**
 * Scroll-linked Y offset for background parallax.
 * Offset is zero when the section is centered in the viewport.
 * Respects prefers-reduced-motion.
 */
export function useParallaxOffset(getRoot: () => HTMLElement | undefined, amount = 36) {
  const [offset, setOffset] = createSignal(0);

  onMount(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const update = () => {
      const root = getRoot();
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const viewCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const normalized = (elementCenter - viewCenter) / viewCenter;
      setOffset(normalized * amount);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    onCleanup(() => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    });
  });

  return () => Math.max(-amount, Math.min(amount, offset()));
}
