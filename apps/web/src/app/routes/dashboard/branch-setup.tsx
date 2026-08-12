import { useNavigate } from "@solidjs/router";
import { createEffect, createResource, createSignal, Show } from "solid-js";
import { CtaButton } from "@church/ui/cta-button";
import { authClient, isBranchAdmin } from "~/lib/auth-client";
import { useAuthSession } from "~/app/stores/session";
import { DashboardShell } from "./DashboardShell";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 48);
}

export function DashboardBranchSetupPage() {
  const navigate = useNavigate();
  const sessionState = useAuthSession();
  const user = () => sessionState()?.data?.user ?? null;
  const [name, setName] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  createEffect(() => {
    if (!sessionState()?.isPending && user() && !isBranchAdmin(user())) {
      navigate("/dashboard", { replace: true });
    }
  });

  const [existing] = createResource(user, async (u) => {
    if (!u || !isBranchAdmin(u)) return null;
    const { data } = await authClient.organization.list();
    return data?.[0] ?? null;
  });

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    const { data, error: err } = await authClient.organization.create({
      name: name().trim(),
      slug: slug().trim() || slugify(name()),
    });
    setPending(false);
    if (err) {
      setError(err.message ?? "Could not create branch");
      return;
    }
    if (data?.id) {
      await authClient.organization.setActive({ organizationId: data.id });
    }
    navigate("/dashboard/accounts");
  };

  return (
    <DashboardShell
      title="Branch setup"
      description="Create your church branch. The slug becomes /board/{slug}."
    >
      <Show
        when={!existing()}
        fallback={
          <div class="border-border bg-surface rounded-xl border p-6 shadow-sm">
            <p class="text-ink">
              Branch already set: <strong>{existing()?.name}</strong> (
              <code>{existing()?.slug}</code>).
            </p>
            <p class="text-ink-muted mt-2 text-sm">
              Phase 1 allows one branch per branch admin. Contact a super admin to change it.
            </p>
          </div>
        }
      >
        <form class="border-border bg-surface mx-auto flex max-w-lg flex-col gap-4 rounded-xl border p-6 shadow-sm" onSubmit={onSubmit}>
          <div>
            <label for="branch-name" class="text-ink-heading mb-1.5 block text-sm font-medium">
              Branch display name
            </label>
            <input
              id="branch-name"
              required
              aria-required="true"
              class="border-border focus-visible:ring-accent-500 w-full rounded-lg border px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              value={name()}
              onInput={(e) => {
                setName(e.currentTarget.value);
                if (!slug()) setSlug(slugify(e.currentTarget.value));
              }}
              placeholder="CFC Binalban"
            />
          </div>
          <div>
            <label for="branch-slug" class="text-ink-heading mb-1.5 block text-sm font-medium">
              URL slug
            </label>
            <input
              id="branch-slug"
              required
              aria-required="true"
              pattern="[a-z0-9]+"
              class="border-border focus-visible:ring-accent-500 w-full rounded-lg border px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              value={slug()}
              onInput={(e) => setSlug(slugify(e.currentTarget.value))}
              placeholder="cfcbinalban"
            />
            <p class="text-ink-subtle mt-1 text-xs">
              Public board will be /board/{slug() || "cfcbinalban"}
            </p>
          </div>
          <Show when={error()}>
            <p role="alert" class="text-sm text-red-600">
              {error()}
            </p>
          </Show>
          <CtaButton type="submit" variant="cta" disabled={pending()}>
            {pending() ? "Creating…" : "Create branch"}
          </CtaButton>
        </form>
      </Show>
    </DashboardShell>
  );
}
