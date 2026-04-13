export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  adminDashboard: "/dashboard/admin",
  adminUsers: "/dashboard/admin/users",
  adminAudit: "/dashboard/admin/audit",
  adminReports: "/dashboard/admin/reports",
  examinerDashboard: "/dashboard/examiner",
  examinerQuestions: "/dashboard/examiner/questions",
  examinerExams: "/dashboard/examiner/exams",
  examinerGrading: "/dashboard/examiner/grading",
  examinerAnalytics: "/dashboard/examiner/analytics",
  studentDashboard: "/dashboard/student",
  studentExams: "/dashboard/student/exams",
  studentResults: "/dashboard/student/results",
  studentProfile: "/dashboard/student/profile",
} as const;

export const publicRoutes = [routes.home, routes.login] as const;
