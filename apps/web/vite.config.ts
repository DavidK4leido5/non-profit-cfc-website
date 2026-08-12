import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import {
  churchUiAliases,
  churchUiResolve,
  dockerDevWatch,
  dockerPollReload,
  uiDependencyAliases,
  watchPublicDir,
  watchUiPackage,
} from "./vite.workspace";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(rootDir, "../..");

export default defineConfig({
  plugins: [
    churchUiResolve(monorepoRoot),
    solid(),
    tailwindcss(),
    watchUiPackage(monorepoRoot),
    watchPublicDir(path.resolve(rootDir, "public")),
    dockerPollReload(monorepoRoot),
  ],
  resolve: {
    alias: [
      { find: "~", replacement: path.resolve(rootDir, "src") },
      ...Object.entries(churchUiAliases(monorepoRoot)).map(([find, replacement]) => ({
        find,
        replacement,
      })),
      ...Object.entries(uiDependencyAliases(rootDir)).map(([find, replacement]) => ({
        find,
        replacement,
      })),
    ],
    dedupe: ["solid-js", "motion-solid"],
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
      "/api/auth": {
        target: process.env.VITE_AUTH_PROXY ?? "http://localhost:3001",
        changeOrigin: true,
      },
      "/api/v1": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
