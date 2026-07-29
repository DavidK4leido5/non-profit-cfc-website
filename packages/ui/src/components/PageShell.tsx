import { JSX } from "solid-js";

export type PageShellProps = {
  title: string;
  description: string;
  children?: JSX.Element;
};

export function PageShell(props: PageShellProps) {
  return (
    <section class="border-border bg-surface rounded-xl border p-8 shadow-md">
      <h1 class="text-ink-heading text-2xl font-semibold tracking-tight">
        {props.title}
      </h1>
      <p class="text-ink-muted mt-2 max-w-2xl">{props.description}</p>
      {props.children && <div class="mt-6">{props.children}</div>}
    </section>
  );
}
