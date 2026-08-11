import { A } from "@solidjs/router";
import { createResource } from "solid-js";
import { AdminShell } from "~/admin/AdminShell";
import { adminApi } from "~/admin/api";

export function AdminPage() {
  const [articles] = createResource(() => adminApi.listArticles().catch(() => []));
  const [activities] = createResource(() => adminApi.listActivities().catch(() => []));
  const [board] = createResource(() => adminApi.getBoard().catch(() => null));
  const [assets] = createResource(() => adminApi.listAssets().catch(() => []));

  return (
    <AdminShell title="Overview">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Articles" value={articles()?.length ?? "—"} href="/admin/articles" />
        <StatCard
          label="Ministries"
          value={board()?.ministries.length ?? "—"}
          href="/admin/board"
        />
        <StatCard
          label="Activities"
          value={activities()?.length ?? "—"}
          href="/admin/activities"
        />
        <StatCard label="Assets" value={assets()?.length ?? "—"} href="/admin/assets" />
      </div>

      <section class="mt-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Build</h2>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Use Articles, Board, and Activities to manage site content. GrapesJS editors save HTML
          plus project JSON to Neon. Media uploads go to Cloudinary and are indexed for reuse.
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <A href="/admin/articles" class="admin-btn">
            Articles
          </A>
          <A href="/admin/board" class="admin-btn">
            Board
          </A>
          <A href="/admin/activities" class="admin-btn">
            Activities
          </A>
          <A href="/admin/assets" class="admin-btn-secondary">
            Media library
          </A>
        </div>
      </section>
    </AdminShell>
  );
}

function StatCard(props: { label: string; value: string | number; href: string }) {
  return (
    <A
      href={props.href}
      class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-400"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-450 text-slate-500">
        {props.label}
      </p>
      <p class="mt-2 font-display text-3xl font-light text-slate-950">{props.value}</p>
    </A>
  );
}
