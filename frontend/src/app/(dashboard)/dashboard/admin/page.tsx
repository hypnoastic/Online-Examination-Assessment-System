import { getDashboardNavigation } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";
import { RoleDashboardEntry } from "@oeas/backend/modules/auth/components/role-dashboard-entry";

type AdminDashboardPageProps = {
  searchParams?: Promise<{
    denied?: string;
    from?: string;
  }>;
};

const adminNavigation = getDashboardNavigation("ADMIN");
const adminQuickLinks = adminNavigation.sections
  .flatMap((section) => section.items)
  .filter((item) => item.href !== adminNavigation.homeHref);

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const params = await searchParams;

  return (
    <RoleDashboardEntry
      role="ADMIN"
      title="Governance overview"
      description="Give Admin users one calm operational summary surface before deeper user, audit, and reporting workflows take over."
      actions={[
        {
          label: "Manage users",
          href: routes.adminUsers,
        },
        {
          label: "Open reports",
          href: routes.adminReports,
          variant: "secondary",
        },
      ]}
      metrics={[
        {
          label: "Access control",
          value: "Role-ready",
          detail: "Admin-only user management routes already inherit the protected shell and navigation contract.",
        },
        {
          label: "Audit trail",
          value: "Visible",
          detail: "Audit navigation and breadcrumbs are reserved so future work can land without restructuring the app.",
        },
        {
          label: "Reporting",
          value: "Prepared",
          detail: "Operational reporting has an explicit destination instead of being buried inside the overview screen.",
        },
        {
          label: "Shell status",
          value: "Stable",
          detail: "Every Admin page now shares the same sidebar, top header, and route-aware breadcrumbs.",
        },
      ]}
      focusTitle="Operational signals should surface first."
      focusDescription="The Admin landing screen is intentionally shaped around governance rather than academic detail so later owners inherit the right hierarchy."
      focusItems={[
        "User counts, activation status, and role distribution should lead the overview.",
        "Audit visibility should stay close to access control and publishing activity.",
        "Operational reports belong in a separate destination, not mixed into user maintenance.",
      ]}
      quickLinks={adminQuickLinks}
      denied={params?.denied}
      from={params?.from}
    />
  );
}
