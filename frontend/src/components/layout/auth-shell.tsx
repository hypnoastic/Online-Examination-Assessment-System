import type { ReactNode } from "react";

import {
  ContentCanvas,
  PageContainer,
  SurfaceCard,
} from "@/components/ui/shell-primitives";

const roleNotes = [
  {
    role: "Admin",
    note: "Oversee users, audit visibility, and system readiness.",
  },
  {
    role: "Examiner",
    note: "Author questions, schedule exams, and review submissions.",
  },
  {
    role: "Student",
    note: "Enter assigned exams, monitor time, and view published results.",
  },
] as const;

const trustHighlights = [
  "Role-aware session entry",
  "Secure timed assessment workflow",
  "Clear recovery and support path",
] as const;

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="shell-frame shell-frame--auth">
      <PageContainer className="shell-frame__container">
        <ContentCanvas className="auth-shell__canvas" layout="split">
          <SurfaceCard className="auth-shell__intro" tone="contrast">
            <div className="auth-shell__intro-head">
              <p className="shell-eyebrow shell-eyebrow--inverse">Secure entry</p>
              <h1>Calm sign-in for every academic role.</h1>
              <p>
                One shared access point for administrators, examiners, and
                students before protected navigation and session handling take
                over.
              </p>
            </div>
            <div className="auth-shell__trust-grid">
              {trustHighlights.map((item) => (
                <div key={item} className="auth-shell__trust-item">
                  {item}
                </div>
              ))}
            </div>
            <div className="auth-shell__role-list" aria-label="Role hints">
              {roleNotes.map((item) => (
                <div key={item.role} className="auth-shell__role-card">
                  <span>{item.role}</span>
                  <p>{item.note}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
          <main className="auth-shell__main" id="app-main-content" tabIndex={-1}>
            {children}
          </main>
        </ContentCanvas>
      </PageContainer>
    </div>
  );
}
