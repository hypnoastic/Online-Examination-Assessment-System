import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("STUDENT", routes.studentProfile);

export default function StudentProfilePage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.studentDashboard}
      description={page.description}
      nextSteps={[
        "Student profile and readiness details now have a stable destination inside the shared shell.",
        "Future work can add account details and exam-readiness signals here without rewriting navigation.",
        "This route should support the exam journey and remain lighter than exam lists or results-heavy views.",
      ]}
      role="STUDENT"
      title={page.title}
    />
  );
}
