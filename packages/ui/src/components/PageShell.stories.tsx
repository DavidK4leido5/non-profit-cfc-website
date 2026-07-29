import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { PageShell } from "./PageShell";

/**
 * Page shells wrap route content with a consistent title, description, and optional body slot.
 */
const meta = {
  title: "UI/PageShell",
  component: PageShell,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A simple white card with heading and description. Pass `children` for forms, lists, or actions.",
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Primary page heading (h1)",
    },
    description: {
      control: "text",
      description: "Supporting copy shown under the title",
    },
    children: {
      control: false,
      description: "Optional slot for page content",
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
        <button
          type="button"
          class="rounded-md bg-stone-900 px-4 py-2 text-sm text-white"
        >
          Primary action
        </button>
        <button
          type="button"
          class="rounded-md border border-stone-300 px-4 py-2 text-sm text-stone-700"
        >
          Secondary
        </button>
      </div>
    ),
  },
};

export const LongDescription: Story = {
  args: {
    title: "Resources",
    description:
      "Role-gated resources will appear here after auth is implemented. This variant shows how longer helper text wraps within the shell.",
  },
};
