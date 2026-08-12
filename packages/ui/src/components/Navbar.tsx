import {
  createSignal,
  JSX,
  onCleanup,
  onMount,
  Show,
  splitProps,
} from "solid-js";
import { AnimatePresence, motion } from "motion-solid";
import { springSnappy } from "../motion/presets";
import { CtaButton } from "./CtaButton";

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
  links: readonly NavLink[];
  cta?: NavbarCta;
  userEmail?: string | null;
  Link?: (props: NavbarLinkProps) => JSX.Element;
  /** solid = default bar; transparent = overlays hero (Bobbin-style) */
  variant?: "solid" | "transparent";
  /** Text color when variant is transparent — use light on photo heroes */
  tone?: "light" | "dark";
  class?: string;
};

function DefaultLink(props: NavbarLinkProps) {
  return (
    <a href={props.href} class={props.class} onClick={props.onClick}>
      {props.children}
    </a>
  );
}

function MenuIcon(props: { open: boolean; class?: string }) {
  return (
    <svg
      class={props.class ?? "h-6 w-6 text-ink-heading"}
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

function linkClass(
  active: boolean | undefined,
  transparent: boolean,
  tone: "light" | "dark",
  block = false,
) {
  const base = block
    ? "block rounded-md px-3 py-2.5 text-base"
    : "rounded-md px-3 py-2 text-sm";

  if (transparent && tone === "light") {
    if (active) {
      return `${base} font-medium text-white drop-shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary`;
    }
    return `${base} text-white drop-shadow-sm hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary`;
  }

  if (active) {
    return `${base} font-medium text-accent-600 bg-accent-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface`;
  }

  return `${base} text-ink-muted hover:text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface`;
}

function usesLightHeroNav(transparent: boolean, tone: "light" | "dark") {
  return transparent && tone === "light";
}

export function Navbar(props: NavbarProps) {
  const [local] = splitProps(props, [
    "brand",
    "links",
    "cta",
    "userEmail",
    "Link",
    "variant",
    "tone",
    "class",
  ]);

  const [menuOpen, setMenuOpen] = createSignal(false);
  const [scrolled, setScrolled] = createSignal(false);
  const transparent = () => local.variant === "transparent";
  const tone = () => local.tone ?? "dark";
  const closeMenu = () => setMenuOpen(false);

  onMount(() => {
    if (!transparent()) return;

    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    onCleanup(() => window.removeEventListener("scroll", onScroll));
  });

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

  const headerAnimate = () => {
    if (!transparent()) return {};

    return {
      backgroundColor: scrolled()
        ? "rgba(12, 20, 40, 0.78)"
        : "rgba(12, 20, 40, 0)",
      borderBottomColor: scrolled()
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(255, 255, 255, 0)",
      backdropFilter: scrolled() ? "blur(12px)" : "blur(0px)",
      boxShadow: scrolled()
        ? "0 4px 24px rgb(12 20 40 / 0.18)"
        : "0 0 0 rgb(0 0 0 / 0)",
    };
  };

  const lightHeroNav = () => usesLightHeroNav(transparent(), tone());

  return (
    <motion.header
      class={`z-50 ${
        transparent()
          ? "fixed inset-x-0 top-0"
          : "sticky top-0 border-b border-border bg-surface/95 backdrop-blur"
      } ${local.class ?? ""}`}
      animate={headerAnimate()}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={
        transparent()
          ? { "border-bottom-width": "1px", "border-bottom-style": "solid" }
          : undefined
      }
    >
      <Show when={lightHeroNav()}>
        <div
          class="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/60 to-transparent transition-opacity duration-300"
          classList={{ "opacity-0": scrolled() }}
          aria-hidden="true"
        />
      </Show>
      <div class="relative mx-auto flex max-w-nav items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:py-6 lg:px-12">
        <NavAnchor
          href={local.brand.href}
          class={`flex min-w-0 max-w-[min(100%,16rem)] items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:max-w-none sm:gap-3 ${
            lightHeroNav()
              ? "text-white drop-shadow-sm focus-visible:ring-white focus-visible:ring-offset-primary"
              : "text-ink-heading focus-visible:ring-accent-500 focus-visible:ring-offset-surface"
          }`}
          onClick={closeMenu}
        >
          <Show when={local.brand.logo}>
            {(logo) => (
              <img
                src={logo().src}
                alt={logo().alt}
                class="h-12 w-auto shrink-0 object-contain sm:h-16"
                loading="eager"
                decoding="async"
              />
            )}
          </Show>
          <span class="font-ui whitespace-pre-line text-base font-light leading-tight tracking-tight sm:text-lg">
            {local.brand.name}
          </span>
        </NavAnchor>

        <nav
          class="hidden items-center gap-1 md:flex lg:gap-2"
          aria-label="Main navigation"
        >
          {local.links.map((link) => (
            <NavAnchor
              href={link.href}
              class={linkClass(link.active, transparent(), tone())}
            >
              {link.label}
            </NavAnchor>
          ))}

          <Show
            when={local.userEmail}
            fallback={
              <Show when={local.cta}>
                {(cta) => (
                  <CtaButton
                    href={cta().href}
                    variant="cta"
                    size="sm"
                    class="ml-1 lg:ml-2"
                  >
                    {cta().label}
                  </CtaButton>
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
          class={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 md:hidden ${
            lightHeroNav()
              ? "hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-primary"
              : "hover:bg-surface-muted focus-visible:ring-accent-500 focus-visible:ring-offset-surface"
          }`}
          aria-expanded={menuOpen()}
          aria-controls="mobile-nav"
          aria-label={menuOpen() ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon
            open={menuOpen()}
            class={
              lightHeroNav() ? "h-6 w-6 text-white" : "h-6 w-6 text-ink-heading"
            }
          />
        </button>
      </div>

      <AnimatePresence>
        <Show when={menuOpen()}>
          <motion.nav
            id="mobile-nav"
            class={`overflow-hidden border-t px-4 py-3 md:hidden ${panelClass()}`}
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={springSnappy}
          >
            <div class="mx-auto flex max-w-nav flex-col gap-1">
              {local.links.map((link) => (
                <NavAnchor
                  href={link.href}
                  class={linkClass(link.active, false, "dark", true)}
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
                      <CtaButton
                        href={cta().href}
                        variant="cta"
                        size="sm"
                        fullWidth
                        class="mt-2"
                        onClick={closeMenu}
                      >
                        {cta().label}
                      </CtaButton>
                    )}
                  </Show>
                }
              >
                <span class="px-3 py-2.5 text-sm text-ink-muted">
                  {local.userEmail}
                </span>
              </Show>
            </div>
          </motion.nav>
        </Show>
      </AnimatePresence>
    </motion.header>
  );
}
