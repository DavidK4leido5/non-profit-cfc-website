import { useNavigate, useParams } from "@solidjs/router";
import { Editor } from "grapesjs";
import { Show, createEffect, createResource, createSignal } from "solid-js";
import { AdminShell } from "~/admin/AdminShell";
import { adminApi } from "~/admin/api";
import { GrapesEditor, getEditorPayload } from "~/admin/grapes/Editor";

export function AdminArticleEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const isNew = () => !params.id || params.id === "new";

  const [article] = createResource(() =>
    isNew() ? null : adminApi.getArticle(params.id!),
  );

  const [title, setTitle] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [excerpt, setExcerpt] = createSignal("");
  const [status, setStatus] = createSignal<"draft" | "published">("draft");
  const [coverUrl, setCoverUrl] = createSignal("");
  const [editor, setEditor] = createSignal<Editor>();
  const [error, setError] = createSignal("");
  const [hydrated, setHydrated] = createSignal(false);

  createEffect(() => {
    const data = article();
    if (!data || hydrated()) return;
    setTitle(data.title);
    setSlug(data.slug);
    setExcerpt(data.excerpt);
    setStatus(data.status);
    setCoverUrl(data.coverUrl);
    setHydrated(true);
  });

  const save = async () => {
    setError("");
    const ed = editor();
    if (!ed) {
      setError("Editor is not ready");
      return;
    }
    const payload = getEditorPayload(ed);
    const body = {
      title: title().trim(),
      slug: slug().trim(),
      excerpt: excerpt().trim(),
      coverUrl: coverUrl().trim(),
      status: status(),
      bodyHtml: payload.bodyHtml,
      bodyGjs: payload.bodyGjs,
    };
    try {
      if (isNew()) {
        const created = await adminApi.createArticle(body);
        navigate(`/admin/articles/${created.id}/edit`);
      } else {
        await adminApi.updateArticle(params.id!, body);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <AdminShell
      title={isNew() ? "New article" : "Edit article"}
      actions={
        <button type="button" class="admin-btn" onClick={() => void save()}>
          Save
        </button>
      }
    >
      <Show when={article.error}>
        <p class="mb-4 text-sm text-red-600">Failed to load article.</p>
      </Show>
      <Show when={!article.loading}>
        <Show when={error()}>
          <p class="mb-4 text-sm text-red-600">{error()}</p>
        </Show>

        <div class="mb-4 grid gap-3 md:grid-cols-2">
          <label class="admin-field">
            <span>Title</span>
            <input value={title()} onInput={(e) => setTitle(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Slug</span>
            <input value={slug()} onInput={(e) => setSlug(e.currentTarget.value)} />
          </label>
          <label class="admin-field md:col-span-2">
            <span>Excerpt</span>
            <input value={excerpt()} onInput={(e) => setExcerpt(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Cover URL</span>
            <input value={coverUrl()} onInput={(e) => setCoverUrl(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Status</span>
            <select
              value={status()}
              onChange={(e) => setStatus(e.currentTarget.value as "draft" | "published")}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>
        </div>

        <GrapesEditor
          initialHtml={article()?.bodyHtml}
          initialProject={article()?.bodyGjs}
          onReady={setEditor}
        />
      </Show>
    </AdminShell>
  );
}
