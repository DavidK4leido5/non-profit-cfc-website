import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import {
  churchUiAliases,
  dockerDevWatch,
  dockerPollReload,
  watchUiPackage,
} from "./vite.workspace";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(rootDir, "../..");

export default defineConfig({
  plugins: [solid(), tailwindcss(), watchUiPackage(monorepoRoot), dockerPollReload(monorepoRoot)],
  resolve: {
    alias: {
      "~": path.resolve(rootDir, "src"),
      ...churchUiAliases(monorepoRoot),
    },
    dedupe: ["solid-js"],
  },
  optimizeDeps: {
    exclude: ["@church/ui"],
  },
  server: {
    host: true,
    port: 5173,
    fs: {
      allow: [monorepoRoot],
    },
    ...dockerDevWatch(),
    proxy: {
      "/api/v1": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
