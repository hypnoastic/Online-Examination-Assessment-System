import type { ReactNode } from "react";

import { cn } from "@/lib/class-names";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  tone?: "default" | "inverse";
  titleAs?: "h1" | "h2" | "h3";
  className?: string;
};

type PageToolbarProps = {
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  tone = "default",
  titleAs: TitleTag = "h2",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "page-header",
        tone === "inverse" && "page-header--inverse",
        className,
      )}
    >
      <div className="page-header__copy">
        {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
        <TitleTag>{title}</TitleTag>
        {description ? <p>{description}</p> : null}
      </div>

      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </div>
  );
}

export function PageToolbar({
  children,
  align = "start",
  className,
}: PageToolbarProps) {
  return (
    <div
      className={cn(
        "page-toolbar",
        align === "end" && "page-toolbar--end",
        className,
      )}
    >
      {children}
    </div>
  );
}
