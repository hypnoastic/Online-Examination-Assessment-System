import { routes } from "@oeas/backend/lib/routes";
import type { AppRole } from "@oeas/backend/modules/auth/types";

export type DashboardNavItem = {
  label: string;
  href: string;
  description: string;
  headerTitle?: string;
};

export type DashboardNavSection = {
  label: string;
  items: DashboardNavItem[];
};

type DashboardRoleConfig = {
  role: AppRole;
  roleLabel: string;
  shellEyebrow: string;
  shellTitle: string;
  shellDescription: string;
  homeHref: string;
  sections: DashboardNavSection[];
};

type DashboardItemWithSection = DashboardNavItem & {
  sectionLabel: string;
};

type DashboardBreadcrumb = {
  label: string;
  href?: string;
};

const dashboardNavigationByRole: Record<AppRole, DashboardRoleConfig> = {
  ADMIN: {
    role: "ADMIN",
    roleLabel: "Admin",
    shellEyebrow: "Governance shell",
    shellTitle: "Operational control center",
    shellDescription:
      "Shared oversight space for user access, audit visibility, and platform reporting.",
    homeHref: routes.adminDashboard,
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Overview",
            href: routes.adminDashboard,
            headerTitle: "Admin Overview",
            description:
              "Track governance signals, access readiness, and reporting handoffs from one stable Admin workspace.",
          },
        ],
      },
      {
        label: "Operations",
        items: [
          {
            label: "Users",
            href: routes.adminUsers,
            headerTitle: "User Management",
            description:
              "Manage account access, role assignment, and activation status inside the Admin-owned workspace.",
          },
          {
            label: "Audit Logs",
            href: routes.adminAudit,
            description:
              "Inspect login, publishing, and operational activity with a dedicated audit destination.",
          },
          {
            label: "Reports",
            href: routes.adminReports,
            headerTitle: "Operational Reports",
            description:
              "Review high-level platform reporting and governance summaries without changing the shared shell.",
          },
        ],
      },
    ],
  },
  EXAMINER: {
    role: "EXAMINER",
    roleLabel: "Examiner",
    shellEyebrow: "Authoring shell",
    shellTitle: "Assessment authoring workspace",
    shellDescription:
      "Stable shell for question authoring, exam planning, grading, and result-facing analytics.",
    homeHref: routes.examinerDashboard,
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Overview",
            href: routes.examinerDashboard,
            headerTitle: "Examiner Overview",
            description:
              "Keep authored content, grading workload, and exam readiness aligned inside one Examiner workspace.",
          },
        ],
      },
      {
        label: "Authoring",
        items: [
          {
            label: "Question Bank",
            href: routes.examinerQuestions,
            description:
              "Maintain authored questions, topics, and reuse health from the shared authoring destination.",
          },
          {
            label: "Exams",
            href: routes.examinerExams,
            description:
              "Create, schedule, and assign exams from a stable route that later feature owners can extend.",
          },
        ],
      },
      {
        label: "Review",
        items: [
          {
            label: "Grading",
            href: routes.examinerGrading,
            description:
              "Review pending subjective responses and marking queues with the Examiner shell already in place.",
          },
          {
            label: "Analytics",
            href: routes.examinerAnalytics,
            description:
              "Track exam performance and publication readiness without inventing a separate dashboard pattern.",
          },
        ],
      },
    ],
  },
  STUDENT: {
    role: "STUDENT",
    roleLabel: "Student",
    shellEyebrow: "Exam shell",
    shellTitle: "Personal assessment workspace",
    shellDescription:
      "Clear student frame for assigned exams, published results, and readiness information.",
    homeHref: routes.studentDashboard,
    sections: [
      {
        label: "Overview",
        items: [
          {
            label: "Overview",
            href: routes.studentDashboard,
            headerTitle: "Student Overview",
            description:
              "Surface the next exam, result visibility, and readiness signals from the shared Student workspace.",
          },
        ],
      },
      {
        label: "Progress",
        items: [
          {
            label: "Exams",
            href: routes.studentExams,
            description:
              "Browse assigned exams, status windows, and upcoming activity from a stable student route.",
          },
          {
            label: "Results",
            href: routes.studentResults,
            description:
              "Review published outcomes and feedback within the Student-owned results destination.",
          },
          {
            label: "Profile",
            href: routes.studentProfile,
            description:
              "Check account details and exam readiness information without leaving the shared shell.",
          },
        ],
      },
    ],
  },
};

export function getDashboardNavigation(role: AppRole) {
  return dashboardNavigationByRole[role];
}

export function getDashboardNavItems(role: AppRole): DashboardItemWithSection[] {
  return getDashboardNavigation(role).sections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      sectionLabel: section.label,
    })),
  );
}

export function getDashboardPageContext(role: AppRole, pathname: string) {
  const navigation = getDashboardNavigation(role);
  const items = [...getDashboardNavItems(role)].sort(
    (left, right) => right.href.length - left.href.length,
  );

  const activeItem =
    items.find(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? items[0];

  const breadcrumbs: DashboardBreadcrumb[] = [
    {
      label: `${navigation.roleLabel} Workspace`,
      href: navigation.homeHref,
    },
  ];

  if (activeItem.href !== navigation.homeHref) {
    breadcrumbs.push({
      label: activeItem.label,
      href: activeItem.href,
    });
  }

  return {
    activeItem,
    breadcrumbs,
    roleLabel: navigation.roleLabel,
    title: activeItem.headerTitle ?? activeItem.label,
    description: activeItem.description,
  };
}
