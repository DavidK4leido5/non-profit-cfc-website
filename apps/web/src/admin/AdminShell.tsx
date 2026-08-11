import { A } from "@solidjs/router";
import { JSX, ParentProps, Show, createSignal } from "solid-js";
import { getAdminToken, setAdminToken } from "./api";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/assets", label: "Assets" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/board", label: "Board" },
  { href: "/admin/activities", label: "Activities" },
] as const;

export function AdminShell(
  props: ParentProps<{ title: string; actions?: JSX.Element }>,
) {
  const [token, setToken] = createSignal(getAdminToken());
  const [draft, setDraft] = createSignal(token());

  return (
    <div class="admin-shell min-h-dvh bg-[#f4f5f7] text-slate-900">
      <div class="mx-auto flex max-w-7xl gap-0 lg:gap-8">
        <aside class="hidden w-52 shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">
          <p class="font-ui text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-400">
            CFC Admin
          </p>
          <nav class="mt-6 flex flex-col gap-1" aria-label="Admin">
            {nav.map((item) => (
              <A
                href={item.href}
                end={item.href === "/admin"}
                class="rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                activeClass="bg-slate-900 text-white hover:bg-slate-900"
              >
                {item.label}
              </A>
            ))}
          </nav>
        </aside>

        <div class="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-0 lg:py-8">
          <div class="mb-4 flex flex-wrap gap-2 lg:hidden">
            {nav.map((item) => (
              <A
                href={item.href}
                class="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                activeClass="border-slate-900 bg-slate-900 text-white"
              >
                {item.label}
              </A>
            ))}
          </div>

          <Show when={!token()}>
            <div class="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p class="text-sm font-medium text-amber-900">Admin token required</p>
              <p class="mt-1 text-xs text-amber-800">
                Paste the same value as <code>ADMIN_API_TOKEN</code> on the API.
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <input
                  class="min-w-56 flex-1 rounded border border-amber-300 bg-white px-3 py-2 text-sm"
                  type="password"
                  value={draft()}
                  onInput={(e) => setDraft(e.currentTarget.value)}
                  placeholder="ADMIN_API_TOKEN"
                />
                <button
                  type="button"
                  class="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                  onClick={() => {
                    setAdminToken(draft().trim());
                    setToken(draft().trim());
                  }}
                >
                  Save token
                </button>
              </div>
            </div>
          </Show>

          <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 class="font-display text-3xl font-light tracking-tight text-slate-950">
                {props.title}
              </h1>
            </div>
            <Show when={props.actions}>{props.actions}</Show>
          </header>

          {props.children}
        </div>
      </div>
    </div>
  );
}
