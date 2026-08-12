import { createResource, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createEffect } from "solid-js";
import { authClient, isBranchAdmin } from "~/lib/auth-client";
import { useAuthSession } from "~/app/stores/session";
import { DashboardShell } from "./DashboardShell";

type MemberRow = {
  id: string;
  role: string;
  createdAt: Date | string;
  user: { id: string; name: string; email: string };
};

export function DashboardAccountsPage() {
  const navigate = useNavigate();
  const sessionState = useAuthSession();
  const user = () => sessionState()?.data?.user ?? null;

  createEffect(() => {
    if (!sessionState()?.isPending && user() && !isBranchAdmin(user())) {
      navigate("/dashboard", { replace: true });
    }
  });

  const [rows] = createResource(user, async (u) => {
    if (!u || !isBranchAdmin(u)) return [] as MemberRow[];
    const { data: orgs } = await authClient.organization.list();
    const org = orgs?.[0];
    if (!org) return [] as MemberRow[];
    await authClient.organization.setActive({ organizationId: org.id });
    const { data: full } = await authClient.organization.getFullOrganization();
    return (full?.members ?? []) as MemberRow[];
  });

  return (
    <DashboardShell
      title="Branch accounts"
      description="Members of your church branch organization."
    >
      <Show
        when={(rows() ?? []).length > 0}
        fallback={
          <p class="text-ink-muted">
            No branch yet — complete{" "}
            <a href="/dashboard/branch/setup" class="text-accent-600 underline">
              Branch setup
            </a>{" "}
            first.
          </p>
        }
      >
        <div class="border-border overflow-x-auto rounded-xl border bg-surface shadow-sm">
          <table class="w-full min-w-[36rem] text-left text-sm">
            <caption class="sr-only">Branch member accounts</caption>
            <thead class="bg-surface-muted text-ink-heading">
              <tr>
                <th scope="col" class="px-4 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" class="px-4 py-3 font-semibold">
                  Email
                </th>
                <th scope="col" class="px-4 py-3 font-semibold">
                  Role
                </th>
                <th scope="col" class="px-4 py-3 font-semibold">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={rows()}>
                {(row) => (
                  <tr class="border-border border-t">
                    <td class="text-ink px-4 py-3">{row.user.name}</td>
                    <td class="text-ink-muted px-4 py-3">{row.user.email}</td>
                    <td class="text-ink px-4 py-3">{row.role}</td>
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
