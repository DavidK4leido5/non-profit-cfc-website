import { For, Show } from "solid-js";
import { EmailIcon, MapPinIcon, PhoneIcon, SocialIcon, ClockIcon } from "../icons/footer-icons";

export type SiteFooterLogo = {
  src: string;
  alt: string;
};

export type SiteFooterSocialLink = {
  label: string;
  href: string;
};

export type SiteFooterContact = {
  email?: string;
  phone?: string;
  address?: string;
  serviceTimes?: string;
};

export type SiteFooterProps = {
  churchName: string;
  tagline?: string;
  logo: SiteFooterLogo;
  g12Logo?: SiteFooterLogo;
  contact: SiteFooterContact;
  social?: readonly SiteFooterSocialLink[];
  copyright: string;
  quickLinks?: readonly { href: string; label: string }[];
  ministryLinks?: readonly { href: string; label: string }[];
  legalLinks?: readonly { href: string; label: string }[];
  class?: string;
};

export function SiteFooter(props: SiteFooterProps) {
  const quick =
    props.quickLinks ??
    [
      { href: "/", label: "Home" },
      { href: "#about", label: "About Us" },
      { href: "#g12-vision", label: "Vision" },
      { href: "#events", label: "Events" },
      { href: "#give", label: "Give" },
      { href: "#contact", label: "Contact" },
    ];
  const ministries =
    props.ministryLinks ??
    [
      { href: "/board", label: "Kids" },
      { href: "/board", label: "Youth" },
      { href: "/board", label: "Young Adults" },
      { href: "/board", label: "Outreach" },
    ];

  return (
    <footer
      id="contact"
      class={`bg-[var(--color-navy-900)] text-white ${props.class ?? ""}`}
    >
      <div class="container footer-grid py-[var(--space-xl)]">
        <div class="footer-brand stack-sm min-w-0">
          <img src={props.logo.src} alt={props.logo.alt} class="h-12 w-auto object-contain" loading="lazy" />
          <p class="type-card-title text-white">
            {props.churchName}
          </p>
          <Show when={props.tagline}>
            <p class="type-caption text-white">{props.tagline}</p>
          </Show>
          <Show when={props.g12Logo}>
            {(logo) => (
              <img
                src={logo().src}
                alt={logo().alt}
                class="h-10 w-auto object-contain"
                loading="lazy"
              />
            )}
          </Show>
          <Show when={props.social && props.social.length > 0}>
            <ul class="flex gap-2">
              <For each={props.social}>
                {(link) => (
                  <li>
                    <a
                      href={link.href}
                      class="inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:text-[var(--color-gold-100)]"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                    >
                      <SocialIcon label={link.label} class="h-5 w-5" />
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>

        <div class="footer-links min-w-0">
          <h2 class="type-footer-label text-white">Quick Links</h2>
          <ul class="stack-xs mt-[var(--space-sm)]">
            <For each={quick}>
              {(link) => (
                <li>
                  <a class="type-caption inline-flex min-h-11 items-center text-white hover:text-[var(--color-gold-100)]" href={link.href}>
                    {link.label}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>

        <div class="footer-links min-w-0">
          <h2 class="type-footer-label text-white">Ministries</h2>
          <ul class="stack-xs mt-[var(--space-sm)]">
            <For each={ministries}>
              {(link) => (
                <li>
                  <a class="type-caption inline-flex min-h-11 items-center text-white hover:text-[var(--color-gold-100)]" href={link.href}>
                    {link.label}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>

        <address class="footer-contact min-w-0 not-italic">
          <h2 class="type-footer-label text-white">Contact Us</h2>
          <ul class="type-caption stack-sm mt-[var(--space-sm)]">
            <Show when={props.contact.address}>
              <li class="flex min-w-0 flex-col items-center gap-1 text-center lg:flex-row lg:items-start lg:gap-2 lg:text-left">
                <MapPinIcon class="h-4 w-4 shrink-0 text-[var(--color-gold-500)] lg:mt-0.5" />
                <span class="min-w-0 break-long">{props.contact.address}</span>
              </li>
            </Show>
            <Show when={props.contact.phone}>
              <li class="flex min-w-0 flex-col items-center gap-1 text-center lg:flex-row lg:items-start lg:gap-2 lg:text-left">
                <PhoneIcon class="h-4 w-4 shrink-0 text-[var(--color-gold-500)] lg:mt-0.5" />
                <a class="min-h-11 min-w-0 break-long py-2" href={`tel:${props.contact.phone!.replace(/\s/g, "")}`}>{props.contact.phone}</a>
              </li>
            </Show>
            <Show when={props.contact.email}>
              <li class="flex min-w-0 flex-col items-center gap-1 text-center lg:flex-row lg:items-start lg:gap-2 lg:text-left">
                <EmailIcon class="h-4 w-4 shrink-0 text-[var(--color-gold-500)] lg:mt-0.5" />
                <a class="min-h-11 min-w-0 break-long py-2" href={`mailto:${props.contact.email}`}>{props.contact.email}</a>
              </li>
            </Show>
            <Show when={props.contact.serviceTimes}>
              <li class="flex min-w-0 flex-col items-center gap-1 text-center lg:flex-row lg:items-start lg:gap-2 lg:text-left">
                <ClockIcon class="h-4 w-4 shrink-0 text-[var(--color-gold-500)] lg:mt-0.5" />
                <span class="min-w-0 break-long">{props.contact.serviceTimes}</span>
              </li>
            </Show>
          </ul>
        </address>
      </div>

      <div class="border-t border-white/15">
        <div class="footer-bar container flex flex-col gap-2 py-4 type-meta lg:flex-row lg:items-center lg:justify-between">
          <p>{props.copyright}</p>
          <Show when={(props.legalLinks ?? []).length > 0}>
            <p class="flex gap-4">
              <For each={props.legalLinks}>
                {(link) => (
                  <a class="hover:text-[var(--color-gold-100)]" href={link.href}>
                    {link.label}
                  </a>
                )}
              </For>
            </p>
          </Show>
        </div>
      </div>
    </footer>
  );
}
