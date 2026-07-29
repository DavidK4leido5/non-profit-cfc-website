import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mockSiteContent } from "../content/mock-site.content";
import { Navbar } from "./Navbar";

const meta = {
  title: "UI/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Navbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brand: mockSiteContent.brand,
    links: mockSiteContent.nav.links,
    cta: mockSiteContent.nav.cta,
  },
};

export const SignedIn: Story = {
  args: {
    brand: mockSiteContent.brand,
    links: mockSiteContent.nav.links.map((l) => ({ ...l, active: false })),
    userEmail: "jane@church.org",
  },
};

export const MinimalLinks: Story = {
  args: {
    brand: mockSiteContent.brand,
    links: [
      { href: "/", label: "Home", active: true },
      { href: "/about", label: "About" },
    ],
    cta: mockSiteContent.nav.cta,
  },
};

export const TransparentOverHero: Story = {
  args: {
    brand: mockSiteContent.brand,
    links: mockSiteContent.nav.links,
    cta: mockSiteContent.nav.cta,
    variant: "transparent",
  },
  decorators: [
    (Story) => (
      <div class="bg-hero-gradient min-h-48">
        <Story />
      </div>
    ),
  ],
};
