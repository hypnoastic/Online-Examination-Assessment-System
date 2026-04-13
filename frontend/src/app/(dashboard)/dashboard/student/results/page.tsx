import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("STUDENT", routes.studentResults);

export default function StudentResultsPage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.studentDashboard}
      description={page.description}
      nextSteps={[
        "Student result summaries and detail views can now attach to this route without inventing a second shell.",
        "The shared Student navigation keeps results distinct from active exam participation.",
        "This page should later focus on published outcomes, feedback, and result drill-down rather than exam-start actions.",
      ]}
      role="STUDENT"
      title={page.title}
    />
  );
}
