import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("ADMIN", routes.adminReports);

export default function AdminReportsPage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.adminDashboard}
      description={page.description}
      nextSteps={[
        "Operational reporting now has a dedicated Admin destination instead of being folded into overview-only cards.",
        "Feature owners can build reporting panels here without creating a second dashboard shell or route convention.",
        "This route should stay focused on governance summaries and platform health rather than user-editing workflows.",
      ]}
      role="ADMIN"
      title={page.title}
    />
  );
}
