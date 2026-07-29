import { PageShell } from "~/app/components/ui/PageShell";

export function LoginPage() {
  return (
    <PageShell
      title="Sign in"
      description="Add your login form here. It will POST to /api/v1/auth/login."
    />
  );
}
