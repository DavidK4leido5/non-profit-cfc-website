import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { G12VisionSection } from "./G12VisionSection";

const { g12Vision } = mockSiteContent;

const meta = {
  title: "UI/G12VisionSection",
  component: G12VisionSection,
  tags: ["autodocs"],
} satisfies Meta<typeof G12VisionSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headerTitle: g12Vision.headerTitle,
    logo: g12Vision.logo,
    eyebrow: g12Vision.eyebrow,
    title: g12Vision.title,
    scripture: g12Vision.scripture,
    intro: g12Vision.intro,
    steps: [...g12Vision.steps],
    closing: g12Vision.closing,
  },
};
