import { A } from "@solidjs/router";
import { For, Show, createResource } from "solid-js";
import { AdminShell } from "~/admin/AdminShell";
import { adminApi } from "~/admin/api";

export function AdminArticlesPage() {
  const [articles, { refetch }] = createResource(() => adminApi.listArticles());

  return (
    <AdminShell
      title="Articles"
      actions={
        <A href="/admin/articles/new" class="admin-btn">
          New article
        </A>
      }
    >
      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3 font-semibold">Title</th>
              <th class="px-4 py-3 font-semibold">Slug</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            <Show
              when={(articles() ?? []).length > 0}
              fallback={
                <tr>
                  <td class="px-4 py-8 text-slate-500" colspan="4">
                    No articles yet.
                  </td>
                </tr>
              }
            >
              <For each={articles()}>
                {(article) => (
                  <tr class="border-b border-slate-100">
                    <td class="px-4 py-3 font-medium">{article.title}</td>
                    <td class="px-4 py-3 text-slate-500">{article.slug}</td>
                    <td class="px-4 py-3">
                      <span class="rounded bg-slate-100 px-2 py-0.5 text-xs">{article.status}</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <A
                        href={`/admin/articles/${article.id}/edit`}
                        class="mr-3 text-xs font-medium underline"
                      >
                        Edit
                      </A>
                      <button
                        type="button"
                        class="text-xs font-medium text-red-600 underline"
                        onClick={async () => {
                          if (!confirm("Delete this article?")) return;
                          await adminApi.deleteArticle(article.id);
                          await refetch();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </Show>
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
