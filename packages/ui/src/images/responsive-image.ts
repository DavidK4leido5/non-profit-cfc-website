export type ResponsiveImageVariant = "hero" | "banner" | "card" | "tile";

export type ImageFit = "crop" | "max";

export type ResponsiveImageOptions = {
  src: string;
  variant?: ResponsiveImageVariant;
  /** Overrides preset `sizes` — e.g. "(max-width: 768px) 100vw, 50vw" */
  sizes?: string;
  /** Overrides preset widths in pixels */
  widths?: readonly number[];
  quality?: number;
  /** Unsplash fit mode — `max` keeps the same photo at every width (CSS handles crop). */
  fit?: ImageFit;
};

export type OptimizedImageAttributes = {
  src: string;
  srcset?: string;
  sizes?: string;
};

export type ResponsiveImageConfig = {
  /** When set, remote images are served via Cloudinary CDN (fetch or public_id). */
  cloudName?: string;
  /** Optional folder prefix for Cloudinary public IDs — e.g. church-dev */
  folder?: string;
};

const UNSPLASH_HOST = "images.unsplash.com";
const CLOUDINARY_HOST = "res.cloudinary.com";

const PRESETS: Record<
  ResponsiveImageVariant,
  { widths: readonly number[]; sizes: string; fallbackWidth: number }
> = {
  hero: {
    widths: [640, 960, 1280, 1920, 2560],
    sizes: "100vw",
    fallbackWidth: 1920,
  },
  banner: {
    widths: [640, 960, 1280, 1920],
    sizes: "100vw",
    fallbackWidth: 1920,
  },
  card: {
    widths: [400, 640, 800, 1200],
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
    fallbackWidth: 800,
  },
  tile: {
    widths: [640, 960, 1280, 1920],
    sizes: "(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1200px",
    fallbackWidth: 1280,
  },
};

/** ponytail: module config — single cloud name per app shell; upgrade to context if multi-tenant */
let imageConfig: ResponsiveImageConfig = {};

export function configureResponsiveImages(config: ResponsiveImageConfig): void {
  imageConfig = { ...config };
}

export function getResponsiveImageConfig(): ResponsiveImageConfig {
  return imageConfig;
}

function isRemoteUrl(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

function isCloudinaryUrl(src: string): boolean {
  try {
    return new URL(src).hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
}

function isBundledAsset(src: string): boolean {
  return src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:");
}

/** Cloudinary public_id (uploaded asset), not a full URL */
function isCloudinaryPublicId(src: string): boolean {
  return !isRemoteUrl(src) && !isBundledAsset(src);
}

export function canOptimizeImageSrc(src: string): boolean {
  if (isBundledAsset(src)) return false;
  if (imageConfig.cloudName) {
    return isRemoteUrl(src) || isCloudinaryPublicId(src);
  }

  if (!isRemoteUrl(src)) return false;

  try {
    return new URL(src).hostname === UNSPLASH_HOST;
  } catch {
    return false;
  }
}

function cloudinaryTransforms(width: number): string {
  return `w_${Math.round(width)},c_limit,q_auto,f_auto,dpr_auto`;
}

function cloudinaryDeliveryUrl(src: string, width: number): string {
  const cloudName = imageConfig.cloudName;
  if (!cloudName) return src;

  const transforms = cloudinaryTransforms(width);

  if (isCloudinaryUrl(src)) {
    const url = new URL(src);
    const parts = url.pathname.split("/");
    const deliveryIndex = parts.findIndex((part) => part === "upload" || part === "fetch");
    if (deliveryIndex === -1) return src;

    const rest = parts.slice(deliveryIndex + 1);
    const versionIndex = rest[0]?.startsWith("v") ? 1 : 0;
    const assetPath = rest.slice(versionIndex).join("/");
    const deliveryType = parts[deliveryIndex];

    return `https://res.cloudinary.com/${cloudName}/image/${deliveryType}/${transforms}/${assetPath}`;
  }

  if (isRemoteUrl(src)) {
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transforms}/${encodeURIComponent(src)}`;
  }

  const publicId = imageConfig.folder ? `${imageConfig.folder}/${src}` : src;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}

function unsplashDeliveryUrl(
  src: string,
  width: number,
  quality: number,
  fit: ImageFit = "crop",
): string {
  const url = new URL(src);
  url.searchParams.set("w", String(Math.round(width)));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", fit);
  return url.toString();
}

/** Sized delivery URL — Cloudinary when configured, else Unsplash params, else unchanged. */
export function optimizeImageUrl(
  src: string,
  width: number,
  quality = 80,
  fit: ImageFit = "crop",
): string {
  if (!canOptimizeImageSrc(src)) return src;

  if (imageConfig.cloudName) {
    return cloudinaryDeliveryUrl(src, width);
  }

  return unsplashDeliveryUrl(src, width, quality, fit);
}

export function buildResponsiveSrcSet(
  src: string,
  widths: readonly number[],
  quality = 80,
  fit: ImageFit = "crop",
): string | undefined {
  if (!canOptimizeImageSrc(src)) return undefined;

  const uniqueWidths = [...new Set(widths)].sort((a, b) => a - b);
  return uniqueWidths
    .map((width) => `${optimizeImageUrl(src, width, quality, fit)} ${width}w`)
    .join(", ");
}

/** Native responsive image attrs for `<img srcset sizes>`. */
export function getOptimizedImageAttributes(
  options: ResponsiveImageOptions,
): OptimizedImageAttributes {
  const variant = options.variant ?? "card";
  const preset = PRESETS[variant];
  const widths = options.widths ?? preset.widths;
  const sizes = options.sizes ?? preset.sizes;
  const quality = options.quality ?? 80;
  // Default fit=max — fit=crop at different widths returns different crops (flash).
  const fit = options.fit ?? "max";
  const srcset = buildResponsiveSrcSet(options.src, widths, quality, fit);

  return {
    src: optimizeImageUrl(options.src, preset.fallbackWidth, quality, fit),
    ...(srcset ? { srcset, sizes } : {}),
  };
}

/** Content URL only — no rewrite. Prefer this when flash/breakage matters more than CDN. */
export function getStableImageAttributes(src: string): OptimizedImageAttributes {
  return { src };
}
