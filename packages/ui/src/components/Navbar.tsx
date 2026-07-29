import { createSignal, JSX, Show, splitProps } from "solid-js";
import { Button } from "./Button";

export type NavLink = {
  href: string;
  label: string;
  active?: boolean;
};

export type NavbarBrandLogo = {
  src: string;
  alt: string;
};

export type NavbarBrand = {
  name: string;
  href: string;
  logo?: NavbarBrandLogo;
};

export type NavbarCta = {
  href: string;
  label: string;
};

export type NavbarLinkProps = {
  href: string;
  class?: string;
  children: JSX.Element;
  onClick?: () => void;
};

export type NavbarProps = {
  brand: NavbarBrand;
  links: NavLink[];
  cta?: NavbarCta;
  userEmail?: string | null;
  Link?: (props: NavbarLinkProps) => JSX.Element;
  /** solid = default bar; transparent = overlays hero (Bobbin-style) */
  variant?: "solid" | "transparent";
  class?: string;
};

function DefaultLink(props: NavbarLinkProps) {
  return (
    <a href={props.href} class={props.class} onClick={props.onClick}>
      {props.children}
    </a>
  );
}

function MenuIcon(props: { open: boolean }) {
  return (
    <svg
      class="h-6 w-6 text-ink-heading"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <Show when={props.open} fallback={<path d="M4 7h16M4 12h16M4 17h16" />}>
        <path d="M6 6l12 12M18 6L6 18" />
      </Show>
    </svg>
  );
}

function linkClass(active: boolean | undefined, transparent: boolean, block = false) {
  const base = block
    ? "block rounded-md px-3 py-2.5 text-base"
    : "rounded-md px-3 py-2 text-sm";

  if (active) {
    return transparent
      ? `${base} font-medium text-brand-600`
      : `${base} font-medium text-brand-600 bg-brand-50`;
  }

  return transparent
    ? `${base} text-ink-muted hover:text-ink-heading`
    : `${base} text-ink-muted hover:text-ink hover:bg-surface-muted`;
}

export function Navbar(props: NavbarProps) {
  const [local] = splitProps(props, [
    "brand",
    "links",
    "cta",
    "userEmail",
    "Link",
    "variant",
    "class",
  ]);

  const [menuOpen, setMenuOpen] = createSignal(false);
  const transparent = () => local.variant === "transparent";
  const closeMenu = () => setMenuOpen(false);

  const NavAnchor = (linkProps: NavbarLinkProps) => {
    if (local.Link) {
      return local.Link(linkProps);
    }
    return <DefaultLink {...linkProps} />;
  };

  const panelClass = () =>
    transparent()
      ? "border-border/60 bg-surface/95 backdrop-blur"
      : "border-border bg-surface";

  return (
    <header
      class={`z-50 ${
        transparent()
          ? "fixed inset-x-0 top-0 bg-transparent"
          : "sticky top-0 border-b border-border bg-surface/95 backdrop-blur"
      } ${local.class ?? ""}`}
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-4 lg:px-8">
        <NavAnchor
          href={local.brand.href}
          class="flex min-w-0 max-w-[min(100%,16rem)] items-center gap-2.5 sm:max-w-none sm:gap-3"
          onClick={closeMenu}
        >
          <Show when={local.brand.logo}>
            {(logo) => (
              <img
                src={logo().src}
                alt={logo().alt}
                class="h-8 w-8 shrink-0 object-contain sm:h-9 sm:w-9"
                width="36"
                height="36"
                loading="eager"
                decoding="async"
              />
            )}
          </Show>
          <span class="truncate text-base font-semibold tracking-tight text-ink-heading sm:text-lg">
            {local.brand.name}
          </span>
        </NavAnchor>

        <nav
          class="hidden items-center gap-1 md:flex lg:gap-2"
          aria-label="Main navigation"
        >
          {local.links.map((link) => (
            <NavAnchor href={link.href} class={linkClass(link.active, transparent())}>
              {link.label}
            </NavAnchor>
          ))}

          <Show
            when={local.userEmail}
            fallback={
              <Show when={local.cta}>
                {(cta) => (
                  <Button
                    href={cta().href}
                    variant="primary"
                    class="ml-1 px-4 py-2 text-sm lg:ml-2"
                  >
                    {cta().label}
                  </Button>
                )}
              </Show>
            }
          >
            <span class="ml-2 max-w-40 truncate text-sm text-ink-muted lg:max-w-none">
              {local.userEmail}
            </span>
          </Show>
        </nav>

        <button
          type="button"
          class="inline-flex shrink-0 items-center justify-center rounded-md p-2 transition-colors hover:bg-surface-muted md:hidden"
          aria-expanded={menuOpen()}
          aria-controls="mobile-nav"
          aria-label={menuOpen() ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen()} />
        </button>
      </div>

      <Show when={menuOpen()}>
        <nav
          id="mobile-nav"
          class={`border-t px-4 py-3 md:hidden ${panelClass()}`}
          aria-label="Mobile navigation"
        >
          <div class="mx-auto flex max-w-6xl flex-col gap-1">
            {local.links.map((link) => (
              <NavAnchor
                href={link.href}
                class={linkClass(link.active, transparent(), true)}
                onClick={closeMenu}
              >
                {link.label}
              </NavAnchor>
            ))}

            <Show
              when={local.userEmail}
              fallback={
                <Show when={local.cta}>
                  {(cta) => (
                    <Button
                      href={cta().href}
                      variant="primary"
                      class="mt-2 w-full px-4 py-2.5 text-sm"
                      onClick={closeMenu}
                    >
                      {cta().label}
                    </Button>
                  )}
                </Show>
              }
            >
              <span class="px-3 py-2.5 text-sm text-ink-muted">{local.userEmail}</span>
            </Show>
          </div>
        </nav>
      </Show>
    </header>
  );
}
