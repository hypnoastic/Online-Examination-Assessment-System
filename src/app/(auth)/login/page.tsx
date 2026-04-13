import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth";
import { SurfaceCard } from "@/components/ui/shell-primitives";
import { routes } from "@/lib/routes";
import { LoginForm } from "@/modules/auth/components/login-form";

const supportCards = [
  {
    title: "Invite activation",
    detail: "First-time users can complete password setup once account activation is enabled.",
  },
  {
    title: "Exam support",
    detail: "Students should confirm browser, network stability, and assigned exam window before starting.",
  },
] as const;

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect(routes.dashboard);
  }

  return (
    <SurfaceCard className="login-panel">
      <div className="login-panel__header">
        <p className="surface-card__eyebrow">Sign in</p>
        <h2>Access the examination workspace</h2>
        <p>
          Use institutional credentials for your assigned role. Credentials
          auth, session creation, and logout are now wired, while route guards
          and role redirects land in the next step.
        </p>
      </div>

      <LoginForm />

      <div className="login-form__actions">
        <Link className="button-link button-link--secondary" href={routes.home}>
          Back to landing
        </Link>
      </div>

      <div className="login-support-grid">
        {supportCards.map((card) => (
          <div key={card.title} className="login-support-card">
            <h3>{card.title}</h3>
            <p>{card.detail}</p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}
