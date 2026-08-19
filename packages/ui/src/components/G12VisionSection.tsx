import { For, Show } from "solid-js";
import { QuoteIcon } from "../icons/grace-icons";

export type G12VisionStep = {
  title: string;
  description: string;
};

export type G12VisionScripture = {
  reference: string;
  text: string;
};

export type G12VisionLogo = {
  src: string;
  alt: string;
};

export type G12VisionSectionProps = {
  headerTitle: string;
  logo: G12VisionLogo;
  eyebrow: string;
  title: string;
  scripture: G12VisionScripture;
  intro: string;
  steps: readonly G12VisionStep[];
  closing?: string;
  class?: string;
};

export function G12VisionSection(props: G12VisionSectionProps) {
  return (
    <section
      id="g12-vision"
      class={`grace-section-tight bg-[var(--color-bg-muted)] ${props.class ?? ""}`}
    >
      <div class="container">
        <header class="mb-[var(--space-xl)] flex flex-col items-center gap-[var(--space-md)] lg:flex-row lg:justify-between">
          <h2 class="type-section text-center text-[var(--color-text-heading)] lg:text-left">
            {props.headerTitle}
          </h2>
          <img
            src={props.logo.src}
            alt={props.logo.alt}
            class="mx-auto h-20 w-auto max-w-[min(100%,16rem)] object-contain lg:mx-0 lg:h-24"
            loading="lazy"
            decoding="async"
          />
        </header>

        <div class="flex flex-col gap-[var(--space-xl)] lg:flex-row-reverse lg:items-start">
          <div class="stack-sm min-w-0 lg:w-1/2">
            <h3 class="type-subhead text-[var(--color-text-heading)]">
              {props.eyebrow}
            </h3>
            <blockquote class="stack-xs">
              <QuoteIcon class="h-8 w-8 text-[var(--color-gold-600)]" />
              <p class="type-quote text-[var(--color-text-heading)]">
                “{props.scripture.text}”
              </p>
              <footer class="type-meta font-semibold text-[var(--color-navy-900)]">
                {props.scripture.reference}
              </footer>
            </blockquote>
            <p class="type-body text-[var(--color-text-body)]">
              {props.intro}
            </p>
            <Show when={props.closing}>
              <p class="type-body font-medium text-[var(--color-text-heading)]">
                {props.closing}
              </p>
            </Show>
          </div>

          <div class="min-w-0 lg:w-1/2">
            <h3 class="type-subhead text-[var(--color-text-heading)]">
              {props.title}
            </h3>
            <ol class="mt-[var(--space-md)] flex flex-col gap-[var(--space-md)]">
              <For each={props.steps}>
                {(step, index) => (
                  <li class="flex gap-[var(--space-sm)]">
                    <span
                      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy-900)] text-[length:var(--text-sm)] font-semibold tabular-nums text-white"
                      aria-hidden="true"
                    >
                      {index() + 1}
                    </span>
                    <div class="min-w-0">
                      <h4 class="type-card-title text-[var(--color-text-heading)]">
                        {step.title}
                      </h4>
                      <p class="type-list mt-1.5 text-[var(--color-text-body)]">
                        {step.description}
                      </p>
                    </div>
                  </li>
                )}
              </For>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
