import { A, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { CtaButton } from "@church/ui/cta-button";
import { PageShell } from "@church/ui/page-shell";
import { authClient } from "~/lib/auth-client";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    const { error: err } = await authClient.signIn.email({
      email: email().trim(),
      password: password(),
    });
    setPending(false);
    if (err) {
      setError(err.message ?? "Sign in failed");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <PageShell title="Sign in" description="Access your church account and branch dashboard.">
      <form class="mx-auto flex max-w-md flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div>
          <label for="login-email" class="text-ink-heading mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autocomplete="email"
            required
            aria-required="true"
            aria-invalid={error() ? true : undefined}
            aria-describedby={error() ? "login-error" : undefined}
            class="border-border focus-visible:ring-accent-500 w-full rounded-lg border bg-surface px-3 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
        <div>
          <label for="login-password" class="text-ink-heading mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autocomplete="current-password"
            required
            aria-required="true"
            class="border-border focus-visible:ring-accent-500 w-full rounded-lg border bg-surface px-3 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
        <Show when={error()}>
          <p id="login-error" role="alert" class="text-sm text-red-600">
            {error()}
          </p>
        </Show>
        <CtaButton type="submit" variant="cta" fullWidth disabled={pending()}>
          {pending() ? "Signing in…" : "Sign in"}
        </CtaButton>
        <p class="text-ink-muted text-sm">
          No account?{" "}
          <A
            href="/auth/register"
            class="text-accent-600 focus-visible:ring-accent-500 font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2"
          >
            Create one
          </A>
        </p>
      </form>
    </PageShell>
  );
}
