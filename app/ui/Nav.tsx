"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Music" },
  { href: "/software", label: "Software" },
  { href: "/volunteering", label: "Volunteering" },
  { href: "/tennis", label: "Tennis" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hms = d.toLocaleTimeString("en-US", { hour12: false });
      const tz =
        d
          .toLocaleTimeString("en-US", { timeZoneName: "short" })
          .split(" ")
          .pop() ?? "";
      setTime(`${hms} ${tz}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="topnav">
      <Link href="/" className="brand" aria-label="Home">
        HANS<span className="blink-cursor">_</span>
        <span
          className="tiny brand-meta"
          style={{
            fontFamily: "var(--body-stack)",
            fontSize: 13,
            letterSpacing: "0.22em",
            color: "var(--fg-dim)",
            marginLeft: 12,
          }}
        >
          v.86 ▸ ATX
        </span>
      </Link>

      <nav className="routes nav-desktop" aria-label="Primary">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(link.href) ? "true" : undefined}
            className="glitch"
            data-text={link.label}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="nav-desktop items-center gap-3">
        <span className="tag pink">REC ●</span>
        <span className="tiny" style={{ color: "var(--fg-dim)" }}>
          {time}
        </span>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="nav-menu-btn nav-mobile"
      >
        <span className={clsx("hamburger", open && "is-open")} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {mounted &&
        createPortal(
          <div className="nav-drawer-root nav-mobile">
            <div
              className={clsx("nav-drawer-backdrop", open && "open")}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <aside
              id="mobile-drawer"
              className={clsx("nav-drawer", open && "open")}
              aria-label="Primary"
              aria-hidden={!open}
              role="dialog"
              aria-modal="true"
            >
              <div className="nav-drawer-head">
                <span
                  className="tiny"
                  style={{
                    color: "var(--accent-2)",
                    textShadow: "0 0 6px var(--accent-2)",
                  }}
                >
                  ▸ ROUTES
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="tiny nav-drawer-close"
                >
                  ✕
                </button>
              </div>

              <ul className="nav-drawer-list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(link.href) ? "true" : undefined}
                      className="nav-drawer-link font-display-tube"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="nav-drawer-foot tiny">
                <span style={{ color: "var(--fg-dim)" }}>{time}</span>
                <span className="tag pink">REC ●</span>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </header>
  );
}
