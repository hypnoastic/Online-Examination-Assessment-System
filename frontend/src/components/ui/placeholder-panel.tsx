import type { ReactNode } from "react";

import { SurfaceCard } from "@/components/ui/shell-primitives";

type PlaceholderPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  items?: readonly string[];
  children?: ReactNode;
};

export function PlaceholderPanel({
  eyebrow,
  title,
  description,
  items,
  children,
}: PlaceholderPanelProps) {
  return (
    <SurfaceCard className="placeholder-panel">
      <p className="surface-card__eyebrow">{eyebrow}</p>
      <div className="surface-card__content">
        <div className="surface-card__copy">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {items?.length ? (
          <ul className="surface-card__list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {children ? <div className="shell-links">{children}</div> : null}
    </SurfaceCard>
  );
}
