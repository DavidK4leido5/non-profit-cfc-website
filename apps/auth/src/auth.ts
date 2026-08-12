import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: path.join(rootDir, ".env") });
config(); // local override

import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { Pool } from "pg";
import { ac, authRoles } from "./permissions.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for @church/auth");
}

const trustedOrigins = (
  process.env.CORS_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const baseURL =
  process.env.BETTER_AUTH_URL ??
  `http://localhost:${process.env.AUTH_PORT ?? "3001"}`;

export const auth = betterAuth({
  database: new Pool({ connectionString: databaseUrl }),
  baseURL,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            // Preserve explicit roles (seed / admin createUser); default public signup to "user".
            role: user.role ?? "user",
          },
        }),
      },
    },
  },
  plugins: [
    admin({
      ac,
      roles: authRoles,
      defaultRole: "user",
      adminRoles: ["super_admin"],
    }),
    organization({
      allowUserToCreateOrganization: async (user) => {
        const role = (user as { role?: string }).role ?? "user";
        return role === "branch_admin" || role === "super_admin";
      },
      organizationLimit: 1,
      creatorRole: "admin",
      membershipLimit: 500,
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
