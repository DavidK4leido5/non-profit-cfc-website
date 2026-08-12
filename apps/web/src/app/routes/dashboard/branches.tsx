import { A, useNavigate } from "@solidjs/router";
import { createEffect, createResource, For, Show } from "solid-js";
import { authClient, isSuperAdmin } from "~/lib/auth-client";
import { useAuthSession } from "~/app/stores/session";
import { DashboardShell } from "./DashboardShell";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | string;
  members?: unknown[];
};

export function DashboardBranchesPage() {
  const navigate = useNavigate();
  const sessionState = useAuthSession();
  const user = () => sessionState()?.data?.user ?? null;

  createEffect(() => {
    if (!sessionState()?.isPending && user() && !isSuperAdmin(user())) {
      navigate("/dashboard", { replace: true });
    }
  });

  const [orgs] = createResource(user, async (u) => {
    if (!u || !isSuperAdmin(u)) return [] as OrgRow[];
    // listOrganizations as admin — organization.list returns orgs for current user;
    // super_admin may not be a member of all orgs. Use admin-friendly path:
    // Better Auth doesn't expose list-all-orgs by default; query via listUser + memberships
    // For phase 1: list orgs the session can see; plus fetch via raw if needed.
    const { data } = await authClient.organization.list();
    return (data ?? []) as OrgRow[];
  });

  // Super admin should see ALL orgs — add a small auth API helper on the server.
  const [allOrgs] = createResource(user, async (u) => {
    if (!u || !isSuperAdmin(u)) return [] as OrgRow[];
    const res = await fetch("/api/auth/church/branches", { credentials: "include" });
    if (!res.ok) {
      // Fallback to organizations the user belongs to
      const { data } = await authClient.organization.list();
      return (data ?? []) as OrgRow[];
    }
    return (await res.json()) as OrgRow[];
  });

  const rows = () => allOrgs() ?? orgs() ?? [];

  return (
    <DashboardShell
      title="All branches"
      description="Every church branch organization on the platform."
    >
      <Show
        when={rows().length > 0}
        fallback={<p class="text-ink-muted">No branches have been created yet.</p>}
      >
        <div class="border-border overflow-x-auto rounded-xl border bg-surface shadow-sm">
          <table class="w-full min-w-[36rem] text-left text-sm">
            <caption class="sr-only">All church branches</caption>
            <thead class="bg-surface-muted text-ink-heading">
              <tr>
                <th scope="col" class="px-4 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" class="px-4 py-3 font-semibold">
                  Slug
                </th>
                <th scope="col" class="px-4 py-3 font-semibold">
                  Board URL
                </th>
                <th scope="col" class="px-4 py-3 font-semibold">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={rows()}>
                {(row) => (
                  <tr class="border-border border-t">
                    <td class="text-ink px-4 py-3">{row.name}</td>
                    <td class="text-ink px-4 py-3">
                      <code>{row.slug}</code>
                    </td>
                    <td class="px-4 py-3">
                      <A href={`/board/${row.slug}`} class="text-accent-600 underline">
                        /board/{row.slug}
                      </A>
                    </td>
                    <td class="text-ink-muted px-4 py-3">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </DashboardShell>
  );
}
