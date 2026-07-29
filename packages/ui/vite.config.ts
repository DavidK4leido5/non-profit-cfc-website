import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

const polling = process.env.CHOKIDAR_USEPOLLING === "true";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  server: {
    watch: {
      usePolling: polling,
      interval: polling ? 1000 : undefined,
      followSymlinks: true,
      ignored: ["**/node_modules/**", "**/storybook-static/**", "**/dist/**"],
    },
  },
});
