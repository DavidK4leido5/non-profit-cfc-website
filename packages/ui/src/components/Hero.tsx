import { JSX, Show } from "solid-js";
import { Button } from "./Button";

export type HeroCta = {
  label: string;
  href: string;
};

export type HeroProps = {
  eyebrow: string;
  headline: string;
  subcopy: string;
  primaryCta: HeroCta;
  secondaryCta?: HeroCta;
  preview?: JSX.Element;
  class?: string;
};

export function Hero(props: HeroProps) {
  return (
    <section class={`bg-hero-gradient ${props.class ?? ""}`}>
      <div class="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-20 sm:gap-10 sm:pb-16 sm:pt-24 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:pb-24 lg:pt-28">
        <div class="text-center lg:text-left">
          <p class="text-brand-600 text-xs font-medium uppercase tracking-wider sm:text-sm">
            {props.eyebrow}
          </p>
          <h1 class="text-ink-heading mt-3 text-3xl font-semibold tracking-tight sm:mt-4 sm:text-4xl md:text-5xl lg:text-6xl">
            {props.headline}
          </h1>
          <p class="text-ink-muted mx-auto mt-4 max-w-xl text-base leading-relaxed sm:mt-6 sm:text-lg lg:mx-0">
            {props.subcopy}
          </p>
          <div class="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4 lg:justify-start">
            <Button href={props.primaryCta.href} variant="primary" class="w-full sm:w-auto">
              {props.primaryCta.label}
            </Button>
            <Show when={props.secondaryCta}>
              {(cta) => (
                <Button href={cta().href} variant="secondary" class="w-full sm:w-auto">
                  {cta().label}
                </Button>
              )}
            </Show>
          </div>
        </div>

        <Show when={props.preview}>
          <div class="flex justify-center lg:justify-end">{props.preview}</div>
        </Show>
      </div>
    </section>
  );
}
