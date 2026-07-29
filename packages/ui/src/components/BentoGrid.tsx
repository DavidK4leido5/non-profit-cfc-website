import { JSX, ParentProps, Show, splitProps } from "solid-js";
import { ActivityIcon, ActivityIconId, ArrowRightIcon } from "../icons/activity-icons";
import { Button } from "./Button";
import { GradedImage } from "./GradedImage";

export type BentoCardProps = {
  name: string;
  description: string;
  href: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
  icon: ActivityIconId;
  dateLabel?: string;
  class?: string;
};

export function BentoGrid(props: ParentProps<{ class?: string }>) {
  const [local, rest] = splitProps(props, ["class", "children"]);

  return (
    <div
      class={`grid w-full auto-rows-[20rem] grid-cols-1 gap-4 sm:auto-rows-[22rem] md:grid-cols-3 lg:auto-rows-[24rem] lg:grid-rows-3 lg:gap-5 ${local.class ?? ""}`}
      {...rest}
    >
      {local.children}
    </div>
  );
}

export function BentoCard(props: BentoCardProps) {
  const [local] = splitProps(props, [
    "name",
    "description",
    "href",
    "cta",
    "imageSrc",
    "imageAlt",
    "icon",
    "dateLabel",
    "class",
  ]);

  return (
    <article
      class={`group relative col-span-1 flex min-h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-brand-950 shadow-lg md:col-span-3 ${local.class ?? ""}`}
    >
      <GradedImage
        src={local.imageSrc}
        alt={local.imageAlt}
        scrim="card"
        fill
        referrerPolicy="no-referrer"
        class="transition-transform duration-700 ease-out group-hover:scale-105"
      />

      <div class="relative z-10 mt-auto flex flex-col">
        <div class="space-y-3 p-6 sm:p-7 sm:pb-5">
          <div class="flex items-start justify-between gap-3">
            <div class="rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
              <ActivityIcon id={local.icon} class="text-white h-8 w-8 sm:h-9 sm:w-9" />
            </div>
            <Show when={local.dateLabel}>
              <span class="rounded-full bg-brand-500/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm sm:text-xs">
                {local.dateLabel}
              </span>
            </Show>
          </div>

          <div class="space-y-2">
            <h3 class="text-on-hero text-xl font-semibold leading-snug tracking-tight drop-shadow-sm sm:text-2xl">
              {local.name}
            </h3>
            <p class="text-on-hero-muted line-clamp-3 text-sm leading-relaxed sm:text-[0.9375rem]">
              {local.description}
            </p>
          </div>
        </div>

        <div class="border-t border-white/10 bg-brand-950/50 px-6 py-4 backdrop-blur-md transition-colors duration-300 group-hover:bg-brand-950/70 sm:px-7">
          <Button
            href={local.href}
            variant="ghost"
            class="text-on-hero hover:text-on-hero h-auto w-full justify-start px-0 py-0 text-sm font-medium hover:bg-transparent sm:text-base"
          >
            <span class="inline-flex w-full items-center justify-between gap-3">
              <span>{local.cta}</span>
              <ArrowRightIcon class="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Button>
        </div>
      </div>
    </article>
  );
}
