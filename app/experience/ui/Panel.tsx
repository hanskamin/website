import Link from "next/link";
import type { ReactNode } from "react";

export default function Panel({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <aside className={`panel${expanded ? " is-expanded" : ""}`} aria-label={title}>
      <button
        type="button"
        className="panel-grab"
        onClick={onToggle}
        aria-label={expanded ? "Make the panel smaller" : "Make the panel larger"}
        aria-expanded={expanded}
      >
        <span />
      </button>
      <header className="panel-head">
        <h1>{title}</h1>
        <Link href="/" className="panel-close" aria-label="Back to Centre Court">
          ✕
        </Link>
      </header>
      <div className="panel-body">{children}</div>
    </aside>
  );
}
