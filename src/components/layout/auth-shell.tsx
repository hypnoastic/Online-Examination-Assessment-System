import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <section className="auth-shell__intro panel">
        <p className="panel__eyebrow">Auth route group</p>
        <div className="panel__content">
          <div className="panel__copy">
            <h1>Secure entry for shared exam operations</h1>
            <p>
              Step 1 sets the authentication shell and entry route. Session
              wiring, credential checks, and redirects land in later prompts.
            </p>
          </div>
          <ul className="panel__list">
            <li>One auth entry point for all roles</li>
            <li>Protected route behavior arrives after session plumbing</li>
            <li>UI remains intentionally minimal at this stage</li>
          </ul>
        </div>
      </section>
      <main className="auth-shell__main">{children}</main>
    </div>
  );
}
