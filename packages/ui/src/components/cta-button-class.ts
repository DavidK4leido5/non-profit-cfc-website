export type CtaButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "cta"
  | "soft"
  | "outline"
  | "inverse"
  | "inverseGhost"
  | "link"
  | "danger";

export type CtaButtonSize = "sm" | "md" | "lg";

export const CTA_BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "ghost",
  "cta",
  "soft",
  "outline",
  "inverse",
  "inverseGhost",
  "link",
  "danger",
] as const satisfies readonly CtaButtonVariant[];

const variantClasses: Record<CtaButtonVariant, string> = {
  /** Filled accent (royal blue) — default solid action */
  primary:
    "border-transparent bg-accent-600 text-ink-inverse hover:bg-accent-700 focus-visible:ring-accent-500 focus-visible:ring-offset-surface",
  secondary:
    "border border-border-strong bg-surface text-ink hover:bg-surface-muted focus-visible:ring-accent-500 focus-visible:ring-offset-surface",
  ghost:
    "border-transparent bg-transparent text-accent-600 hover:bg-accent-50 focus-visible:ring-accent-500 focus-visible:ring-offset-surface",
  /** Nav / high-intent — accent-600 for WCAG AA margin on white text */
  cta:
    "border-transparent bg-accent-600 text-ink-inverse shadow-sm hover:bg-accent-700 focus-visible:ring-accent-400 focus-visible:ring-offset-primary font-semibold",
  soft:
    "border-transparent bg-accent-50 text-accent-700 hover:bg-accent-100 focus-visible:ring-accent-500 focus-visible:ring-offset-surface",
  outline:
    "border border-accent-600 bg-transparent text-accent-700 hover:bg-accent-50 focus-visible:ring-accent-500 focus-visible:ring-offset-surface",
  inverse:
    "border-transparent bg-white text-primary hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-primary",
  inverseGhost:
    "border border-white/40 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-primary",
  link:
    "min-h-6 min-w-6 border-transparent bg-transparent px-1 py-2 text-accent-600 underline decoration-accent-600/30 underline-offset-[0.35em] hover:decoration-accent-600 focus-visible:ring-accent-500 focus-visible:ring-offset-surface",
  danger:
    "border-transparent bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 focus-visible:ring-offset-surface",
};

const sizeClasses: Record<CtaButtonSize, string> = {
  sm: "min-h-11 rounded-md px-3.5 py-2 text-sm",
  md: "min-h-11 rounded-lg px-6 py-3 text-sm",
  lg: "min-h-12 rounded-lg px-8 py-3.5 text-base",
};

const baseClasses =
  "font-ui inline-flex items-center justify-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function ctaButtonClass(options: {
  variant?: CtaButtonVariant;
  size?: CtaButtonSize;
  fullWidth?: boolean;
  class?: string;
}): string {
  const variant = options.variant ?? "primary";
  const size = options.size ?? "md";
  const width = options.fullWidth ? "w-full" : "";
  const sizing = variant === "link" ? "text-sm" : sizeClasses[size];
  return [baseClasses, sizing, variantClasses[variant], width, options.class ?? ""]
    .filter(Boolean)
    .join(" ");
}
