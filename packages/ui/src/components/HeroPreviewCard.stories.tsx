import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { HeroPreviewCard } from "./HeroPreviewCard";

const meta = {
  title: "UI/HeroPreviewCard",
  component: HeroPreviewCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof HeroPreviewCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const { preview } = mockSiteContent.hero;

export const WithStats: Story = {
  args: {
    imageSrc: preview.imageSrc,
    imageAlt: preview.imageAlt,
    badge: preview.badge,
    stats: [...preview.stats],
  },
};

export const ImageOnly: Story = {
  args: {
    imageSrc: preview.imageSrc,
    imageAlt: preview.imageAlt,
    badge: preview.badge,
  },
};

export const NoBadge: Story = {
  args: {
    imageSrc: preview.imageSrc,
    imageAlt: preview.imageAlt,
    stats: preview.stats.slice(0, 2),
  },
};
