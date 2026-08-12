import { useNavigate, useSearchParams } from "@solidjs/router";
import { createResource, createSignal, Show } from "solid-js";
import { CtaButton } from "@church/ui/cta-button";
import {
  AuthError,
  AuthLabel,
  AuthNotice,
  AuthSplitShell,
  authDividerClass,
  authFieldClass,
  authIconButtonClass,
  authMutedLinkClass,
  authSocialButtonClass,
} from "~/app/components/auth/AuthSplitShell";
import { authClient } from "~/lib/auth-client";

type AuthFeatures = {
  google: boolean;
  requireEmailVerification: boolean;
};

async function loadFeatures(): Promise<AuthFeatures> {
  try {
    const res = await fetch("/api/auth/church/features");
    if (!res.ok) return { google: false, requireEmailVerification: true };
    return (await res.json()) as AuthFeatures;
  } catch {
    return { google: false, requireEmailVerification: true };
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [features] = createResource(loadFeatures);
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [showPassword, setShowPassword] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [notice, setNotice] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setPending(true);
    const { error: err } = await authClient.signIn.email({
      email: email().trim(),
      password: password(),
      callbackURL: "/dashboard",
    });
    setPending(false);
    if (err) {
      const message = err.message ?? "Sign in failed";
      if (/verif/i.test(message)) {
        setNotice("Check your email for a verification link, then try again.");
      }
      setError(message);
      return;
    }
    navigate("/dashboard");
  };

  const onGoogle = async () => {
    setError(null);
    setPending(true);
    const { error: err } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    setPending(false);
    if (err) setError(err.message ?? "Google sign-in failed");
  };

  const onForgot = async () => {
    const value = email().trim();
    if (!value) {
      setError("Enter your email above, then click Forgot password.");
      return;
    }
    setError(null);
    setPending(true);
    const { error: err } = await authClient.requestPasswordReset({
      email: value,
      redirectTo: "/auth/reset-password",
    });
    setPending(false);
    if (err) {
      setError(err.message ?? "Could not send reset email");
      return;
    }
    setNotice("If that email exists, a reset link was sent. Check your inbox (or auth logs in dev).");
  };

  return (
    <AuthSplitShell
      title="Sign in"
      alternate={{ prompt: "New here?", label: "Create an account", href: "/auth/register" }}
    >
      <Show when={params.error}>
        <AuthError message={String(params.error)} />
      </Show>
      <form class="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div>
          <AuthLabel for="login-email">Email</AuthLabel>
          <input
            id="login-email"
            type="email"
            autocomplete="email"
            required
            aria-required="true"
            aria-invalid={error() ? true : undefined}
            aria-describedby={error() ? "login-error" : undefined}
            class={authFieldClass()}
            placeholder="you@example.com"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
        <div>
          <div class="mb-1.5 flex items-center justify-between gap-3">
            <AuthLabel for="login-password">Password</AuthLabel>
            <button
              type="button"
              class={authMutedLinkClass()}
              onClick={onForgot}
              disabled={pending()}
            >
              Forgot password?
            </button>
          </div>
          <div class="relative">
            <input
              id="login-password"
              type={showPassword() ? "text" : "password"}
              autocomplete="current-password"
              required
              aria-required="true"
              class={`${authFieldClass()} pr-12`}
              placeholder="Enter your password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
            />
            <button
              type="button"
              class={authIconButtonClass()}
              aria-label={showPassword() ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
            >
              <EyeIcon open={showPassword()} />
            </button>
          </div>
        </div>

        <AuthError id="login-error" message={error()} />
        <AuthNotice message={notice()} />

        <CtaButton type="submit" variant="cta" fullWidth disabled={pending()} class="mt-1 rounded-xl py-3 focus-visible:ring-offset-surface">
          {pending() ? "Signing in…" : "Sign in"}
        </CtaButton>
      </form>

      <Show when={features()?.google}>
        <div class={authDividerClass()}>
          <span class="h-px flex-1 bg-border" />
          Or continue with
          <span class="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          class={authSocialButtonClass()}
          onClick={onGoogle}
          disabled={pending()}
        >
          <GoogleMark />
          Google
        </button>
      </Show>

      <Show when={!features()?.google && !features.loading}>
        <p class="mt-6 text-center text-xs text-ink-muted">
          Google sign-in appears when <code class="text-ink">GOOGLE_CLIENT_ID</code> and{" "}
          <code class="text-ink">GOOGLE_CLIENT_SECRET</code> are set.
        </p>
      </Show>
    </AuthSplitShell>
  );
}

function EyeIcon(props: { open: boolean }) {
  return (
    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
      <Show
        when={props.open}
        fallback={
          <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </>
        }
      >
        <path d="M3 3l18 18M10.5 10.6a3 3 0 004 4M9.4 5.5A10.4 10.4 0 0112 5c6.5 0 10 7 10 7a17.6 17.6 0 01-4.1 4.7M6.1 6.2A17.4 17.4 0 002 12s3.5 7 10 7c1.3 0 2.5-.2 3.6-.6" />
      </Show>
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg class="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.4a5.5 5.5 0 01-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.7z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 01-10.7-3.8H1.3v3.1A12 12 0 0012 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3A7.2 7.2 0 014.9 12c0-.8.1-1.6.4-2.3V6.6H1.3A12 12 0 000 12c0 1.9.5 3.8 1.3 5.4l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0012 0 12 12 0 001.3 6.6l4 3.1A7.1 7.1 0 0112 4.8z"
      />
    </svg>
  );
}
