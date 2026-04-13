"use client";

import { useEffect, useEffectEvent, useId, useState } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/class-names";
import { getDashboardNavigation } from "@/lib/dashboard-navigation";

type DashboardShellToggleProps = {
  user: Session["user"];
};

export function DashboardShellToggle({
  user,
}: DashboardShellToggleProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navigationId = useId();
  const navigation = getDashboardNavigation(user.role);
  const closeMenuOnRouteChange = useEffectEvent(() => {
    setIsOpen(false);
  });

  useEffect(() => {
    closeMenuOnRouteChange();
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <aside
      className={cn("dashboard-shell__sidebar", isOpen && "is-open")}
      data-open={isOpen}
    >
      {isOpen ? (
        <>
          <button
            aria-label="Close navigation menu"
            className="dashboard-shell__backdrop"
            onClick={() => setIsOpen(false)}
            type="button"
          />

          <div className="dashboard-shell__sidebar-panel">
            <div className="dashboard-shell__sidebar-frame">
              <PageHeader
                actions={
                  <button
                    className="dashboard-shell__close-button"
                    onClick={() => setIsOpen(false)}
                    type="button"
                  >
                    Close
                  </button>
                }
                className="dashboard-shell__mobile-header"
                description={navigation.shellDescription}
                eyebrow={navigation.shellEyebrow}
                title={navigation.shellTitle}
                tone="inverse"
              />

              <div className="dashboard-shell__brand dashboard-shell__brand--desktop">
                <p className="shell-eyebrow shell-eyebrow--inverse">
                  {navigation.shellEyebrow}
                </p>
                <h1>{navigation.shellTitle}</h1>
                <p>{navigation.shellDescription}</p>
              </div>

              <div className="dashboard-shell__identity">
                <span className="dashboard-shell__identity-role">
                  {navigation.roleLabel}
                </span>
                <div className="dashboard-shell__identity-copy">
                  <p>{user.name}</p>
                  <span>{user.email}</span>
                </div>
              </div>

              <DashboardSidebarNav id={navigationId} role={user.role} />
            </div>
          </div>
        </>
      ) : null}

      <button
        aria-controls={navigationId}
        aria-expanded={isOpen}
        className="dashboard-shell__menu-button"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {isOpen ? "Close menu" : "Open menu"}
      </button>
    </aside>
  );
}
