import { A, useNavigate, useParams } from "@solidjs/router";
import { Editor } from "grapesjs";
import { For, Show, createEffect, createResource, createSignal } from "solid-js";
import { AdminShell } from "~/admin/AdminShell";
import { adminApi } from "~/admin/api";
import { GrapesEditor, getEditorPayload } from "~/admin/grapes/Editor";

export function AdminActivitiesPage() {
  const [activities, { refetch }] = createResource(() => adminApi.listActivities());

  return (
    <AdminShell
      title="Activities"
      actions={
        <A href="/admin/activities/new" class="admin-btn">
          New activity
        </A>
      }
    >
      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3 font-semibold">Name</th>
              <th class="px-4 py-3 font-semibold">Slug</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            <Show
              when={(activities() ?? []).length > 0}
              fallback={
                <tr>
                  <td class="px-4 py-8 text-slate-500" colspan="4">
                    No activities yet.
                  </td>
                </tr>
              }
            >
              <For each={activities()}>
                {(item) => (
                  <tr class="border-b border-slate-100">
                    <td class="px-4 py-3 font-medium">{item.name}</td>
                    <td class="px-4 py-3 text-slate-500">{item.slug}</td>
                    <td class="px-4 py-3">
                      <span class="rounded bg-slate-100 px-2 py-0.5 text-xs">{item.status}</span>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <A
                        href={`/admin/activities/${item.id}/edit`}
                        class="mr-3 text-xs font-medium underline"
                      >
                        Edit
                      </A>
                      <button
                        type="button"
                        class="text-xs font-medium text-red-600 underline"
                        onClick={async () => {
                          if (!confirm("Delete this activity?")) return;
                          await adminApi.deleteActivity(item.id);
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

export function AdminActivityEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const isNew = () => !params.id || params.id === "new";
  const [activity] = createResource(() =>
    isNew() ? null : adminApi.getActivity(params.id!),
  );

  const [name, setName] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [dateLabel, setDateLabel] = createSignal("");
  const [href, setHref] = createSignal("");
  const [cta, setCta] = createSignal("Learn more");
  const [imageSrc, setImageSrc] = createSignal("");
  const [imageAlt, setImageAlt] = createSignal("");
  const [icon, setIcon] = createSignal("calendar");
  const [className, setClassName] = createSignal("");
  const [status, setStatus] = createSignal<"draft" | "published">("draft");
  const [editor, setEditor] = createSignal<Editor>();
  const [error, setError] = createSignal("");
  const [hydrated, setHydrated] = createSignal(false);

  createEffect(() => {
    const data = activity();
    if (!data || hydrated()) return;
    setName(data.name);
    setSlug(data.slug);
    setDescription(data.description);
    setDateLabel(data.dateLabel);
    setHref(data.href);
    setCta(data.cta);
    setImageSrc(data.imageSrc);
    setImageAlt(data.imageAlt);
    setIcon(data.icon);
    setClassName(data.className);
    setStatus(data.status);
    setHydrated(true);
  });

  const save = async () => {
    setError("");
    const ed = editor();
    const payload = ed ? getEditorPayload(ed) : { bodyHtml: "", bodyGjs: null };
    const body = {
      name: name().trim(),
      slug: slug().trim(),
      description: description().trim(),
      dateLabel: dateLabel().trim(),
      href: href().trim(),
      cta: cta().trim(),
      imageSrc: imageSrc().trim(),
      imageAlt: imageAlt().trim(),
      icon: icon(),
      className: className().trim(),
      status: status(),
      sortOrder: activity()?.sortOrder ?? 0,
      bodyHtml: payload.bodyHtml,
      bodyGjs: payload.bodyGjs,
    };
    try {
      if (isNew()) {
        const created = await adminApi.createActivity(body);
        navigate(`/admin/activities/${created.id}/edit`);
      } else {
        await adminApi.updateActivity(params.id!, body);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <AdminShell
      title={isNew() ? "New activity" : "Edit activity"}
      actions={
        <button type="button" class="admin-btn" onClick={() => void save()}>
          Save
        </button>
      }
    >
      <Show when={!activity.loading}>
        <Show when={error()}>
          <p class="mb-4 text-sm text-red-600">{error()}</p>
        </Show>
        <div class="mb-4 grid gap-3 md:grid-cols-2">
          <label class="admin-field">
            <span>Name</span>
            <input value={name()} onInput={(e) => setName(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Slug</span>
            <input value={slug()} onInput={(e) => setSlug(e.currentTarget.value)} />
          </label>
          <label class="admin-field md:col-span-2">
            <span>Description</span>
            <input value={description()} onInput={(e) => setDescription(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Date label</span>
            <input value={dateLabel()} onInput={(e) => setDateLabel(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>CTA</span>
            <input value={cta()} onInput={(e) => setCta(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Href</span>
            <input value={href()} onInput={(e) => setHref(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Icon</span>
            <select value={icon()} onChange={(e) => setIcon(e.currentTarget.value)}>
              <option value="camp">camp</option>
              <option value="retreat">retreat</option>
              <option value="calendar">calendar</option>
              <option value="fellowship">fellowship</option>
              <option value="service">service</option>
            </select>
          </label>
          <label class="admin-field">
            <span>Image URL</span>
            <input value={imageSrc()} onInput={(e) => setImageSrc(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Image alt</span>
            <input value={imageAlt()} onInput={(e) => setImageAlt(e.currentTarget.value)} />
          </label>
          <label class="admin-field">
            <span>Grid className</span>
            <input value={className()} onInput={(e) => setClassName(e.currentTarget.value)} />
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
          initialHtml={activity()?.bodyHtml}
          initialProject={activity()?.bodyGjs}
          onReady={setEditor}
        />
      </Show>
    </AdminShell>
  );
}
