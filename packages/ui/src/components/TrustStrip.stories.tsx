import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { TrustStrip } from "./TrustStrip";

const meta = {
  title: "UI/TrustStrip",
  component: TrustStrip,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TrustStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: mockSiteContent.trust.title,
    items: [...mockSiteContent.trust.items],
  },
};

export const NoTitle: Story = {
  args: {
    items: mockSiteContent.trust.items.slice(0, 3),
  },
};
