import type { StorybookConfig } from "storybook-solidjs-vite";

const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  staticDirs: ["../../../apps/web/public"],
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
  async viteFinal(config) {
    config.server = {
      ...config.server,
      watch: {
        ...config.server?.watch,
        usePolling: process.env.CHOKIDAR_USEPOLLING === "true",
        interval: 1000,
        followSymlinks: true,
        ignored: [
          "**/node_modules/**",
          "**/storybook-static/**",
          "**/dist/**",
        ],
      },
    };
    return config;
  },
} satisfies StorybookConfig;

export default config;
