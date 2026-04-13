import Link from "next/link";

import { PageHeader, PageToolbar } from "@/components/layout/page-header";
import type { DashboardNavItem } from "@/lib/dashboard-navigation";
import { SurfaceCard } from "@/components/ui/shell-primitives";
import type { AppRole } from "@/modules/auth/types";

type RoleDashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

type RoleDashboardAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type RoleDashboardEntryProps = {
  role: AppRole;
  title: string;
  description: string;
  metrics: RoleDashboardMetric[];
  actions: RoleDashboardAction[];
  focusTitle: string;
  focusDescription: string;
  focusItems: string[];
  quickLinks: DashboardNavItem[];
  denied?: string;
  from?: string;
};

export function RoleDashboardEntry({
  role,
  title,
  description,
  metrics,
  actions,
  focusTitle,
  focusDescription,
  focusItems,
  quickLinks,
  denied,
  from,
}: RoleDashboardEntryProps) {
  return (
    <div className="role-dashboard-entry">
      {denied === "1" ? (
        <p className="form-alert" role="alert">
          {`You do not have access to ${from ?? "that route"}. You were returned to your allowed dashboard.`}
        </p>
      ) : null}

      <SurfaceCard className="role-dashboard-entry__hero" tone="contrast">
        <PageHeader
          actions={
            <PageToolbar align="end">
              {actions.map((action) => (
                <Link
                  key={action.href}
                  className={`button-link ${
                    action.variant === "secondary"
                      ? "button-link--secondary"
                      : "button-link--primary"
                  }`}
                  href={action.href}
                >
                  {action.label}
                </Link>
              ))}
            </PageToolbar>
          }
          description={description}
          eyebrow={`${role} workspace`}
          title={title}
          tone="inverse"
        />
      </SurfaceCard>

      <div className="role-dashboard-entry__metrics">
        {metrics.map((metric) => (
          <SurfaceCard
            key={metric.label}
            className="role-dashboard-entry__metric"
            padding="compact"
          >
            <p className="surface-card__eyebrow">{metric.label}</p>
            <h3>{metric.value}</h3>
            <p>{metric.detail}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="role-dashboard-entry__body">
        <SurfaceCard className="role-dashboard-entry__focus" tone="tint">
          <p className="surface-card__eyebrow">Dashboard direction</p>
          <div className="role-dashboard-entry__focus-copy">
            <h3>{focusTitle}</h3>
            <p>{focusDescription}</p>
          </div>

          <ul className="surface-card__list">
            {focusItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SurfaceCard>

        <SurfaceCard className="role-dashboard-entry__destinations">
          <p className="surface-card__eyebrow">Navigation destinations</p>
          <div className="role-dashboard-entry__link-grid">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                className="role-dashboard-entry__link-card"
                href={link.href}
              >
                <span className="role-dashboard-entry__link-title">
                  {link.label}
                </span>
                <span className="role-dashboard-entry__link-description">
                  {link.description}
                </span>
              </Link>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
