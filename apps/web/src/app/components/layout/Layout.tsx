import { A, useLocation } from "@solidjs/router";
import { ParentProps, Show } from "solid-js";
import { session } from "~/app/stores/session";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/board", label: "Board" },
  { href: "/resources", label: "Resources" },
  { href: "/admin", label: "Admin" },
];

export function Layout(props: ParentProps) {
  const location = useLocation();

  return (
    <div class="min-h-screen bg-stone-50 text-stone-900">
      <header class="border-b border-stone-200 bg-white">
        <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <A href="/" class="text-lg font-semibold tracking-tight">
            Church
          </A>
          <nav class="flex flex-wrap items-center gap-4 text-sm">
            {navLinks.map((link) => (
              <A
                href={link.href}
                class="hover:text-stone-600"
                classList={{
                  "font-medium text-stone-900": location.pathname === link.href,
                  "text-stone-500": location.pathname !== link.href,
                }}
              >
                {link.label}
              </A>
            ))}
            <Show
              when={session.user}
              fallback={
                <A href="/auth/login" class="rounded-md bg-stone-900 px-3 py-1.5 text-white">
                  Sign in
                </A>
              }
            >
              <span class="text-stone-600">{session.user?.email}</span>
            </Show>
          </nav>
        </div>
      </header>
      <main class="mx-auto max-w-5xl px-4 py-8">{props.children}</main>
    </div>
  );
}
