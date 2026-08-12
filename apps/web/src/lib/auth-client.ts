import { createAuthClient } from "better-auth/solid";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { ac, authRoles } from "./auth-permissions";

const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : ((import.meta.env.VITE_AUTH_ORIGIN as string | undefined) ?? "http://localhost:5173");

/**
 * Browser auth client — calls /api/auth via Vite proxy → apps/auth.
 */
export const authClient = createAuthClient({
  baseURL,
  basePath: import.meta.env.VITE_AUTH_BASE_URL ?? "/api/auth",
  plugins: [
    adminClient({
      ac,
      roles: authRoles,
    }),
    organizationClient(),
  ],
});

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = AuthSession["user"];

export function getUserRole(user: { role?: string | null } | null | undefined): string {
  return user?.role ?? "user";
}

export function isSuperAdmin(user: { role?: string | null } | null | undefined): boolean {
  return getUserRole(user) === "super_admin";
}

export function isBranchAdmin(user: { role?: string | null } | null | undefined): boolean {
  const role = getUserRole(user);
  return role === "branch_admin" || role === "super_admin";
}
