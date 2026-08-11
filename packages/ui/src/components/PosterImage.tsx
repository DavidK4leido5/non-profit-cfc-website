import { JSX, splitProps } from "solid-js";

export type PosterImageProps = {
  src: string;
  alt: string;
  class?: string;
  style?: JSX.CSSProperties;
  loading?: "lazy" | "eager";
  /**
   * @deprecated No-op — PosterImage always uses the content URL as-is.
   * Kept so existing call sites with `stable` keep compiling.
   */
  stable?: boolean;
  /** @deprecated Ignored — no responsive rewrite on board images. */
  variant?: string;
  /** @deprecated Ignored — no responsive rewrite on board images. */
  sizes?: string;
};

/**
 * Board/poster photos — always the content URL, never OptimizedImageAttributes.
 * Rewriting Unsplash/Cloudinary URLs caused flash (crop swaps) and broken loads.
 */
export function PosterImage(props: PosterImageProps) {
  const [local, rest] = splitProps(props, [
    "src",
    "alt",
    "class",
    "style",
    "loading",
    "stable",
    "variant",
    "sizes",
  ]);

  return (
    <img
      src={local.src}
      alt={local.alt}
      class={local.class}
      style={local.style}
      loading={local.loading ?? "lazy"}
      decoding="async"
      {...rest}
    />
  );
}
