import { A, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { CtaButton } from "@church/ui/cta-button";
import { PageShell } from "@church/ui/page-shell";
import { authClient } from "~/lib/auth-client";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    const { error: err } = await authClient.signUp.email({
      name: name().trim(),
      email: email().trim(),
      password: password(),
    });
    setPending(false);
    if (err) {
      setError(err.message ?? "Registration failed");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <PageShell
      title="Create account"
      description="Register as a church member. Branch admins are assigned by a super admin."
    >
      <form class="mx-auto flex max-w-md flex-col gap-4" onSubmit={onSubmit} noValidate>
        <div>
          <label for="register-name" class="text-ink-heading mb-1.5 block text-sm font-medium">
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            autocomplete="name"
            required
            aria-required="true"
            class="border-border focus-visible:ring-accent-500 w-full rounded-lg border bg-surface px-3 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
          />
        </div>
        <div>
          <label for="register-email" class="text-ink-heading mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            autocomplete="email"
            required
            aria-required="true"
            aria-invalid={error() ? true : undefined}
            aria-describedby={error() ? "register-error" : undefined}
            class="border-border focus-visible:ring-accent-500 w-full rounded-lg border bg-surface px-3 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
          />
        </div>
        <div>
          <label for="register-password" class="text-ink-heading mb-1.5 block text-sm font-medium">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autocomplete="new-password"
            required
            aria-required="true"
            minLength={8}
            class="border-border focus-visible:ring-accent-500 w-full rounded-lg border bg-surface px-3 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
          />
        </div>
        <Show when={error()}>
          <p id="register-error" role="alert" class="text-sm text-red-600">
            {error()}
          </p>
        </Show>
        <CtaButton type="submit" variant="cta" fullWidth disabled={pending()}>
          {pending() ? "Creating account…" : "Create account"}
        </CtaButton>
        <p class="text-ink-muted text-sm">
          Already registered?{" "}
          <A
            href="/auth/login"
            class="text-accent-600 focus-visible:ring-accent-500 font-medium underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2"
          >
            Sign in
          </A>
        </p>
      </form>
    </PageShell>
  );
}
