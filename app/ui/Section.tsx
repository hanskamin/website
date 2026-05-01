import clsx from "clsx";
import type { ReactNode } from "react";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export default function Section({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={clsx("py-10 md:py-section", className)}
    >
      {children}
    </section>
  );
}
