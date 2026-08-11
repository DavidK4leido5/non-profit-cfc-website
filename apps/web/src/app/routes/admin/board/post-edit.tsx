import { useParams } from "@solidjs/router";
import { Editor } from "grapesjs";
import { Show, createEffect, createResource, createSignal } from "solid-js";
import { AdminShell } from "~/admin/AdminShell";
import { adminApi } from "~/admin/api";
import { GrapesEditor, getEditorPayload } from "~/admin/grapes/Editor";

export function AdminBoardPostEditPage() {
  const params = useParams();
  const [post] = createResource(() => adminApi.getPost(params.id!));

  const [title, setTitle] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [body, setBody] = createSignal("");
  const [dateLabel, setDateLabel] = createSignal("");
  const [tag, setTag] = createSignal("");
  const [imageSrc, setImageSrc] = createSignal("");
  const [status, setStatus] = createSignal<"draft" | "published">("draft");
  const [pinned, setPinned] = createSignal(false);
  const [editor, setEditor] = createSignal<Editor>();
  const [error, setError] = createSignal("");
  const [hydrated, setHydrated] = createSignal(false);

  createEffect(() => {
    const data = post();
    if (!data || hydrated()) return;
    setTitle(data.title);
    setSlug(data.slug);
    setBody(data.body);
    setDateLabel(data.dateLabel);
    setTag(data.tag ?? "");
    setImageSrc(data.imageSrc ?? "");
    setStatus(data.status);
    setPinned(data.pinned);
    setHydrated(true);
  });

  const save = async () => {
    setError("");
    const ed = editor();
    const payload = ed ? getEditorPayload(ed) : { bodyHtml: "", bodyGjs: null };
    try {
      await adminApi.updatePost(params.id!, {
        title: title().trim(),
        slug: slug().trim(),
        body: body().trim(),
        dateLabel: dateLabel().trim(),
        tag: tag().trim() || undefined,
        imageSrc: imageSrc().trim() || undefined,
        pinned: pinned(),
        status: status(),
        bodyHtml: payload.bodyHtml,
        bodyGjs: payload.bodyGjs,
        sortOrder: post()?.sortOrder ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <AdminShell
      title="Edit board post"
      actions={
        <button type="button" class="admin-btn" onClick={() => void save()}>
          Save
        </button>
      }
    >
      <Show when={!post.loading}>
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
            <span>Short body</span>
            <input value={body()} onInput={(e) => setBody(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Date label</span>
            <input value={dateLabel()} onInput={(e) => setDateLabel(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Tag</span>
            <input value={tag()} onInput={(e) => setTag(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Image URL</span>
            <input value={imageSrc()} onInput={(e) => setImageSrc(e.currentTarget.value)} />
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
          <label class="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pinned()}
              onChange={(e) => setPinned(e.currentTarget.checked)}
            />
            Pinned / featured
          </label>
        </div>
        <GrapesEditor
          initialHtml={post()?.bodyHtml}
          initialProject={post()?.bodyGjs}
          onReady={setEditor}
        />
      </Show>
    </AdminShell>
  );
}
