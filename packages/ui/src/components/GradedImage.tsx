import { JSX, Show, splitProps } from "solid-js";
import {
  getOptimizedImageAttributes,
  type OptimizedImageAttributes,
  type ResponsiveImageVariant,
} from "../images/responsive-image";

export type ImageGradeScrim = "hero" | "card" | "none";

/** natural = true photo; cool = split-tone brand blue (shadows/sky only, skin-safe). */
export type ImageGradeTone = "natural" | "cool";

const SCRIM_CLASS = {
  hero: "image-grade-scrim-hero",
  card: "image-grade-scrim-card",
} as const;

export type GradedImageProps = {
  src: string;
  alt: string;
  scrim?: ImageGradeScrim;
  /** cool = subtle royal-blue split-tone; avoids global hue-rotate */
  tone?: ImageGradeTone;
  fill?: boolean;
  class?: string;
  imageObjectPosition?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  referrerPolicy?: JSX.IntrinsicElements["img"]["referrerPolicy"];
  /** Responsive srcset for optimizable remote URLs (Unsplash). */
  responsive?: ResponsiveImageVariant | false;
  sizes?: string;
};

export function GradedImage(props: GradedImageProps) {
  const [local] = splitProps(props, [
    "src",
    "alt",
    "scrim",
    "tone",
    "fill",
    "class",
    "imageObjectPosition",
    "loading",
    "decoding",
    "referrerPolicy",
    "responsive",
    "sizes",
  ]);

  const scrim = () => local.scrim ?? "none";
  const tone = () => local.tone ?? "cool";
  const coolVariant = () => (scrim() === "hero" ? "hero" : "card");
  const optimized = (): OptimizedImageAttributes => {
    if (local.responsive === false) {
      return { src: local.src };
    }

    return getOptimizedImageAttributes({
      src: local.src,
      variant: local.responsive ?? (scrim() === "hero" ? "hero" : "card"),
      sizes: local.sizes,
    });
  };

  return (
    <div class={`image-grade ${local.fill ? "absolute inset-0" : "relative h-full w-full"}`}>
      <img
        src={optimized().src}
        srcset={optimized().srcset}
        sizes={optimized().sizes}
        alt={local.alt}
        class={`h-full w-full object-cover ${local.class ?? ""}`}
        style={
          local.imageObjectPosition
            ? { "object-position": local.imageObjectPosition }
            : undefined
        }
        loading={local.loading ?? "lazy"}
        decoding={local.decoding ?? "async"}
        referrerPolicy={local.referrerPolicy}
      />
      <Show when={tone() === "cool"}>
        <div
          class={`image-grade-cool-highlight image-grade-cool-highlight-${coolVariant()}`}
          aria-hidden="true"
        />
        <div
          class={`image-grade-cool-shadow image-grade-cool-shadow-${coolVariant()}`}
          aria-hidden="true"
        />
      </Show>
      <Show when={scrim() !== "none"}>
        <div
          class={`${SCRIM_CLASS[scrim() as keyof typeof SCRIM_CLASS]} pointer-events-none absolute inset-0`}
          aria-hidden="true"
        />
      </Show>
    </div>
  );
}
