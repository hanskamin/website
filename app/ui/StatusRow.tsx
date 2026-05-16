"use client";

import { useEffect, useState } from "react";

type Block = { k: string; v: string };

function StatusBlock({ k, v }: Block) {
  return (
    <div
      style={{
        padding: "12px 14px",
        border:
          "1px solid color-mix(in oklch, var(--accent-2) 40%, transparent)",
        background: "linear-gradient(180deg, var(--panel-1), var(--panel-2))",
        boxShadow:
          "inset 0 0 16px color-mix(in oklch, var(--accent-2) 10%, transparent)",
      }}
    >
      <div className="tiny" style={{ color: "var(--fg-dim)" }}>
        {k}
      </div>
      <div
        className="font-display-tube"
        style={{
          fontSize: 18,
          color: "var(--accent-2)",
          textShadow: "0 0 8px var(--accent-2)",
          marginTop: 4,
        }}
      >
        {v}
      </div>
    </div>
  );
}

export default function StatusRow() {
  const [localTime, setLocalTime] = useState("--:--");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setLocalTime(
        d.toLocaleTimeString("en-US", { hour12: false }).slice(0, 5) + " EST",
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <StatusBlock k="LOCAL TIME" v={localTime} />
      <StatusBlock k="WEATHER" v="64°F · CLEAR" />
      <StatusBlock k="MOOD" v="MAGENTA" />
      <StatusBlock k="UPTIME" v="11,326d" />
    </>
  );
}
