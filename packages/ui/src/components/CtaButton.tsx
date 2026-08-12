import { JSX, splitProps } from "solid-js";
import {
  ctaButtonClass,
  type CtaButtonSize,
  type CtaButtonVariant,
} from "./cta-button-class";

export type {
  CtaButtonSize,
  CtaButtonVariant,
} from "./cta-button-class";
export { CTA_BUTTON_VARIANTS, ctaButtonClass } from "./cta-button-class";

export type CtaButtonProps = {
  variant?: CtaButtonVariant;
  size?: CtaButtonSize;
  href?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  class?: string;
  children: JSX.Element;
} & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "children">;

/** @deprecated Prefer CtaButtonVariant */
export type ButtonVariant = CtaButtonVariant;
/** @deprecated Prefer CtaButtonProps */
export type ButtonProps = CtaButtonProps;

/**
 * Call-to-action control — button or link — with surface / intent variants.
 */
export function CtaButton(props: CtaButtonProps) {
  const [local, rest] = splitProps(props, [
    "variant",
    "size",
    "href",
    "type",
    "fullWidth",
    "class",
    "children",
  ]);

  const classes = () =>
    ctaButtonClass({
      variant: local.variant,
      size: local.size,
      fullWidth: local.fullWidth,
      class: local.class,
    });

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

/** Back-compat alias — same API as CtaButton */
export const Button = CtaButton;
