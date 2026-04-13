import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@oeas/backend/auth";
import { getDashboardRouteForRole } from "@oeas/backend/lib/auth/rbac";
import { SurfaceCard } from "@/components/ui/shell-primitives";
import { routes } from "@oeas/backend/lib/routes";
import { LoginForm } from "@oeas/backend/modules/auth/components/login-form";
import { mockUsers, sharedDemoPassword } from "@oeas/backend/modules/auth/mock-users";

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
    redirect(getDashboardRouteForRole(session.user.role));
  }

  return (
    <SurfaceCard className="login-panel">
      <div className="login-panel__header">
        <p className="surface-card__eyebrow">Sign in</p>
        <h2>Access the examination workspace</h2>
        <p>
          Use institutional credentials for your assigned role. Credentials
          auth, session creation, role-aware redirects, and protected dashboard
          access are now wired into the shared application shell.
        </p>
      </div>

      <LoginForm />

      <div className="login-form__actions">
        <Link className="button-link button-link--secondary" href={routes.home}>
          Back to landing
        </Link>
      </div>

      <div className="login-support-grid">
        <div className="login-support-card">
          <h3>Demo credentials</h3>
          <p>Password: {sharedDemoPassword}</p>
          <ul className="login-support-card__list">
            {mockUsers.map((user) => (
              <li key={user.id}>
                <strong>{user.role}</strong>: {user.email}
              </li>
            ))}
          </ul>
        </div>
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
