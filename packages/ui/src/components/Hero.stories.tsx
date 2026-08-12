import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { Hero } from "./Hero";

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
    headline: hero.headline,
    subcopy: hero.subcopy,
    primaryCta: hero.primaryCta,
    background: hero.background,
    featureStrip: hero.featureStrip,
  },
};

export const PhotoOnly: Story = {
  args: {
    headline: hero.headline,
    subcopy: hero.subcopy,
    primaryCta: hero.primaryCta,
    background: hero.background,
  },
};
