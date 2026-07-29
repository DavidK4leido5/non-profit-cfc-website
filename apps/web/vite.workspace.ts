import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Plugin, UserConfig } from "vite";

const UI_PKG = "packages/ui";

function isUiFile(file: string): boolean {
  const normalized = file.replaceAll("\\", "/");
  return normalized.includes(`/${UI_PKG}/`);
}

function walkSourceFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      walkSourceFiles(fullPath, out);
      continue;
    }
    if (/\.(tsx?|css)$/.test(entry.name)) out.push(fullPath);
  }

  return out;
}

function fileFingerprint(file: string): string {
  const content = fs.readFileSync(file);
  return createHash("md5").update(content).digest("hex");
}

/** Map @church/ui exports to source files so Vite HMR watches packages/ui directly. */
export function churchUiAliases(monorepoRoot: string): Record<string, string> {
  const uiSrc = path.resolve(monorepoRoot, UI_PKG, "src");
  return {
    "@church/ui/button": path.join(uiSrc, "components/Button.tsx"),
    "@church/ui/navbar": path.join(uiSrc, "components/Navbar.tsx"),
    "@church/ui/hero": path.join(uiSrc, "components/Hero.tsx"),
    "@church/ui/hero-preview-card": path.join(uiSrc, "components/HeroPreviewCard.tsx"),
    "@church/ui/trust-strip": path.join(uiSrc, "components/TrustStrip.tsx"),
    "@church/ui/page-shell": path.join(uiSrc, "components/PageShell.tsx"),
    "@church/ui/styles.css": path.join(uiSrc, "styles.css"),
    "@church/ui/tokens.css": path.join(uiSrc, "tokens.css"),
  };
}

/** ponytail: content-hash poll — Docker Desktop on Windows often skips mtime updates on bind mounts. */
export function dockerPollReload(monorepoRoot: string): Plugin {
  const watchRoots = [
    path.resolve(monorepoRoot, "apps/web/src"),
    path.resolve(monorepoRoot, UI_PKG, "src"),
  ];
  const fingerprints = new Map<string, string>();
  const intervalMs = Number(process.env.CHOKIDAR_INTERVAL ?? 500);

  return {
    name: "docker-poll-reload",
    apply: "serve",
    configureServer(server) {
      const scan = () => {
        const changedFiles: string[] = [];

        for (const root of watchRoots) {
          for (const file of walkSourceFiles(root)) {
            let fingerprint: string;
            try {
              fingerprint = fileFingerprint(file);
            } catch {
              continue;
            }

            const prev = fingerprints.get(file);
            if (prev !== undefined && fingerprint !== prev) changedFiles.push(file);
            fingerprints.set(file, fingerprint);
          }
        }

        if (changedFiles.length === 0) return;

        for (const file of changedFiles) {
          server.watcher.emit("change", file);
          for (const mod of server.moduleGraph.getModulesByFile(file) ?? []) {
            server.moduleGraph.invalidateModule(mod);
          }
        }

        server.moduleGraph.invalidateAll();
        server.ws.send({ type: "full-reload", path: "*" });
      };

      scan();
      const timer = setInterval(scan, intervalMs);
      server.httpServer?.on("close", () => clearInterval(timer));
    },
  };
}

export function watchUiPackage(monorepoRoot: string): Plugin {
  const uiRoot = path.resolve(monorepoRoot, UI_PKG);

  return {
    name: "watch-ui-package",
    configureServer(server) {
      server.watcher.add(uiRoot);

      const onUiChange = (file: string) => {
        if (!isUiFile(file)) return;

        for (const mod of server.moduleGraph.getModulesByFile(file) ?? []) {
          server.moduleGraph.invalidateModule(mod);
        }

        server.ws.send({ type: "full-reload", path: "*" });
      };

      server.watcher.on("change", onUiChange);
      server.watcher.on("add", onUiChange);
      server.watcher.on("unlink", onUiChange);
    },
    handleHotUpdate(ctx) {
      if (!isUiFile(ctx.file)) return;

      for (const mod of ctx.modules) {
        ctx.server.moduleGraph.invalidateModule(mod);
      }

      ctx.server.ws.send({ type: "full-reload", path: "*" });
      return [];
    },
  };
}

export function dockerDevWatch(): UserConfig["server"] {
  const polling = process.env.CHOKIDAR_USEPOLLING === "true";
  return {
    watch: {
      usePolling: polling,
      interval: polling ? Number(process.env.CHOKIDAR_INTERVAL ?? 500) : undefined,
      followSymlinks: true,
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/storybook-static/**",
        "**/dist/**",
        "**/.turbo/**",
      ],
    },
  };
}
