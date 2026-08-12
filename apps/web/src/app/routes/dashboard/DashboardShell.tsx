import { A, useNavigate } from "@solidjs/router";
import { createEffect, For, ParentProps, Show } from "solid-js";
import { CtaButton } from "@church/ui/cta-button";
import {
  authClient,
  getUserRole,
  isBranchAdmin,
  isSuperAdmin,
} from "~/lib/auth-client";
import { signOut, useAuthSession } from "~/app/stores/session";

export function DashboardShell(props: ParentProps<{ title: string; description?: string }>) {
  const navigate = useNavigate();
  const sessionState = useAuthSession();

  const user = () => sessionState()?.data?.user ?? null;
  const loading = () => Boolean(sessionState()?.isPending);

  createEffect(() => {
    if (!loading() && !user()) {
      navigate("/auth/login", { replace: true });
    }
  });

  const links = () => {
    const u = user();
    if (!u) return [];
    const items = [{ href: "/dashboard", label: "Overview" }];
    if (isBranchAdmin(u)) {
      items.push({ href: "/dashboard/accounts", label: "Accounts" });
      items.push({ href: "/dashboard/branch/setup", label: "Branch setup" });
    }
    if (isSuperAdmin(u)) {
      items.push({ href: "/dashboard/users", label: "Users" });
      items.push({ href: "/dashboard/branches", label: "All branches" });
    }
    return items;
  };

  const onSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  return (
    <div class="mx-auto max-w-page px-4 py-8 lg:px-10">
      <Show when={!loading()} fallback={<p class="text-ink-muted">Loading session…</p>}>
        <Show when={user()}>
          {(u) => (
            <>
              <header class="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p class="text-ink-subtle text-sm font-medium uppercase tracking-wide">
                    {getUserRole(u())} · {u().email}
                  </p>
                  <h1 class="text-ink-heading mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {props.title}
                  </h1>
                  <Show when={props.description}>
                    <p class="text-ink-muted mt-2 max-w-2xl">{props.description}</p>
                  </Show>
                </div>
                <CtaButton type="button" variant="secondary" size="sm" onClick={onSignOut}>
                  Sign out
                </CtaButton>
              </header>

              <nav aria-label="Dashboard" class="mb-8 flex flex-wrap gap-2">
                <For each={links()}>
                  {(link) => (
                    <A
                      href={link.href}
                      class="border-border text-ink hover:bg-surface-muted focus-visible:ring-accent-500 inline-flex min-h-11 items-center rounded-md border px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      activeClass="bg-accent-50 text-accent-700 border-accent-200"
                    >
                      {link.label}
                    </A>
                  )}
                </For>
              </nav>

              {props.children}
            </>
          )}
        </Show>
      </Show>
    </div>
  );
}
