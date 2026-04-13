import { DashboardModuleScaffold } from "@/components/layout/dashboard-module-scaffold";
import { getDashboardPageContext } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";

const page = getDashboardPageContext("EXAMINER", routes.examinerQuestions);

export default function ExaminerQuestionsPage() {
  return (
    <DashboardModuleScaffold
      backHref={routes.examinerDashboard}
      description={page.description}
      nextSteps={[
        "Question authoring and maintenance can now land here without changing the shared Examiner shell.",
        "Sidebar state and breadcrumbs already point to this route, so later CRUD work keeps consistent wayfinding.",
        "This destination should own question bank structure, filters, and editing flows when that module arrives.",
      ]}
      role="EXAMINER"
      title={page.title}
    />
  );
}
