import type { Preview } from "storybook-solidjs-vite";
import { MotionProvider } from "../src/motion";
import "../src/styles.css";

const preview = {
  decorators: [
    (Story) => (
      <MotionProvider>
        <Story />
      </MotionProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    a11y: {
      test: "todo",
    },
  },
  tags: ["autodocs"],
} satisfies Preview;

export default preview;
