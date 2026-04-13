import { getDashboardNavigation } from "@/lib/dashboard-navigation";
import { routes } from "@oeas/backend/lib/routes";
import { RoleDashboardEntry } from "@oeas/backend/modules/auth/components/role-dashboard-entry";

type StudentDashboardPageProps = {
  searchParams?: Promise<{
    denied?: string;
    from?: string;
  }>;
};

const studentNavigation = getDashboardNavigation("STUDENT");
const studentQuickLinks = studentNavigation.sections
  .flatMap((section) => section.items)
  .filter((item) => item.href !== studentNavigation.homeHref);

export default async function StudentDashboardPage({
  searchParams,
}: StudentDashboardPageProps) {
  const params = await searchParams;

  return (
    <RoleDashboardEntry
      role="STUDENT"
      title="Student action overview"
      description="Keep the next exam, result visibility, and profile readiness easy to scan so students always know the safest next step."
      actions={[
        {
          label: "View exams",
          href: routes.studentExams,
        },
        {
          label: "Open results",
          href: routes.studentResults,
          variant: "secondary",
        },
      ]}
      metrics={[
        {
          label: "Assigned exams",
          value: "Visible",
          detail: "Student exam lists now have a dedicated destination that later attempt flows can build on safely.",
        },
        {
          label: "Result access",
          value: "Ready",
          detail: "Published results live on a separate route so post-exam review is not mixed into active exam discovery.",
        },
        {
          label: "Profile",
          value: "Linked",
          detail: "Account and readiness details now share the same student shell instead of branching into ad hoc pages.",
        },
        {
          label: "Wayfinding",
          value: "Calm",
          detail: "The student shell keeps navigation minimal and prioritizes the next safe action over dashboard noise.",
        },
      ]}
      focusTitle="The next action should always be obvious."
      focusDescription="The Student overview is reserved for readiness, assigned exams, and published results so later flows can stay focused and low-friction."
      focusItems={[
        "Upcoming or active exams should sit above secondary information and historical detail.",
        "Published results belong below current exam urgency, not mixed into the primary action zone.",
        "Profile and readiness information should support the exam journey without becoming a second dashboard.",
      ]}
      quickLinks={studentQuickLinks}
      denied={params?.denied}
      from={params?.from}
    />
  );
}
