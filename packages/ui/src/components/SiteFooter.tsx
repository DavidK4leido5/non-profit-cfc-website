import { For, Show } from "solid-js";
import { EmailIcon, MapPinIcon, PhoneIcon, SocialIcon } from "../icons/footer-icons";

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
};

export type SiteFooterProps = {
  churchName: string;
  logo: SiteFooterLogo;
  g12Logo?: SiteFooterLogo;
  contact: SiteFooterContact;
  social?: readonly SiteFooterSocialLink[];
  copyright: string;
  class?: string;
};

function ContactIcon(props: { children: unknown }) {
  return (
    <div class="bg-brand-900/60 text-brand-200 mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full">
      {props.children}
    </div>
  );
}

export function SiteFooter(props: SiteFooterProps) {
  return (
    <footer class={`border-t border-border bg-brand-950 text-on-hero-subtle ${props.class ?? ""}`}>
      <div class="mx-auto max-w-page px-4 py-14 sm:py-16 lg:px-10">
        <div class="flex flex-col items-center gap-10 sm:gap-12">
          <div class="flex w-full max-w-3xl flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-8 lg:gap-12">
            <img
              src={props.logo.src}
              alt={props.logo.alt}
              class="h-16 w-auto shrink-0 object-contain sm:h-20 lg:h-24"
              loading="lazy"
              decoding="async"
            />

            <div class="flex flex-col items-center text-center sm:flex-1">
              <p class="text-on-hero text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {props.churchName}
              </p>
            </div>

            <Show when={props.g12Logo}>
              {(g12) => (
                <img
                  src={g12().src}
                  alt={g12().alt}
                  class="h-14 w-auto shrink-0 rounded-lg object-contain sm:h-16 lg:h-20"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </Show>
          </div>

          <div
            class="border-on-hero/10 w-full max-w-3xl border-t pt-10"
            aria-label="Contact information"
          >
            <div class="grid gap-8 text-center sm:grid-cols-3 sm:gap-6">
              <Show when={props.contact.email}>
                {(email) => (
                  <div class="flex flex-col items-center">
                    <ContactIcon>
                      <EmailIcon class="h-7 w-7" />
                    </ContactIcon>
                    <p class="text-on-hero-subtle mb-1.5 text-sm font-medium uppercase tracking-wider">
                      Email
                    </p>
                    <a
                      href={`mailto:${email()}`}
                      class="text-on-hero hover:text-brand-200 text-base transition-colors sm:text-lg"
                    >
                      {email()}
                    </a>
                  </div>
                )}
              </Show>
              <Show when={props.contact.phone}>
                {(phone) => (
                  <div class="flex flex-col items-center">
                    <ContactIcon>
                      <PhoneIcon class="h-7 w-7" />
                    </ContactIcon>
                    <p class="text-on-hero-subtle mb-1.5 text-sm font-medium uppercase tracking-wider">
                      Phone
                    </p>
                    <a
                      href={`tel:${phone().replace(/\s/g, "")}`}
                      class="text-on-hero hover:text-brand-200 text-base transition-colors sm:text-lg"
                    >
                      {phone()}
                    </a>
                  </div>
                )}
              </Show>
              <Show when={props.contact.address}>
                {(address) => (
                  <div class="flex flex-col items-center">
                    <ContactIcon>
                      <MapPinIcon class="h-7 w-7" />
                    </ContactIcon>
                    <p class="text-on-hero-subtle mb-1.5 text-sm font-medium uppercase tracking-wider">
                      Find us
                    </p>
                    <p class="text-on-hero text-base sm:text-lg">{address()}</p>
                  </div>
                )}
              </Show>
            </div>
          </div>

          <Show when={props.social && props.social.length > 0}>
            <ul class="flex flex-wrap items-center justify-center gap-3">
              <For each={props.social}>
                {(link) => (
                  <li>
                    <a
                      href={link.href}
                      class="text-on-hero-muted hover:text-on-hero hover:bg-brand-900/70 inline-flex h-12 w-12 items-center justify-center rounded-full transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                    >
                      <SocialIcon label={link.label} class="h-6 w-6" />
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </Show>

          <p class="text-on-hero-subtle text-sm sm:text-base">{props.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
