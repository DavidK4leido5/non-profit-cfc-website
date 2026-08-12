import { createEffect, createResource, createSignal, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { CtaButton } from "@church/ui/cta-button";
import { authClient, isSuperAdmin } from "~/lib/auth-client";
import { useAuthSession } from "~/app/stores/session";
import { DashboardShell } from "./DashboardShell";

type ListedUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
};

export function DashboardUsersPage() {
  const navigate = useNavigate();
  const sessionState = useAuthSession();
  const user = () => sessionState()?.data?.user ?? null;
  const [message, setMessage] = createSignal<string | null>(null);
  const [busyId, setBusyId] = createSignal<string | null>(null);

  createEffect(() => {
    if (!sessionState()?.isPending && user() && !isSuperAdmin(user())) {
      navigate("/dashboard", { replace: true });
    }
  });

  const [users, { refetch }] = createResource(user, async (u) => {
    if (!u || !isSuperAdmin(u)) return [] as ListedUser[];
    const { data, error } = await authClient.admin.listUsers({
      query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
    });
    if (error) throw new Error(error.message);
    return (data?.users ?? []) as ListedUser[];
  });

  const setRole = async (target: ListedUser, role: "user" | "branch_admin") => {
    setBusyId(target.id);
    setMessage(null);
    const { error } = await authClient.admin.setRole({
      userId: target.id,
      role,
    });
    setBusyId(null);
    if (error) {
      setMessage(error.message ?? "Failed to update role");
      return;
    }
    setMessage(`${target.email} is now ${role}`);
    await refetch();
  };

  return (
    <DashboardShell
      title="Users"
      description="Promote members to branch admin. Only super admins can change platform roles."
    >
      <Show when={message()}>
        <p class="text-accent-700 mb-4 text-sm" role="status">
          {message()}
        </p>
      </Show>
      <div class="border-border overflow-x-auto rounded-xl border bg-surface shadow-sm">
        <table class="w-full min-w-[40rem] text-left text-sm">
          <caption class="sr-only">All platform users</caption>
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={users() ?? []}>
              {(row) => (
                <tr class="border-border border-t">
                  <td class="text-ink px-4 py-3">{row.name}</td>
                  <td class="text-ink-muted px-4 py-3">{row.email}</td>
                  <td class="text-ink px-4 py-3">{row.role ?? "user"}</td>
                  <td class="px-4 py-3">
                    <Show when={row.role !== "super_admin"}>
                      <div class="flex flex-wrap gap-2">
                        <CtaButton
                          type="button"
                          size="sm"
                          variant="cta"
                          disabled={busyId() === row.id || row.role === "branch_admin"}
                          onClick={() => setRole(row, "branch_admin")}
                        >
                          Make branch admin
                        </CtaButton>
                        <CtaButton
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={busyId() === row.id || row.role === "user"}
                          onClick={() => setRole(row, "user")}
                        >
                          Revoke
                        </CtaButton>
                      </div>
                    </Show>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
