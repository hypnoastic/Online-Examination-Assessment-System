import { getDashboardNavigation } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";
import { RoleDashboardEntry } from "@oeas/backend/modules/auth/components/role-dashboard-entry";

type ExaminerDashboardPageProps = {
  searchParams?: Promise<{
    denied?: string;
    from?: string;
  }>;
};

const examinerNavigation = getDashboardNavigation("EXAMINER");
const examinerQuickLinks = examinerNavigation.sections
  .flatMap((section) => section.items)
  .filter((item) => item.href !== examinerNavigation.homeHref);

export default async function ExaminerDashboardPage({
  searchParams,
}: ExaminerDashboardPageProps) {
  const params = await searchParams;

  return (
    <RoleDashboardEntry
      role="EXAMINER"
      title="Assessment authoring overview"
      description="Give Examiner users a clear launch point for question authoring, exam management, grading, and analytics without competing dashboard patterns."
      actions={[
        {
          label: "Open question bank",
          href: routes.examinerQuestions,
        },
        {
          label: "Manage exams",
          href: routes.examinerExams,
          variant: "secondary",
        },
      ]}
      metrics={[
        {
          label: "Question bank",
          value: "Prepared",
          detail: "Question authoring now has a stable route and shared shell destination for downstream CRUD work.",
        },
        {
          label: "Exam planning",
          value: "Scoped",
          detail: "Exam creation and scheduling routes are explicit so feature owners do not invent parallel structures.",
        },
        {
          label: "Review queue",
          value: "Ready",
          detail: "Grading lives on its own route with breadcrumbs and role-aware navigation already wired.",
        },
        {
          label: "Analytics",
          value: "Mapped",
          detail: "Examiner analytics is separated from grading and authoring instead of being hidden behind overview cards.",
        },
      ]}
      focusTitle="Authoring and grading should feel like one workflow."
      focusDescription="The Examiner shell keeps content creation, delivery, and review close together while preserving distinct destinations for each workload."
      focusItems={[
        "Overview should surface draft exams, upcoming schedules, and pending review load.",
        "Question bank and exam authoring need separate navigation destinations, not a blended workspace.",
        "Analytics belongs alongside publishing readiness, not buried inside grading internals.",
      ]}
      quickLinks={examinerQuickLinks}
      denied={params?.denied}
      from={params?.from}
    />
  );
}
