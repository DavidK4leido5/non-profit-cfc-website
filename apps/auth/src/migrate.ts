import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
config({ path: path.join(rootDir, ".env") });
config();

/**
 * Applies core Better Auth + admin + organization schema.
 * Idempotent (IF NOT EXISTS).
 */
const sql = `
CREATE TABLE IF NOT EXISTS "user" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "role" TEXT,
  "banned" BOOLEAN DEFAULT false,
  "banReason" TEXT,
  "banExpires" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "impersonatedBy" TEXT,
  "activeOrganizationId" TEXT
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "organization" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "logo" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "metadata" TEXT
);

CREATE TABLE IF NOT EXISTS "member" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'member',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "invitation" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "role" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "inviterId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session" ("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account" ("userId");
CREATE INDEX IF NOT EXISTS "member_userId_idx" ON "member" ("userId");
CREATE INDEX IF NOT EXISTS "member_organizationId_idx" ON "member" ("organizationId");
CREATE INDEX IF NOT EXISTS "invitation_organizationId_idx" ON "invitation" ("organizationId");
`;

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(sql);
    console.log("Auth migrations applied (user/session/account/verification/organization/member/invitation).");
  } finally {
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
