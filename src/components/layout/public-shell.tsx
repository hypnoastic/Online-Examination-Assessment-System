import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/lib/routes";

type PublicShellProps = {
  children: ReactNode;
};

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="public-shell">
      <header className="public-shell__header">
        <div>
          <p className="shell__eyebrow">Public shell baseline</p>
          <h1>Online Examination Assessment System</h1>
        </div>
        <nav className="shell__links" aria-label="Public navigation">
          <Link href={routes.home}>Landing</Link>
          <Link href={routes.login}>Login</Link>
        </nav>
      </header>
      <main className="public-shell__main">{children}</main>
    </div>
  );
}
