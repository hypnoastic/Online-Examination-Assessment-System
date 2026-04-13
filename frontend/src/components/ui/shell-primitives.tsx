import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";

import { cn } from "@/lib/class-names";

type PrimitiveTag = ElementType;

type BasePrimitiveProps = {
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">;

type PageContainerProps = BasePrimitiveProps & {
  as?: PrimitiveTag;
  width?: "default" | "wide";
};

type ContentCanvasProps = BasePrimitiveProps & {
  as?: PrimitiveTag;
  layout?: "stack" | "split";
};

type SurfaceCardProps = BasePrimitiveProps & {
  as?: PrimitiveTag;
  tone?: "default" | "tint" | "contrast";
  padding?: "default" | "compact";
};

export function PageContainer({
  as: Component = "div",
  children,
  className,
  width = "default",
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        "page-container",
        width === "wide" && "page-container--wide",
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function ContentCanvas({
  as: Component = "div",
  children,
  className,
  layout = "stack",
}: ContentCanvasProps) {
  return (
    <Component className={cn("content-canvas", className)} data-layout={layout}>
      {children}
    </Component>
  );
}

export function SurfaceCard({
  as: Component = "section",
  children,
  className,
  tone = "default",
  padding = "default",
}: SurfaceCardProps) {
  return (
    <Component
      className={cn("surface-card", className)}
      data-tone={tone}
      data-padding={padding}
    >
      {children}
    </Component>
  );
}
