import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { UpcomingActivitiesSection } from "./UpcomingActivitiesSection";

const meta = {
  title: "UI/UpcomingActivitiesSection",
  component: UpcomingActivitiesSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof UpcomingActivitiesSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: mockSiteContent.activities.title,
    subtitle: mockSiteContent.activities.subtitle,
    items: [...mockSiteContent.activities.items],
  },
};
