import { A } from "@solidjs/router";
import { JSX, ParentProps, Show } from "solid-js";
import { siteContent } from "~/content/site.content";

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-muted transition-colors focus-visible:border-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function authFieldClass() {
  return fieldClass;
}

export function authMutedLinkClass() {
  return "text-xs font-medium text-accent-600 hover:text-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500";
}

export function authIconButtonClass() {
  return "absolute inset-y-0 right-0 inline-flex min-w-11 items-center justify-center text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500";
}

export function authSocialButtonClass() {
  return "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-60";
}

export function authDividerClass() {
  return "my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-ink-muted";
}

type AuthSplitShellProps = ParentProps<{
  title: string;
  alternate: { prompt: string; label: string; href: string };
  sideImage?: { src: string; alt: string };
  tagline?: string;
}>;

/**
 * Auth UI: primary page background + rounded white card (image left, form right).
 */
export function AuthSplitShell(props: AuthSplitShellProps) {
  const brand = siteContent.brand;
  const auth = siteContent.auth;
  const image = () => props.sideImage ?? auth.sideImage;
  const tagline = () => props.tagline ?? auth.tagline;

  return (
    <div class="flex min-h-screen items-center justify-center bg-primary px-4 py-8 sm:px-6 lg:px-10">
      <div class="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-5 sm:px-6 lg:px-10">
        <A
          href={brand.href}
          class="font-ui inline-flex items-center gap-3 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          <Show when={brand.logo} fallback={<span>{brand.name.replace("\n", " ")}</span>}>
            {(logo) => (
              <>
                <img src={logo().src} alt="" class="h-9 w-auto object-contain" />
                <span class="hidden whitespace-pre-line text-sm font-light leading-tight sm:inline">
                  {brand.name}
                </span>
              </>
            )}
          </Show>
        </A>
        <A
          href="/"
          class="inline-flex min-h-11 items-center rounded-full border border-white/35 px-4 text-sm text-white/95 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Back to website →
        </A>
      </div>

      <div class="relative z-0 grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/25 lg:min-h-[36rem] lg:grid-cols-2">
        <aside class="relative hidden min-h-[22rem] overflow-hidden lg:block" aria-hidden="false">
          <img
            src={image().src}
            alt={image().alt}
            class="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div class="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/35 to-primary/10" />
          <div class="relative z-10 flex h-full flex-col justify-end p-8 xl:p-10">
            <p class="max-w-md font-ui text-3xl font-light leading-snug tracking-tight text-white xl:text-4xl">
              {tagline()}
            </p>
          </div>
        </aside>

        <section class="flex flex-col justify-center bg-white px-6 py-10 sm:px-10 lg:px-12">
          <header class="mb-8">
            <h1 class="font-ui text-3xl font-light tracking-tight text-ink-heading sm:text-4xl">
              {props.title}
            </h1>
            <p class="mt-3 text-sm text-ink-muted">
              {props.alternate.prompt}{" "}
              <A
                href={props.alternate.href}
                class="font-medium text-accent-600 underline-offset-2 hover:text-accent-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                {props.alternate.label}
              </A>
            </p>
          </header>
          {props.children}
        </section>
      </div>
    </div>
  );
}

export function AuthLabel(props: { for: string; children: JSX.Element }) {
  return (
    <label for={props.for} class="mb-1.5 block text-sm font-medium text-ink-heading">
      {props.children}
    </label>
  );
}

export function AuthError(props: { id?: string; message: string | null }) {
  return (
    <Show when={props.message}>
      {(msg) => (
        <p id={props.id} role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {msg()}
        </p>
      )}
    </Show>
  );
}

export function AuthNotice(props: { message: string | null }) {
  return (
    <Show when={props.message}>
      {(msg) => (
        <p role="status" class="rounded-lg bg-accent-50 px-3 py-2 text-sm text-accent-700">
          {msg()}
        </p>
      )}
    </Show>
  );
}
