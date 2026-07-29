import { createStore } from "solid-js/store";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type SessionState = {
  user: SessionUser | null;
  loading: boolean;
};

export const [session, setSession] = createStore<SessionState>({
  user: null,
  loading: false,
});

export function clearSession() {
  setSession("user", null);
}

// Call from a route loader or on mount once auth endpoints exist.
export async function loadSession() {
  setSession("loading", true);
  try {
    const { apiFetch } = await import("~/app/lib/api-client");
    const data = await apiFetch<{ data: SessionUser }>("/auth/me");
    setSession("user", data.data);
  } catch {
    setSession("user", null);
  } finally {
    setSession("loading", false);
  }
}
