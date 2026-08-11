import { For, Show, createResource, createSignal } from "solid-js";
import { AdminShell } from "~/admin/AdminShell";
import { adminApi, type Asset } from "~/admin/api";

export function AdminAssetsPage() {
  const [assets, { refetch }] = createResource(() => adminApi.listAssets());
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal("");

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        await adminApi.uploadAsset(file);
      }
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (asset: Asset) => {
    if (!confirm(`Delete ${asset.originalFilename ?? asset.publicId}?`)) return;
    await adminApi.deleteAsset(asset.id);
    await refetch();
  };

  return (
    <AdminShell
      title="Assets"
      actions={
        <label class="admin-btn cursor-pointer">
          {busy() ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/*"
            class="hidden"
            multiple
            disabled={busy()}
            onChange={(e) => {
              void onUpload(e.currentTarget.files);
              e.currentTarget.value = "";
            }}
          />
        </label>
      }
    >
      <Show when={error()}>
        <p class="mb-4 text-sm text-red-600">{error()}</p>
      </Show>

      <Show
        when={(assets() ?? []).length > 0}
        fallback={<p class="text-sm text-slate-500">No assets yet. Upload an image to get started.</p>}
      >
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <For each={assets()}>
            {(asset) => (
              <figure class="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <img
                  src={asset.secureUrl}
                  alt={asset.originalFilename ?? asset.publicId}
                  class="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
                <figcaption class="space-y-2 p-3">
                  <p class="truncate text-xs text-slate-600">
                    {asset.originalFilename ?? asset.publicId}
                  </p>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="text-xs font-medium text-slate-700 underline"
                      onClick={() => void navigator.clipboard.writeText(asset.secureUrl)}
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      class="text-xs font-medium text-red-600 underline"
                      onClick={() => void onDelete(asset)}
                    >
                      Delete
                    </button>
                  </div>
                </figcaption>
              </figure>
            )}
          </For>
        </div>
      </Show>
    </AdminShell>
  );
}
