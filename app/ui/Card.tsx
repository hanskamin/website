import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  surface?: boolean;
};

export default function Card({
  children,
  className,
  as: Tag = "article",
  surface = false,
}: CardProps) {
  return (
    <Tag
      className={clsx(
        surface && "surface-frost rounded-card p-card",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
