import {
  createSignal,
  For,
  JSX,
  onCleanup,
  onMount,
  Show,
  splitProps,
} from "solid-js";
import { AnimatePresence, motion } from "motion-solid";
import { ClockIcon, MapPinIcon, PhoneIcon, SocialIcon } from "../icons/footer-icons";
import { springSnappy } from "../motion/presets";

export type NavLink = {
  href: string;
  label: string;
  active?: boolean;
  children?: readonly NavLink[];
};

export type NavbarBrandLogo = {
  src: string;
  alt: string;
};

export type NavbarBrand = {
  name: string;
  href: string;
  logo?: NavbarBrandLogo;
  mark?: string;
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

export type UtilityBarData = {
  address: string;
  phone?: string;
  serviceTimes: string;
  social?: readonly { label: string; href: string }[];
};

export type NavbarProps = {
  brand: NavbarBrand;
  links: readonly NavLink[];
  cta?: NavbarCta;
  visitCta?: NavbarCta;
  utility?: UtilityBarData;
  userEmail?: string | null;
  userSlot?: JSX.Element;
  Link?: (props: NavbarLinkProps) => JSX.Element;
  variant?: "solid" | "transparent";
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
      class={props.class ?? "h-6 w-6"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <Show when={props.open} fallback={<path d="M4 7h16M4 12h16M4 17h16" />}>
        <path d="M6 6l12 12M18 6L6 18" />
      </Show>
    </svg>
  );
}

export function Navbar(props: NavbarProps) {
  const [local] = splitProps(props, [
    "brand",
    "links",
    "cta",
    "visitCta",
    "utility",
    "userEmail",
    "userSlot",
    "Link",
    "class",
  ]);

  const [menuOpen, setMenuOpen] = createSignal(false);
  const [openGroup, setOpenGroup] = createSignal<string | null>(null);
  const closeMenu = () => {
    setMenuOpen(false);
    setOpenGroup(null);
  };

  const NavAnchor = (linkProps: NavbarLinkProps) => {
    if (local.Link) return local.Link(linkProps);
    return <DefaultLink {...linkProps} />;
  };

  const visit = () => local.visitCta ?? local.cta;

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    onCleanup(() => window.removeEventListener("keydown", onKey));
  });

  return (
    <header class={`grace-nav sticky top-0 z-50 bg-white ${local.class ?? ""}`}>
      <Show when={local.utility}>
        {(bar) => (
          <div class="utility-bar">
            <div class="container py-2 type-meta text-white">
              <p class="flex items-center justify-center gap-1.5 sm:hidden">
                <ClockIcon class="h-3.5 w-3.5 shrink-0 text-[var(--color-gold-100)]" />
                <span>
                  {bar().serviceTimes}
                  <span class="text-white/80"> · {bar().address}</span>
                </span>
              </p>
              <div class="hidden items-center justify-between gap-2 sm:flex">
                <p class="inline-flex items-center gap-1.5">
                  <MapPinIcon class="h-3.5 w-3.5 text-[var(--color-gold-100)]" />
                  <span>{bar().address}</span>
                </p>
                <Show when={bar().phone}>
                  {(phone) => (
                    <a
                      class="inline-flex min-h-11 items-center gap-1.5 text-white hover:text-[var(--color-gold-100)]"
                      href={`tel:${phone().replace(/\s/g, "")}`}
                    >
                      <PhoneIcon class="h-3.5 w-3.5 text-[var(--color-gold-100)]" />
                      {phone()}
                    </a>
                  )}
                </Show>
                <div class="flex items-center gap-3">
                  <p class="inline-flex items-center gap-1.5">
                    <ClockIcon class="h-3.5 w-3.5 text-[var(--color-gold-100)]" />
                    {bar().serviceTimes}
                  </p>
                  <Show when={bar().social && bar().social!.length > 0}>
                    <ul class="hidden items-center gap-2 md:flex">
                      <For each={bar().social}>
                        {(s) => (
                          <li>
                            <a
                              href={s.href}
                              class="inline-flex h-11 w-11 items-center justify-center text-white hover:text-[var(--color-gold-100)]"
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={s.label}
                            >
                              <SocialIcon label={s.label} class="h-4 w-4" />
                            </a>
                          </li>
                        )}
                      </For>
                    </ul>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        )}
      </Show>

      <div class="border-b border-[var(--color-border)] bg-white">
        <div class="container flex items-center justify-between gap-3 py-3 lg:py-4">
          <NavAnchor
            href={local.brand.href}
            class="flex min-w-0 items-center gap-2.5 text-[var(--color-navy-900)] focus-visible:outline-none"
            onClick={closeMenu}
          >
            <Show when={local.brand.logo}>
              {(logo) => (
                <img
                  src={logo().src}
                  alt={logo().alt}
                  class="h-10 w-auto shrink-0 object-contain sm:h-12"
                  loading="eager"
                  decoding="async"
                />
              )}
            </Show>
            <span
              class={`type-mark text-[var(--color-navy-900)] ${
                local.brand.logo ? "max-[360px]:hidden" : ""
              }`}
            >
              {local.brand.mark ?? local.brand.name}
            </span>
          </NavAnchor>

          <nav class="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            <For each={local.links}>
              {(link) => (
                <Show
                  when={link.children && link.children.length > 0}
                  fallback={
                    <NavAnchor
                      href={link.href}
                      class={`type-nav relative px-3 py-2 text-[var(--color-navy-900)] transition-colors hover:text-[var(--color-gold-600)] ${
                        link.active ? "nav-link-active" : ""
                      }`}
                    >
                      {link.label}
                    </NavAnchor>
                  }
                >
                  <div class="group relative">
                    <button
                      type="button"
                      class="type-nav inline-flex min-h-11 items-center gap-1 px-3 py-2 text-[var(--color-navy-900)] hover:text-[var(--color-gold-600)]"
                      aria-haspopup="true"
                    >
                      {link.label}
                      <span aria-hidden="true">▾</span>
                    </button>
                    <div class="invisible absolute left-0 top-full z-20 min-w-48 rounded-lg border border-[var(--color-border)] bg-white py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      <For each={link.children}>
                        {(child) => (
                          <NavAnchor
                            href={child.href}
                            class="type-nav block px-4 py-2 text-[var(--color-text-body)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-navy-900)]"
                          >
                            {child.label}
                          </NavAnchor>
                        )}
                      </For>
                    </div>
                  </div>
                </Show>
              )}
            </For>
          </nav>

          <div class="hidden items-center gap-2 lg:flex">
            <Show when={local.userSlot ?? local.userEmail} fallback={
              <Show when={local.cta && local.visitCta}>
                <NavAnchor
                  href={local.cta!.href}
                  class="type-nav px-3 py-2 text-[var(--color-navy-900)] hover:text-[var(--color-gold-600)]"
                >
                  {local.cta!.label}
                </NavAnchor>
              </Show>
            }>
              <Show when={local.userSlot} fallback={<span class="type-meta text-[var(--color-text-muted)]">{local.userEmail}</span>}>
                {local.userSlot}
              </Show>
            </Show>
            <Show when={visit()}>
              {(cta) => (
                <NavAnchor href={cta().href} class="btn-gold">
                  {cta().label}
                </NavAnchor>
              )}
            </Show>
          </div>

          <button
            type="button"
            class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[var(--color-navy-900)] hover:bg-[var(--color-bg-muted)] lg:hidden"
            aria-expanded={menuOpen()}
            aria-controls="mobile-nav"
            aria-label={menuOpen() ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen()} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        <Show when={menuOpen()}>
          <motion.nav
            id="mobile-nav"
            class="overflow-hidden border-b border-[var(--color-border)] bg-white px-4 py-3 lg:hidden"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={springSnappy}
          >
            <div class="container flex flex-col gap-1">
              <For each={local.links}>
                {(link) => (
                  <Show
                    when={link.children && link.children.length > 0}
                    fallback={
                      <NavAnchor
                        href={link.href}
                        class="type-item-title block min-h-11 rounded-md px-3 py-2.5 text-[var(--color-navy-900)]"
                        onClick={closeMenu}
                      >
                        {link.label}
                      </NavAnchor>
                    }
                  >
                    <div>
                      <button
                        type="button"
                        class="type-item-title flex min-h-11 w-full items-center justify-between px-3 py-2.5 text-left text-[var(--color-navy-900)]"
                        aria-expanded={openGroup() === link.label}
                        onClick={() =>
                          setOpenGroup((g) => (g === link.label ? null : link.label))
                        }
                      >
                        {link.label}
                        <span aria-hidden="true">▾</span>
                      </button>
                      <Show when={openGroup() === link.label}>
                        <For each={link.children}>
                          {(child) => (
                            <NavAnchor
                              href={child.href}
                              class="type-caption block min-h-11 px-6 py-2 text-[var(--color-text-body)]"
                              onClick={closeMenu}
                            >
                              {child.label}
                            </NavAnchor>
                          )}
                        </For>
                      </Show>
                    </div>
                  </Show>
                )}
              </For>
              <Show when={local.cta}>
                {(cta) => (
                  <NavAnchor
                    href={cta().href}
                    class="type-item-title mt-1 block min-h-11 rounded-md px-3 py-2.5 text-[var(--color-navy-900)]"
                    onClick={closeMenu}
                  >
                    {cta().label}
                  </NavAnchor>
                )}
              </Show>
              <Show when={visit()}>
                {(cta) => (
                  <NavAnchor href={cta().href} class="btn-gold mt-2 w-full" onClick={closeMenu}>
                    {cta().label}
                  </NavAnchor>
                )}
              </Show>
              <Show when={local.userSlot}>
                <div class="mt-2" onClick={closeMenu}>
                  {local.userSlot}
                </div>
              </Show>
            </div>
          </motion.nav>
        </Show>
      </AnimatePresence>
    </header>
  );
}
