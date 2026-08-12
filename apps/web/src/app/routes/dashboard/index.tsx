import { A } from "@solidjs/router";
import { createResource, Show } from "solid-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
      title="Admin"
      description="Manage accounts, branches, and site content from one place."
    >
      <Show when={user()}>
        {(u) => (
          <Card>
            <CardHeader>
              <CardTitle>Signed in as {u().name}</CardTitle>
              <CardDescription>{u().email}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-3 text-sm text-muted-foreground">
              <Show when={isSuperAdmin(u())}>
                <p>
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
                    <p>
                      You are a branch admin.{" "}
                      <A href="/dashboard/branch/setup" class="text-accent-600 underline">
                        Set up your branch
                      </A>{" "}
                      to get a public board slug (e.g. /board/cfcbinalban).
                    </p>
                  }
                >
                  <p>
                    Active branch:{" "}
                    <strong class="text-foreground">{orgs()?.[0]?.name}</strong> (slug{" "}
                    <code>{orgs()?.[0]?.slug}</code>). View members in{" "}
                    <A href="/dashboard/accounts" class="text-accent-600 underline">
                      Accounts
                    </A>
                    .
                  </p>
                </Show>
              </Show>
              <Show when={!isBranchAdmin(u())}>
                <p>
                  You have a member account. A super admin can promote you to branch admin when
                  ready.
                </p>
              </Show>
            </CardContent>
          </Card>
        )}
      </Show>
    </DashboardShell>
  );
}
