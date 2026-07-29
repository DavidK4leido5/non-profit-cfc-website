import type { StorybookConfig } from "storybook-solidjs-vite";

const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "storybook-solidjs-vite",
    options: {
      docgen: {
        savePropValueAsString: true,
        shouldExtractLiteralValuesFromEnum: true,
      },
    },
  },
  docs: {
    defaultName: "Documentation",
  },
} satisfies StorybookConfig;

export default config;
