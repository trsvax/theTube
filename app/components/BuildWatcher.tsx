"use client";

import { useEffect, useState } from "react";

const CURRENT = process.env.NEXT_PUBLIC_BUILD_TIME;

export default function BuildWatcher() {
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/build.json", { cache: "no-store" });
        if (!res.ok) return;
        const { buildTime } = await res.json();
        if (CURRENT && buildTime && buildTime !== CURRENT) setStale(true);
      } catch {
        // ignore network errors
      }
    };

    check();
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  if (!stale) return null;

  return (
    <div className="build-banner">
      New version available —{" "}
      <button onClick={() => window.location.reload()}>reload</button>
    </div>
  );
}
