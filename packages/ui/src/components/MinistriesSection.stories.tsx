import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { MinistriesSection } from "./MinistriesSection";

const meta = {
  title: "UI/MinistriesSection",
  component: MinistriesSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MinistriesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: mockSiteContent.ministries.title,
    subtitle: mockSiteContent.ministries.subtitle,
    items: mockSiteContent.ministries.items.map((item) => ({ ...item })),
    more: mockSiteContent.ministries.more,
  },
};
