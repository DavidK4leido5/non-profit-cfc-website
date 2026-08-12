import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: path.join(rootDir, ".env") });
config();

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Pool } from "pg";
import { auth } from "./auth.js";

const port = Number(process.env.AUTH_PORT ?? 3001);
const hostname = process.env.HOST ?? "0.0.0.0";

const trustedOrigins = (
  process.env.CORS_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok", service: "auth" }));

app.use(
  "/api/auth/*",
  cors({
    origin: trustedOrigins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

/** Super-admin: list every branch organization. */
app.get("/api/auth/church/branches", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user || session.user.role !== "super_admin") {
    return c.json({ error: "Forbidden" }, 403);
  }
  const { rows } = await pool.query(
    `SELECT id, name, slug, "createdAt",
            (SELECT COUNT(*)::int FROM member m WHERE m."organizationId" = o.id) AS "memberCount"
     FROM organization o
     ORDER BY "createdAt" DESC`,
  );
  return c.json(rows);
});

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

serve({ fetch: app.fetch, port, hostname }, () => {
  console.log(`@church/auth listening on http://${hostname}:${port}`);
});
