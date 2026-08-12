import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { CTA_BUTTON_VARIANTS, CtaButton } from "./CtaButton";

const meta = {
  title: "UI/CtaButton",
  component: CtaButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [...CTA_BUTTON_VARIANTS],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof CtaButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Plan your visit",
  },
};

export const Cta: Story = {
  args: {
    variant: "cta",
    size: "sm",
    children: "Sign in",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Learn more",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Watch online",
  },
};

export const Soft: Story = {
  args: {
    variant: "soft",
    children: "Join a group",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "See details",
  },
};

export const Inverse: Story = {
  args: {
    variant: "inverse",
    children: "Get started",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const InverseGhost: Story = {
  args: {
    variant: "inverseGhost",
    children: "Watch online",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Learn more",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Delete",
  },
};

export const AsLink: Story = {
  args: {
    variant: "cta",
    href: "/auth/login",
    size: "sm",
    children: "Sign in",
  },
};

export const Sizes: Story = {
  args: {
    children: "Sign in",
  },
  render: () => (
    <div class="flex flex-wrap items-center gap-3">
      <CtaButton size="sm" variant="cta">
        Small
      </CtaButton>
      <CtaButton size="md" variant="cta">
        Medium
      </CtaButton>
      <CtaButton size="lg" variant="cta">
        Large
      </CtaButton>
    </div>
  ),
};

export const AllVariants: Story = {
  args: {
    children: "Label",
  },
  render: () => (
    <div class="flex max-w-xl flex-col gap-6">
      <div class="flex flex-wrap gap-3">
        {CTA_BUTTON_VARIANTS.filter(
          (v) => v !== "inverse" && v !== "inverseGhost",
        ).map((variant) => (
          <CtaButton variant={variant}>{variant}</CtaButton>
        ))}
      </div>
      <div class="flex flex-wrap gap-3 rounded-xl bg-brand-950 p-4">
        <CtaButton variant="inverse">inverse</CtaButton>
        <CtaButton variant="inverseGhost">inverseGhost</CtaButton>
      </div>
    </div>
  ),
};
