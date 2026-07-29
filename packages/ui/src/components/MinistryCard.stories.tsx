import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { MinistryCard } from "./MinistryCard";

const meta = {
  title: "UI/MinistryCard",
  component: MinistryCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div class="bg-surface-subtle w-full max-w-sm p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MinistryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    imageSrc:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    imageAlt: "Congregation worshipping together",
    title: (
      <>
        Worship & <span class="text-brand-600">Music</span>
      </>
    ),
    description:
      "Gather with us each Sunday for heartfelt worship, biblical teaching, and space to encounter God together.",
    primaryCta: { label: "Plan your visit", href: "#visit" },
    secondaryCta: { label: "View service times", href: "#times" },
  },
};
