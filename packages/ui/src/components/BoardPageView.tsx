import { For } from "solid-js";
import { BoardHero, type BoardHeroLink } from "./BoardHero";
import { MinistryBulletinSection, type BulletinPost } from "./MinistryBulletinSection";

export type BoardMinistry = {
  slug: string;
  title: string;
  tagline: string;
  imageSrc: string;
  imageAlt: string;
  imageObjectPosition?: string;
  posts: readonly BulletinPost[];
};

export type BoardPageViewProps = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    background: { src: string; alt: string };
  };
  ministries: readonly BoardMinistry[];
  class?: string;
};

export function BoardPageView(props: BoardPageViewProps) {
  const quickLinks = (): BoardHeroLink[] =>
    props.ministries.map((ministry) => ({
      slug: ministry.slug,
      label: ministry.title,
    }));

  return (
    <div class={`board-page ${props.class ?? "bg-surface-subtle"}`}>
      <BoardHero
        eyebrow={props.hero.eyebrow}
        title={props.hero.title}
        subtitle={props.hero.subtitle}
        background={props.hero.background}
        quickLinks={quickLinks()}
      />

      <div class="board-ministry-stack">
        <For each={props.ministries}>
          {(ministry, index) => (
            <MinistryBulletinSection
              slug={ministry.slug}
              title={ministry.title}
              tagline={ministry.tagline}
              imageSrc={ministry.imageSrc}
              imageAlt={ministry.imageAlt}
              imageObjectPosition={ministry.imageObjectPosition}
              posts={ministry.posts}
              index={index()}
            />
          )}
        </For>
      </div>
    </div>
  );
}
