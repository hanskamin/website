"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="topnav">
      <Link href="/" className="brand" aria-label="Home">
        HANS<span className="blink-cursor">_</span>
        <span
          className="tiny"
          style={{
            fontFamily: "var(--body-stack)",
            fontSize: 10,
            letterSpacing: "0.24em",
            color: "var(--fg-dim)",
            marginLeft: 12,
          }}
        >
          v.86 ▸ ATX
        </span>
      </Link>

      <nav className="routes hidden md:flex" aria-label="Primary">
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

      <div className="hidden md:flex items-center gap-3">
        <span className="tag pink">REC ●</span>
        <span className="tiny" style={{ color: "var(--fg-dim)" }}>
          {time}
        </span>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden tiny"
        style={{
          background: "transparent",
          color: "var(--fg)",
          border: "1px solid color-mix(in oklch, var(--accent) 50%, transparent)",
          padding: "8px 12px",
        }}
      >
        {open ? "CLOSE ✕" : "MENU ▸"}
      </button>

      <div
        id="mobile-nav"
        className={clsx(
          "md:hidden absolute left-0 right-0 top-full overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
        style={{
          background: "oklch(0.07 0.04 290 / 0.96)",
          borderBottom: "1px solid color-mix(in oklch, var(--accent) 40%, transparent)",
          backdropFilter: "blur(12px) saturate(140%)",
        }}
      >
        <ul className="flex flex-col gap-2 px-6 py-4 m-0 list-none">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? "true" : undefined}
                className={clsx(
                  "block py-2 tiny",
                  isActive(link.href)
                    ? "text-[var(--fg)]"
                    : "text-[var(--fg-dim)] hover:text-[var(--fg)]",
                )}
                style={{
                  textShadow: isActive(link.href)
                    ? "0 0 8px var(--accent)"
                    : undefined,
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
