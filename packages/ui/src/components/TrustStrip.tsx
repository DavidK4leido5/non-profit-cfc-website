import { For } from "solid-js";

export type TrustStripItem = {
  value: string;
  label: string;
};

export type TrustStripProps = {
  title?: string;
  items: TrustStripItem[];
  class?: string;
};

export function TrustStrip(props: TrustStripProps) {
  return (
    <section class={`border-t border-border bg-surface-subtle ${props.class ?? ""}`}>
      <div class="mx-auto max-w-6xl px-4 py-10 sm:py-12 lg:px-8">
        {props.title && (
          <p class="text-ink-subtle mb-6 text-center text-xs font-medium uppercase tracking-wider sm:mb-8 sm:text-sm">
            {props.title}
          </p>
        )}
        <div class="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
          <For each={props.items}>
            {(item) => (
              <div class="text-center">
                <p class="text-ink-heading text-xl font-semibold sm:text-2xl md:text-3xl">
                  {item.value}
                </p>
                <p class="text-ink-muted mt-1.5 text-xs leading-snug sm:mt-2 sm:text-sm">
                  {item.label}
                </p>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}
