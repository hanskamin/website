"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";

type Drag = { id: number; y: number; h: number; moved: boolean };

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
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);
  const [height, setHeight] = useState<number | null>(null);

  // Bottom sheet on phones: drag the grip to resize, release to snap.
  const onDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (!ref.current || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = {
      id: e.pointerId,
      y: e.clientY,
      h: ref.current.getBoundingClientRect().height,
      moved: false,
    };
    dragged.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dy) < 6) return;
    d.moved = true;
    setHeight(Math.min(window.innerHeight - 64, Math.max(60, d.h - dy)));
  };
  const onEnd = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) return;
    dragged.current = true;
    setHeight(null);
    if (e.type === "pointercancel") return;
    const h = d.h - (e.clientY - d.y);
    const small = window.innerHeight * 0.56;
    const big = window.innerHeight - 64;
    if (h < small * 0.6) router.push("/");
    else if (h > (small + big) / 2 !== expanded) onToggle();
  };
  const onClick = () => {
    if (dragged.current) {
      dragged.current = false;
      return;
    }
    onToggle();
  };

  return (
    <aside
      ref={ref}
      className={`panel${expanded ? " is-expanded" : ""}${height !== null ? " is-dragging" : ""}`}
      style={height !== null ? { height } : undefined}
      aria-label={title}
    >
      <button
        type="button"
        className="panel-grab"
        onClick={onClick}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
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
