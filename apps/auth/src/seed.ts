import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: path.join(rootDir, ".env") });
config();

import { auth } from "./auth.js";

/**
 * Seed the first platform super_admin from env.
 * Idempotent: ensures email exists with role super_admin.
 */
async function seed() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

  if (!email || !password) {
    console.error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required");
    process.exit(1);
  }

  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
    console.error("BETTER_AUTH_SECRET must be set (min 32 characters)");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const existing = await pool.query(`SELECT id, role FROM "user" WHERE email = $1`, [email]);
    if (existing.rowCount && existing.rows[0]) {
      if (existing.rows[0].role !== "super_admin") {
        await pool.query(
          `UPDATE "user" SET role = 'super_admin', "emailVerified" = true WHERE email = $1`,
          [email],
        );
        console.log("Updated existing user to super_admin:", email);
      } else {
        await pool.query(`UPDATE "user" SET "emailVerified" = true WHERE email = $1`, [email]);
        console.log("Super admin already exists:", email);
      }
      return;
    }

    await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: "super_admin",
      },
    });
    await pool.query(
      `UPDATE "user" SET role = 'super_admin', "emailVerified" = true WHERE email = $1`,
      [email],
    );
    console.log("Seeded super_admin:", email);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Seed failed:", message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
