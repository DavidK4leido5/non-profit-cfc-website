import { A } from "@solidjs/router";
import { For, Show, createEffect, createResource, createSignal } from "solid-js";
import { AdminShell } from "~/admin/AdminShell";
import { adminApi, type BoardMinistry } from "~/admin/api";

export function AdminBoardPage() {
  const [board, { refetch }] = createResource(() => adminApi.getBoard());
  const [heroJson, setHeroJson] = createSignal("");
  const [error, setError] = createSignal("");
  const [hydrated, setHydrated] = createSignal(false);

  createEffect(() => {
    const data = board();
    if (!data || hydrated()) return;
    setHeroJson(JSON.stringify(data.hero ?? {}, null, 2));
    setHydrated(true);
  });

  const saveHero = async () => {
    setError("");
    try {
      const hero = JSON.parse(heroJson()) as unknown;
      await adminApi.saveBoardSettings(hero);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid hero JSON");
    }
  };

  const addMinistry = async () => {
    const slug = prompt("Ministry slug (e.g. youth)");
    const title = prompt("Ministry title");
    if (!slug || !title) return;
    await adminApi.createMinistry({
      slug,
      title,
      tagline: "",
      imageSrc: "",
      imageAlt: "",
      imageObjectPosition: "",
      sortOrder: (board()?.ministries.length ?? 0) + 1,
    });
    await refetch();
  };

  return (
    <AdminShell
      title="Board"
      actions={
        <button type="button" class="admin-btn" onClick={() => void addMinistry()}>
          Add ministry
        </button>
      }
    >
      <Show when={!board.loading}>
        <Show when={error()}>
          <p class="mb-4 text-sm text-red-600">{error()}</p>
        </Show>

        <section class="mb-8 rounded-lg border border-slate-200 bg-white p-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Board hero JSON
            </h2>
            <button type="button" class="admin-btn-secondary" onClick={() => void saveHero()}>
              Save hero
            </button>
          </div>
          <textarea
            class="min-h-40 w-full rounded border border-slate-300 bg-slate-50 p-3 font-mono text-xs"
            value={heroJson()}
            onInput={(e) => setHeroJson(e.currentTarget.value)}
          />
        </section>

        <div class="space-y-4">
          <For each={board()?.ministries ?? []}>
            {(ministry) => <MinistryCard ministry={ministry} onChange={() => void refetch()} />}
          </For>
        </div>
      </Show>
    </AdminShell>
  );
}

function MinistryCard(props: { ministry: BoardMinistry; onChange: () => void }) {
  return (
    <article class="rounded-lg border border-slate-200 bg-white p-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 class="font-display text-2xl font-light">{props.ministry.title}</h3>
          <p class="text-xs text-slate-500">{props.ministry.slug}</p>
        </div>
        <div class="flex gap-2">
          <A href={`/admin/board/${props.ministry.id}/posts`} class="admin-btn-secondary">
            Posts ({props.ministry.posts?.length ?? 0})
          </A>
          <button
            type="button"
            class="text-xs font-medium text-red-600 underline"
            onClick={async () => {
              if (!confirm(`Delete ${props.ministry.title}?`)) return;
              await adminApi.deleteMinistry(props.ministry.id);
              props.onChange();
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <p class="mt-2 text-sm text-slate-600">{props.ministry.tagline || "No tagline"}</p>
    </article>
  );
}
