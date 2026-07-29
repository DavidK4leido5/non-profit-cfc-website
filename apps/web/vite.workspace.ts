import { createHash } from "node:crypto";
import { createRequire } from "node:module";
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
  const uiRoot = path.resolve(monorepoRoot, UI_PKG);
  const pkgPath = path.join(uiRoot, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
    exports?: Record<string, string>;
  };

  const aliases: Record<string, string> = {};

  for (const [exportKey, exportPath] of Object.entries(pkg.exports ?? {})) {
    if (!exportKey.startsWith("./") || typeof exportPath !== "string") continue;
    const subpath = `@church/ui/${exportKey.slice(2)}`;
    aliases[subpath] = path.join(uiRoot, exportPath.replace(/^\.\//, ""));
  }

  return aliases;
}

/** Resolve @church/ui/* before Node export-map validation (pnpm workspace + Vite 6). */
export function churchUiResolve(monorepoRoot: string): Plugin {
  const uiRoot = path.resolve(monorepoRoot, UI_PKG);
  const pkgPath = path.join(uiRoot, "package.json");

  const resolveExport = (source: string): string | null => {
    if (!source.startsWith("@church/ui/")) return null;

    const exportKey = `./${source.slice("@church/ui/".length)}`;
    let pkg: { exports?: Record<string, string> };
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
        exports?: Record<string, string>;
      };
    } catch {
      return null;
    }

    const exportPath = pkg.exports?.[exportKey];
    if (typeof exportPath !== "string") return null;

    return path.join(uiRoot, exportPath.replace(/^\.\//, ""));
  };

  return {
    name: "church-ui-resolve",
    enforce: "pre",
    resolveId(source) {
      return resolveExport(source);
    },
  };
}

/**
 * UI source is aliased into the web app; deps like motion-solid must resolve from @church/web.
 */
export function uiDependencyAliases(webRoot: string): Record<string, string> {
  const require = createRequire(path.join(webRoot, "package.json"));
  const packages = ["motion-solid", "motion-dom"] as const;
  const aliases: Record<string, string> = {};

  for (const name of packages) {
    try {
      aliases[name] = path.dirname(require.resolve(`${name}/package.json`));
    } catch {
      // motion-dom is transitive — alias only when pnpm exposes it to @church/web
    }
  }

  return aliases;
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

/** New files dropped into public/ while the dev server is running (common in Docker on Windows). */
export function watchPublicDir(publicDir: string): Plugin {
  return {
    name: "watch-public-dir",
    apply: "serve",
    configureServer(server) {
      if (fs.existsSync(publicDir)) {
        server.watcher.add(publicDir);
      }
    },
  };
}
