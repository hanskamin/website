import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export default function Container({
  children,
  className,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={clsx("mx-auto w-full max-w-well px-6 md:px-8", className)}
    >
      {children}
    </Tag>
  );
}
