import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: path.join(rootDir, ".env") });
config(); // local override

import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { Pool } from "pg";
import { sendEmail } from "./email.js";
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

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleEnabled = Boolean(googleClientId && googleClientSecret);

const requireEmailVerification =
  (process.env.AUTH_REQUIRE_EMAIL_VERIFICATION ?? "true").toLowerCase() !== "false";

export const auth = betterAuth({
  database: new Pool({ connectionString: databaseUrl }),
  baseURL,
  basePath: "/api/auth",
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: googleEnabled ? ["google"] : [],
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Reset your password: ${url}`,
        html: `<p>Click to reset your password:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Verify your email: ${url}`,
        html: `<p>Welcome — confirm your email:</p><p><a href="${url}">${url}</a></p>`,
      });
    },
  },
  socialProviders: {
    ...(googleEnabled
      ? {
          google: {
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
            prompt: "select_account",
          },
        }
      : {}),
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
export const authFeatures = {
  googleEnabled,
  requireEmailVerification,
};
