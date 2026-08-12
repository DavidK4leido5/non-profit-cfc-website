import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { CtaButton } from "@church/ui/cta-button";
import {
  AuthError,
  AuthLabel,
  AuthNotice,
  AuthSplitShell,
  authFieldClass,
} from "~/app/components/auth/AuthSplitShell";
import { authClient } from "~/lib/auth-client";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [password, setPassword] = createSignal("");
  const [confirm, setConfirm] = createSignal("");
  const [error, setError] = createSignal<string | null>(null);
  const [notice, setNotice] = createSignal<string | null>(null);
  const [pending, setPending] = createSignal(false);

  const token = () => {
    const value = params.token;
    return typeof value === "string" ? value : Array.isArray(value) ? value[0] : "";
  };

  const onSubmit = async (event: Event) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (!token()) {
      setError("Missing reset token. Request a new password reset link.");
      return;
    }
    if (password() !== confirm()) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    const { error: err } = await authClient.resetPassword({
      newPassword: password(),
      token: token(),
    });
    setPending(false);
    if (err) {
      setError(err.message ?? "Could not reset password");
      return;
    }
    setNotice("Password updated. You can sign in now.");
    setTimeout(() => navigate("/auth/login"), 1200);
  };

  return (
    <AuthSplitShell
      title="Reset password"
      alternate={{ prompt: "Remembered it?", label: "Sign in", href: "/auth/login" }}
    >
      <Show
        when={token()}
        fallback={
          <div class="space-y-4">
            <AuthError message={params.error ? String(params.error) : "Open the link from your email to reset your password."} />
            <A href="/auth/login" class="text-sm font-medium text-accent-600 hover:underline">
              Back to sign in
            </A>
          </div>
        }
      >
        <form class="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <div>
            <AuthLabel for="reset-password">New password</AuthLabel>
            <input
              id="reset-password"
              type="password"
              autocomplete="new-password"
              required
              minLength={8}
              class={authFieldClass()}
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
            />
          </div>
          <div>
            <AuthLabel for="reset-confirm">Confirm password</AuthLabel>
            <input
              id="reset-confirm"
              type="password"
              autocomplete="new-password"
              required
              minLength={8}
              class={authFieldClass()}
              value={confirm()}
              onInput={(e) => setConfirm(e.currentTarget.value)}
            />
          </div>
          <AuthError message={error()} />
          <AuthNotice message={notice()} />
          <CtaButton type="submit" variant="cta" fullWidth disabled={pending()} class="rounded-xl py-3 focus-visible:ring-offset-surface">
            {pending() ? "Updating…" : "Update password"}
          </CtaButton>
        </form>
      </Show>
    </AuthSplitShell>
  );
}
