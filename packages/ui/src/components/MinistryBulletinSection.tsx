import { For, Show } from "solid-js";
import { motion } from "motion-solid";
import { easeOut, fadeUpItem, fadeUpStagger, viewportOnce } from "../motion/presets";
import {
  BulletinNote,
  type BulletinAlign,
  type BulletinImageSide,
  type BulletinLayout,
  type BulletinPalette,
} from "./BulletinNote";
import { PosterImage } from "./PosterImage";

export type BulletinPost = {
  id: string;
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
};

export type MinistrySectionMode = "featured" | "split";

export type MinistryBulletinSectionProps = {
  slug: string;
  title: string;
  tagline: string;
  imageSrc: string;
  imageAlt: string;
  imageObjectPosition?: string;
  posts: readonly BulletinPost[];
  index?: number;
  class?: string;
};

const PALETTES: BulletinPalette[] = ["brand", "sunset", "mint", "gold", "violet"];
const ALIGNS: BulletinAlign[] = ["left", "center", "right"];

export function MinistryBulletinSection(props: MinistryBulletinSectionProps) {
  const sectionIndex = () => props.index ?? 0;
  const mode = (): MinistrySectionMode => (sectionIndex() === 0 ? "featured" : "split");
  const sectionPalette = (): BulletinPalette => PALETTES[sectionIndex() % PALETTES.length];
  /** Alternate image side for split ministry headers */
  const headerImageLeft = () => sectionIndex() % 2 === 1;

  const posterLayout = (): BulletinLayout => (mode() === "featured" ? "stack" : "split");

  const posterVariant = (post: BulletinPost, index: number): "image" | "brand" => {
    if (post.variant) return post.variant;
    if (post.imageSrc) return "image";
    return index % 2 === 0 ? "brand" : "image";
  };

  const posterPalette = (post: BulletinPost, index: number): BulletinPalette =>
    post.palette ?? PALETTES[(sectionIndex() + index) % PALETTES.length];

  const posterAlign = (post: BulletinPost, index: number): BulletinAlign =>
    post.align ?? ALIGNS[(sectionIndex() + index) % ALIGNS.length];

  const posterImageSide = (index: number): BulletinImageSide =>
    index % 2 === 0 ? "left" : "right";

  return (
    <motion.section
      id={props.slug}
      class={`scroll-mt-28 bulletin-ministry bulletin-ministry-${mode()} ${props.class ?? ""}`}
      initial="initial"
      whileInView="animate"
      viewport={viewportOnce}
      variants={fadeUpStagger}
    >
      <Show
        when={mode() === "featured"}
        fallback={
          <div
            class={`bulletin-ministry-split-header relative overflow-hidden bulletin-ministry-tone-${sectionPalette()} ${headerImageLeft() ? "" : "bulletin-ministry-split-header-reverse"}`}
          >
            <div class="bulletin-ministry-split-media relative min-h-56 overflow-hidden sm:min-h-72 lg:min-h-80">
              <PosterImage
                src={props.imageSrc}
                alt={props.imageAlt}
                class="absolute inset-0 h-full w-full object-cover"
                style={
                  props.imageObjectPosition
                    ? { "object-position": props.imageObjectPosition }
                    : undefined
                }
                loading="lazy"
              />
            </div>

            <motion.div
              class={`bulletin-ministry-split-copy bulletin-poster-palette-${sectionPalette()} flex flex-col justify-end p-7 sm:p-10 lg:p-12`}
              variants={fadeUpItem}
              transition={easeOut}
            >
              <p class="font-ui bulletin-ministry-eyebrow">
                Ministry board
              </p>
              <h2 class="font-display bulletin-ministry-title bulletin-ministry-title-on-color">
                {props.title}
              </h2>
              <p class="font-body bulletin-ministry-tagline bulletin-ministry-tagline-on-color">
                {props.tagline}
              </p>
            </motion.div>
          </div>
        }
      >
        <div
          class={`bulletin-ministry-featured-header relative overflow-hidden bulletin-ministry-tone-${sectionPalette()}`}
        >
          <PosterImage
            src={props.imageSrc}
            alt={props.imageAlt}
            class="absolute inset-0 h-full w-full object-cover"
            style={
              props.imageObjectPosition
                ? { "object-position": props.imageObjectPosition }
                : undefined
            }
            loading="lazy"
          />
          <div
            class={`bulletin-ministry-scrim bulletin-ministry-scrim-${sectionPalette()} absolute inset-0`}
            aria-hidden="true"
          />

          <motion.div
            class="absolute inset-0 flex items-end"
            variants={fadeUpItem}
            transition={easeOut}
          >
            <div class="bulletin-ministry-banner bulletin-ministry-banner-left mx-auto w-full max-w-page px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
              <p class="font-ui bulletin-ministry-eyebrow">Ministry board</p>
              <h2 class="font-display bulletin-ministry-title">{props.title}</h2>
              <p class="font-body bulletin-ministry-tagline">{props.tagline}</p>
            </div>
          </motion.div>
        </div>
      </Show>

      <div class="flex flex-col gap-1">
        <For each={props.posts}>
          {(post, index) => (
            <BulletinNote
              title={post.title}
              body={post.body}
              dateLabel={post.dateLabel}
              tag={post.tag}
              pinned={post.pinned}
              imageSrc={post.imageSrc}
              imageAlt={post.imageAlt}
              imageObjectPosition={post.imageObjectPosition}
              variant={posterVariant(post, index())}
              palette={posterPalette(post, index())}
              align={posterAlign(post, index())}
              layout={posterLayout()}
              imageSide={posterImageSide(index())}
            />
          )}
        </For>
      </div>
    </motion.section>
  );
}
