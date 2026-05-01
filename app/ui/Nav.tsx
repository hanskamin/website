"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Music" },
  { href: "/software", label: "Software" },
  { href: "/volunteering", label: "Volunteering" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 surface-frost border-b border-white/5">
      <nav className="mx-auto w-full max-w-well px-6 md:px-8 h-14 md:h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-sub text-frost tracking-tight"
          aria-label="Home"
        >
          Hans
        </Link>

        <ul className="hidden md:flex items-center gap-elem">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={clsx(
                  "text-body transition-colors duration-200",
                  isActive(link.href)
                    ? "text-frost"
                    : "text-whisper hover:text-frost",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-body text-frost px-2 py-2 -mr-2 min-h-[44px]"
        >
          {open ? "Close" : "Menu"}
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={clsx(
          "md:hidden surface-frost border-t border-white/5 overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <ul className="mx-auto w-full max-w-well px-6 py-4 flex flex-col gap-elem">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "block text-sub py-2 transition-colors duration-200",
                  isActive(link.href)
                    ? "text-frost"
                    : "text-whisper hover:text-frost",
                )}
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
