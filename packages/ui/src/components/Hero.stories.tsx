import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { Hero } from "./Hero";
import { HeroPreviewCard } from "./HeroPreviewCard";

const meta = {
  title: "UI/Hero",
  component: Hero,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Hero>;

export default meta;

type Story = StoryObj<typeof meta>;

const { hero } = mockSiteContent;

export const Default: Story = {
  args: {
    eyebrow: hero.eyebrow,
    headline: hero.headline,
    subcopy: hero.subcopy,
    primaryCta: hero.primaryCta,
    secondaryCta: hero.secondaryCta,
    background: hero.background,
    badge: hero.badge,
    stats: [...hero.stats],
  },
};

export const TextOnly: Story = {
  args: {
    eyebrow: hero.eyebrow,
    headline: hero.headline,
    subcopy: hero.subcopy,
    primaryCta: hero.primaryCta,
    secondaryCta: hero.secondaryCta,
    background: hero.background,
  },
};

export const WithPreviewCard: Story = {
  args: {
    eyebrow: hero.eyebrow,
    headline: hero.headline,
    subcopy: hero.subcopy,
    primaryCta: hero.primaryCta,
    secondaryCta: hero.secondaryCta,
    background: hero.background,
    preview: (
      <HeroPreviewCard
        imageSrc={hero.preview.imageSrc}
        imageAlt={hero.preview.imageAlt}
        badge={hero.preview.badge}
        stats={[...hero.preview.stats]}
      />
    ),
  },
};

export const SingleCta: Story = {
  args: {
    eyebrow: hero.eyebrow,
    headline: hero.headline,
    subcopy: hero.subcopy,
    primaryCta: hero.primaryCta,
    background: hero.background,
    badge: hero.badge,
  },
};
