"use client";

import { useEffect, useRef } from "react";
import { SOFTWARE_LINKS, STACK, TIMELINE } from "../content";

export default function SoftwarePanel({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (i: number) => void;
}) {
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    rows.current[selected]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  const groups = ["FRONT", "BACK", "INFRA"];

  return (
    <>
      <p className="lede">
        Fullstack engineer. React / React Native / Node / Python. Currently at Reflex in
        Austin, TX.
      </p>

      <section aria-label="Career">
        <h2 className="section-title">
          Career
        </h2>
        <ol className="career">
          {TIMELINE.map((t, i) => (
            <li
              key={t.year + t.co}
              ref={(el) => {
                rows.current[i] = el;
              }}
              className="career-row"
              aria-current={i === selected ? "true" : undefined}
              onClick={() => onSelect(i)}
            >
              <button
                type="button"
                className="career-year"
                onClick={() => onSelect(i)}
                aria-label={`Show ${t.co} on the monitors`}
              >
                {t.year}
              </button>
              <div>
                <h3>
                  {t.role} <span>at</span>{" "}
                  <a href={t.link} target="_blank" rel="noreferrer">
                    {t.co}
                  </a>
                </h3>
                <p>{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Stack">
        <h2 className="section-title">Stack</h2>
        <dl className="stack">
          {groups.map((g) => (
            <div key={g}>
              <dt>{g}</dt>
              <dd>
                {STACK.filter((s) => s.tag === g).map((s) => (
                  <span key={s.label} className="tag">
                    {s.label}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="Links">
        <h2 className="section-title">Links</h2>
        <ul className="links">
          {SOFTWARE_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer">
                <span className="tag">{l.tag}</span>
                <span>{l.label}</span>
                <span aria-hidden="true">▸</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
