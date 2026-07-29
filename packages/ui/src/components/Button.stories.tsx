import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Plan your visit",
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

export const AsLink: Story = {
  args: {
    variant: "primary",
    href: "#visit",
    children: "Plan your visit",
  },
};
