#!/usr/bin/env node
/**
 * pnpm-friendly solidcn adder.
 * Official `solidcn add` shells out to npm, which breaks on workspace:* protocols.
 * This pulls registry JSON and writes files; install deps with pnpm yourself if prompted.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const names = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (!names.length) {
  console.error("Usage: node scripts/solidcn-add.mjs <component> [component...]");
  process.exit(1);
}

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../apps/web");
const registryBase = "https://solidcn.dev/r";

async function install(name) {
  const res = await fetch(`${registryBase}/${name}.json`);
  if (!res.ok) throw new Error(`Registry ${name}: HTTP ${res.status}`);
  const item = await res.json();
  for (const dep of item.registryDependencies ?? []) {
    if (dep !== "utils") await install(dep);
    else await install("utils");
  }
  for (const file of item.files ?? []) {
    const dest = path.join(webRoot, "src", file.path);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, file.content, "utf8");
    console.log(`wrote ${path.relative(process.cwd(), dest)}`);
  }
  if (item.dependencies?.length) {
    console.log(`pnpm deps for ${name}: pnpm --filter @church/web add ${item.dependencies.join(" ")}`);
  }
}

for (const name of names) {
  await install(name);
}
