import { JSX, splitProps } from "solid-js";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = {
  variant?: ButtonVariant;
  href?: string;
  type?: "button" | "submit" | "reset";
  class?: string;
  children: JSX.Element;
} & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "children">;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-ink-inverse hover:bg-brand-700 focus-visible:ring-brand-500 border-transparent",
  secondary:
    "border-border-strong text-ink hover:bg-surface-muted bg-surface border",
  ghost: "text-brand-600 hover:bg-brand-50 border-transparent bg-transparent",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    "variant",
    "href",
    "type",
    "class",
    "children",
  ]);
  const variant = () => local.variant ?? "primary";
  const classes = () =>
    `${baseClasses} ${variantClasses[variant()]} ${local.class ?? ""}`;

  if (local.href) {
    return (
      <a href={local.href} class={classes()} {...rest}>
        {local.children}
      </a>
    );
  }

  return (
    <button type={local.type ?? "button"} class={classes()} {...rest}>
      {local.children}
    </button>
  );
}
