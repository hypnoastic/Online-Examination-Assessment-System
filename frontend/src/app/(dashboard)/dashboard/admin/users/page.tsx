import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("ADMIN", routes.adminUsers);

export default function AdminUsersPage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.adminDashboard}
      description={page.description}
      nextSteps={[
        "User management workflows can now land here without rebuilding the Admin shell or navigation map.",
        "RBAC and breadcrumbs are already resolved above this page, so feature work can stay focused on user operations.",
        "This route should own account lifecycle, role assignment, and activation controls when the Admin module expands.",
      ]}
      role="ADMIN"
      title={page.title}
    />
  );
}
