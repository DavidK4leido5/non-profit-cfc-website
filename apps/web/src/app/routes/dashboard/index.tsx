import { A } from "@solidjs/router";
import { createResource, Show } from "solid-js";
import { authClient, isBranchAdmin, isSuperAdmin } from "~/lib/auth-client";
import { useAuthSession } from "~/app/stores/session";
import { DashboardShell } from "./DashboardShell";

export function DashboardHomePage() {
  const sessionState = useAuthSession();
  const user = () => sessionState()?.data?.user ?? null;

  const [orgs] = createResource(user, async (u) => {
    if (!u || !isBranchAdmin(u)) return [];
    const { data } = await authClient.organization.list();
    return data ?? [];
  });

  return (
    <DashboardShell
      title="Dashboard"
      description="Manage your account, branch membership, and (if permitted) branch administration."
    >
      <Show when={user()}>
        {(u) => (
          <div class="border-border bg-surface space-y-4 rounded-xl border p-6 shadow-sm">
            <p class="text-ink">
              Signed in as <strong>{u().name}</strong> ({u().email}).
            </p>
            <Show when={isSuperAdmin(u())}>
              <p class="text-ink-muted text-sm">
                You are a super admin. Promote branch admins under{" "}
                <A href="/dashboard/users" class="text-accent-600 underline">
                  Users
                </A>{" "}
                and inspect every branch under{" "}
                <A href="/dashboard/branches" class="text-accent-600 underline">
                  All branches
                </A>
                .
              </p>
            </Show>
            <Show when={isBranchAdmin(u()) && !isSuperAdmin(u())}>
              <Show
                when={(orgs() ?? []).length > 0}
                fallback={
                  <p class="text-ink-muted text-sm">
                    You are a branch admin.{" "}
                    <A href="/dashboard/branch/setup" class="text-accent-600 underline">
                      Set up your branch
                    </A>{" "}
                    to get a public board slug (e.g. /board/cfcbinalban).
                  </p>
                }
              >
                <p class="text-ink-muted text-sm">
                  Active branch:{" "}
                  <strong>{orgs()?.[0]?.name}</strong> (slug{" "}
                  <code class="text-sm">{orgs()?.[0]?.slug}</code>). View members in{" "}
                  <A href="/dashboard/accounts" class="text-accent-600 underline">
                    Accounts
                  </A>
                  .
                </p>
              </Show>
            </Show>
            <Show when={!isBranchAdmin(u())}>
              <p class="text-ink-muted text-sm">
                You have a member account. A super admin can promote you to branch admin when
                ready.
              </p>
            </Show>
          </div>
        )}
      </Show>
    </DashboardShell>
  );
}
