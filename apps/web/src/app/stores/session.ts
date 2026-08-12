import { authClient, getUserRole, type AuthUser } from "~/lib/auth-client";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
};

export function toSessionUser(user: AuthUser | null | undefined): SessionUser | null {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: getUserRole(user),
    image: user.image,
  };
}

export async function signOut() {
  await authClient.signOut();
}

/** Reactive Better Auth session — call inside a component. */
export function useAuthSession() {
  return authClient.useSession();
}
