import { A, useNavigate, useParams } from "@solidjs/router";
import { For, Show, createResource } from "solid-js";
import { AdminShell } from "~/admin/AdminShell";
import { adminApi } from "~/admin/api";

export function AdminBoardPostsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const ministryId = () => params.ministryId!;

  const [posts, { refetch }] = createResource(() => adminApi.listPosts(ministryId()));

  const createPost = async () => {
    const slug = prompt("Post slug (e.g. youth-camp)");
    const title = prompt("Post title");
    if (!slug || !title) return;
    const created = await adminApi.createPost(ministryId(), {
      slug,
      title,
      body: "",
      bodyHtml: "",
      dateLabel: "",
      pinned: false,
      sortOrder: 0,
      status: "draft",
    });
    navigate(`/admin/board/posts/${created.id}/edit`);
  };

  return (
    <AdminShell
      title="Board posts"
      actions={
        <div class="flex gap-2">
          <A href="/admin/board" class="admin-btn-secondary">
            Back
          </A>
          <button type="button" class="admin-btn" onClick={() => void createPost()}>
            New post
          </button>
        </div>
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
              when={(posts() ?? []).length > 0}
              fallback={
                <tr>
                  <td class="px-4 py-8 text-slate-500" colspan="4">
                    No posts yet.
                  </td>
                </tr>
              }
            >
              <For each={posts()}>
                {(post) => (
                  <tr class="border-b border-slate-100">
                    <td class="px-4 py-3 font-medium">{post.title}</td>
                    <td class="px-4 py-3 text-slate-500">{post.slug}</td>
                    <td class="px-4 py-3">
                      <span class="rounded bg-slate-100 px-2 py-0.5 text-xs">{post.status}</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <A
                        href={`/admin/board/posts/${post.id}/edit`}
                        class="mr-3 text-xs font-medium underline"
                      >
                        Edit
                      </A>
                      <button
                        type="button"
                        class="text-xs font-medium text-red-600 underline"
                        onClick={async () => {
                          if (!confirm("Delete this post?")) return;
                          await adminApi.deletePost(post.id);
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
