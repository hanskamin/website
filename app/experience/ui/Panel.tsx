import Link from "next/link";
import type { ReactNode } from "react";

export default function Panel({
  kicker,
  title,
  expanded,
  onToggle,
  children,
}: {
  kicker: string;
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
        <div>
          <p className="kicker">{kicker}</p>
          <h1>{title}</h1>
        </div>
        <Link href="/" className="panel-close" aria-label="Back to Centre Court">
          ✕
        </Link>
      </header>
      <div className="panel-body">{children}</div>
    </aside>
  );
}
