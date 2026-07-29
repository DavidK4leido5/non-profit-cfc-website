import { JSX } from "solid-js";

export type PageShellProps = {
  title: string;
  description: string;
  children?: JSX.Element;
};

export function PageShell(props: PageShellProps) {
  return (
    <section class="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
      <h1 class="text-2xl font-semibold tracking-tight">{props.title}</h1>
      <p class="mt-2 max-w-2xl text-stone-600">{props.description}</p>
      {props.children && <div class="mt-6">{props.children}</div>}
    </section>
  );
}
