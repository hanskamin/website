"use client";

import { useEffect, useState } from "react";

function describeWmo(code: number): string {
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code === 85 || code === 86) return "Snow";
  if (code === 95) return "Storm";
  if (code === 96 || code === 99) return "Hail storm";
  return "";
}

const BIRTH = new Date(1997, 3, 9);
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default function StatusTicker() {
  const [time, setTime] = useState("");
  const [weather, setWeather] = useState("");
  const [uptime, setUptime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hhmm = d.toLocaleTimeString("en-US", { hour12: false }).slice(0, 5);
      const tz = d.toLocaleTimeString("en-US", { timeZoneName: "short" }).split(" ").pop() ?? "";
      setTime(`${hhmm} ${tz}`);
      const days = Math.floor((Date.now() - BIRTH.getTime()) / MS_PER_DAY);
      setUptime(`${days.toLocaleString("en-US")}d`);
    };
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
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
        setWeather(`${temp}°F ${describeWmo(code)}`.trim());
      }
    };
    load().catch(() => {});
    const id = window.setInterval(() => load().catch(() => {}), 15 * 60 * 1000);
    return () => {
      controller.abort();
      window.clearInterval(id);
    };
  }, []);

  if (!time) return null;
  return (
    <dl className="ticker">
      <div>
        <dt>Local</dt>
        <dd>{time}</dd>
      </div>
      {weather && (
        <div>
          <dt>ATX</dt>
          <dd>{weather}</dd>
        </div>
      )}
      <div className="ticker-wide">
        <dt>Uptime</dt>
        <dd>{uptime}</dd>
      </div>
    </dl>
  );
}
