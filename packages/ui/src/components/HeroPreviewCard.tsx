import { For, Show } from "solid-js";

export type HeroPreviewStat = {
  label: string;
  value: string;
};

export type HeroPreviewCardProps = {
  imageSrc: string;
  imageAlt: string;
  badge?: string;
  stats?: HeroPreviewStat[];
  class?: string;
};

export function HeroPreviewCard(props: HeroPreviewCardProps) {
  return (
    <div
      class={`border-border-brand bg-surface-elevated mx-auto w-full max-w-md overflow-hidden rounded-2xl border shadow-hero ${props.class ?? ""}`}
    >
      <div class="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        <img
          src={props.imageSrc}
          alt={props.imageAlt}
          class="h-full w-full object-cover"
          loading="eager"
        />
        <Show when={props.badge}>
          <span class="bg-brand-600 text-ink-inverse absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium">
            {props.badge}
          </span>
        </Show>
      </div>

      <Show when={props.stats && props.stats.length > 0}>
        <div class="grid grid-cols-2 gap-px bg-border">
          <For each={props.stats}>
            {(stat) => (
              <div class="bg-surface px-4 py-4">
                <p class="text-ink-heading text-lg font-semibold">{stat.value}</p>
                <p class="text-ink-subtle mt-1 text-xs">{stat.label}</p>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
