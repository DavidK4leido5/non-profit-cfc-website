import { Button } from "@church/ui/button";
import { PageShell } from "@church/ui/page-shell";

export function LoginPage() {
  return (
    <PageShell
      title="Sign in"
      description="Add your login form here. It will POST to /api/v1/auth/login."
    >
      <Button variant="primary" href="/auth/register">
        Create an account
      </Button>
    </PageShell>
  );
}
