import { PageShell } from "~/app/components/ui/PageShell";

export function RegisterPage() {
  return (
    <PageShell
      title="Create account"
      description="Add your registration form here. It will POST to /api/v1/auth/register."
    />
  );
}
