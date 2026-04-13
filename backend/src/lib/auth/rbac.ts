import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { routes } from "../routes";
import type { AppRole } from "../../modules/auth/types";

const dashboardRouteByRole: Record<AppRole, string> = {
  ADMIN: routes.adminDashboard,
  EXAMINER: routes.examinerDashboard,
  STUDENT: routes.studentDashboard,
};

export function getDashboardRouteForRole(role: AppRole) {
  return dashboardRouteByRole[role];
}

export function buildLoginRedirect(callbackUrl: string) {
  const searchParams = new URLSearchParams({ callbackUrl });
  return `${routes.login}?${searchParams.toString()}`;
}

export function buildUnauthorizedRedirect(role: AppRole, from: string) {
  const searchParams = new URLSearchParams({
    denied: "1",
    from,
  });

  return `${getDashboardRouteForRole(role)}?${searchParams.toString()}`;
}

export async function requireAuthenticatedSession(
  callbackUrl: string = routes.dashboard,
) {
  const session = await auth();

  if (!session?.user) {
    redirect(buildLoginRedirect(callbackUrl));
  }

  return session;
}

export async function requireRole(role: AppRole, pathname: string) {
  const session = await requireAuthenticatedSession(pathname);

  if (session.user.role !== role) {
    redirect(buildUnauthorizedRedirect(session.user.role, pathname));
  }

  return session;
}
