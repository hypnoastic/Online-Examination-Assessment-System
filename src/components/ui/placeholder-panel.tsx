import type { ReactNode } from "react";

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
    <section className="panel">
      <p className="panel__eyebrow">{eyebrow}</p>
      <div className="panel__content">
        <div className="panel__copy">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {items?.length ? (
          <ul className="panel__list">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {children ? <div className="shell__links">{children}</div> : null}
    </section>
  );
}
