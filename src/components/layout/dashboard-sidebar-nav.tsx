"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getDashboardNavigation } from "@/lib/dashboard-navigation";
import { cn } from "@/lib/class-names";
import type { AppRole } from "@/modules/auth/types";

type DashboardSidebarNavProps = {
  role: AppRole;
  id?: string;
};

export function DashboardSidebarNav({ role, id }: DashboardSidebarNavProps) {
  const pathname = usePathname();
  const navigation = getDashboardNavigation(role);

  return (
    <nav
      aria-label={`${navigation.roleLabel} navigation`}
      className="dashboard-nav"
      id={id}
    >
      {navigation.sections.map((section) => (
        <div key={section.label} className="dashboard-nav__section">
          <p className="dashboard-nav__section-label">{section.label}</p>
          <div className="dashboard-nav__items">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn("dashboard-nav__link", isActive && "is-active")}
                  data-active={isActive}
                  href={item.href}
                >
                  <span className="dashboard-nav__link-title">{item.label}</span>
                  <span className="dashboard-nav__link-description">
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
