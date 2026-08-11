import { Show } from "solid-js";
import { PosterImage } from "./PosterImage";

export type BulletinPalette = "brand" | "sunset" | "gold" | "mint" | "violet";
export type BulletinAlign = "left" | "center" | "right";
export type BulletinLayout = "stack" | "split";
export type BulletinImageSide = "left" | "right";

export type BulletinNoteProps = {
  title: string;
  body: string;
  dateLabel: string;
  tag?: string;
  pinned?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageObjectPosition?: string;
  variant?: "image" | "brand";
  palette?: BulletinPalette;
  align?: BulletinAlign;
  /** stack = full-bleed photo; split = half image / half color+text */
  layout?: BulletinLayout;
  imageSide?: BulletinImageSide;
  class?: string;
};

export function BulletinNote(props: BulletinNoteProps) {
  const hasImage = () => Boolean(props.imageSrc) && props.variant !== "brand";
  const isSplit = () => props.layout === "split" && hasImage();
  const palette = () => props.palette ?? "brand";
  const align = () => props.align ?? "left";
  const imageSide = () => props.imageSide ?? "left";

  const meta = () => (
    <div class="bulletin-poster-meta mb-auto flex flex-wrap items-start gap-2.5 pt-1">
      <Show when={props.tag}>
        <span class="bulletin-poster-tag">{props.tag}</span>
      </Show>
      <Show when={props.pinned}>
        <span class="bulletin-poster-tag bulletin-poster-tag-accent">Featured</span>
      </Show>
      <time class="bulletin-poster-date">{props.dateLabel}</time>
    </div>
  );

  const copy = () => (
    <>
      <h3 class="font-display bulletin-poster-title">{props.title}</h3>
      <p class="font-body bulletin-poster-body">{props.body}</p>
    </>
  );

  return (
    <Show
      when={isSplit()}
      fallback={
        <article
          class={`bulletin-poster relative isolate overflow-hidden ${hasImage() ? "bulletin-poster-image" : `bulletin-poster-brand bulletin-poster-palette-${palette()}`} ${props.pinned ? "bulletin-poster-featured" : "bulletin-poster-standard"} bulletin-poster-align-${align()} ${props.class ?? ""}`}
        >
          <Show when={hasImage() && props.imageSrc}>
            {(sourceUrl) => (
              <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                <PosterImage
                  src={sourceUrl()}
                  alt={props.imageAlt ?? ""}
                  class="h-full w-full object-cover"
                  style={
                    props.imageObjectPosition
                      ? { "object-position": props.imageObjectPosition }
                      : undefined
                  }
                  loading="lazy"
                />
                <div
                  class={`bulletin-poster-scrim bulletin-poster-scrim-${palette()} absolute inset-0`}
                />
              </div>
            )}
          </Show>

          <div class="relative flex min-h-[inherit] flex-1 flex-col justify-end p-6 sm:p-8 lg:p-12">
            {meta()}
            {copy()}
          </div>
        </article>
      }
    >
      <article
        class={`bulletin-poster bulletin-poster-split relative isolate overflow-hidden ${props.pinned ? "bulletin-poster-featured" : "bulletin-poster-standard"} ${imageSide() === "right" ? "bulletin-poster-split-reverse" : ""} ${props.class ?? ""}`}
      >
        <div class="bulletin-poster-split-media relative min-h-[14rem] overflow-hidden sm:min-h-full">
          <PosterImage
            src={props.imageSrc!}
            alt={props.imageAlt ?? ""}
            class="absolute inset-0 h-full w-full object-cover"
            style={
              props.imageObjectPosition
                ? { "object-position": props.imageObjectPosition }
                : undefined
            }
            loading="lazy"
          />
        </div>

        <div
          class={`bulletin-poster-split-copy bulletin-poster-palette-${palette()} relative flex flex-col justify-end p-6 sm:p-8 lg:p-10 bulletin-poster-align-${align()}`}
        >
          {meta()}
          {copy()}
        </div>
      </article>
    </Show>
  );
}
