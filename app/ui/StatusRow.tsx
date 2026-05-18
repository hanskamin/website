"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Block = { k: string; v: string; href?: string };

function StatusBlock({ k, v, href }: Block) {
  const blockStyle: React.CSSProperties = {
    display: "block",
    padding: "12px 14px",
    border:
      "1px solid color-mix(in oklch, var(--accent-2) 40%, transparent)",
    background: "linear-gradient(180deg, var(--panel-1), var(--panel-2))",
    boxShadow:
      "inset 0 0 16px color-mix(in oklch, var(--accent-2) 10%, transparent)",
    color: "inherit",
    textDecoration: "none",
  };
  const content = (
    <>
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
    </>
  );
  if (href) {
    return (
      <Link href={href} className="status-link" style={blockStyle}>
        {content}
      </Link>
    );
  }
  return <div style={blockStyle}>{content}</div>;
}

function describeWmo(code: number): string {
  if (code === 0) return "CLEAR";
  if (code === 1) return "MOSTLY CLEAR";
  if (code === 2) return "PARTLY CLOUDY";
  if (code === 3) return "OVERCAST";
  if (code === 45 || code === 48) return "FOG";
  if (code >= 51 && code <= 57) return "DRIZZLE";
  if (code >= 61 && code <= 67) return "RAIN";
  if (code >= 71 && code <= 77) return "SNOW";
  if (code >= 80 && code <= 82) return "SHOWERS";
  if (code === 85 || code === 86) return "SNOW";
  if (code === 95) return "STORM";
  if (code === 96 || code === 99) return "HAIL STORM";
  return "—";
}

const BIRTH = new Date(1997, 3, 9);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysSinceBirth(): string {
  const days = Math.floor((Date.now() - BIRTH.getTime()) / MS_PER_DAY);
  return `${days.toLocaleString("en-US")}d`;
}

export default function StatusRow() {
  const [localTime, setLocalTime] = useState("--:--");
  const [weather, setWeather] = useState("--°F · ...");
  const [uptime, setUptime] = useState("—d");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hhmm = d
        .toLocaleTimeString("en-US", { hour12: false })
        .slice(0, 5);
      const tz =
        d
          .toLocaleTimeString("en-US", { timeZoneName: "short" })
          .split(" ")
          .pop() ?? "";
      setLocalTime(`${hhmm} ${tz}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setUptime(daysSinceBirth());
    const id = setInterval(() => setUptime(daysSinceBirth()), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=30.2672&longitude=-97.7431&current=temperature_2m,weather_code&temperature_unit=fahrenheit",
        { signal: controller.signal, cache: "no-store" },
      );
      if (!res.ok) return;
      const json = await res.json();
      const temp = Math.round(json?.current?.temperature_2m);
      const code = json?.current?.weather_code;
      if (Number.isFinite(temp) && Number.isFinite(code)) {
        setWeather(`${temp}°F · ${describeWmo(code)}`);
      }
    };
    load().catch(() => {});
    const id = setInterval(() => load().catch(() => {}), 15 * 60 * 1000);
    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, []);

  return (
    <>
      <StatusBlock k="LOCAL TIME" v={localTime} />
      <StatusBlock k="WEATHER · ATX" v={weather} />
      <StatusBlock
        k="NOW PLAYING"
        v="BE HONEST"
        href="/music?play=rUI_9sBqF0A"
      />
      <StatusBlock k="UPTIME" v={uptime} />
      <style>{`
        .status-link:hover {
          border-color: color-mix(in oklch, var(--accent-2) 70%, transparent) !important;
          box-shadow: inset 0 0 22px color-mix(in oklch, var(--accent-2) 22%, transparent),
                      0 0 18px color-mix(in oklch, var(--accent-2) 30%, transparent) !important;
          transition: var(--t-fast);
        }
      `}</style>
    </>
  );
}
