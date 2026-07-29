import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Button } from "./Button";
import { PageShell } from "./PageShell";

const meta = {
  title: "UI/PageShell",
  component: PageShell,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Inner-page card shell for routes below the landing page. Uses brand tokens from COLOR-PALETTE.md.",
      },
    },
  },
} satisfies Meta<typeof PageShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Welcome",
    description: "Church website scaffold. Add your home content here.",
  },
};

export const WithActions: Story = {
  args: {
    title: "Sign in",
    description: "Add your login form here. It will POST to /api/v1/auth/login.",
    children: (
      <div class="flex gap-3">
        <Button variant="primary">Primary action</Button>
        <Button variant="secondary">Secondary</Button>
      </div>
    ),
  },
};
