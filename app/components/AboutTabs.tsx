"use client";

import { useEffect, useState } from "react";

type Tab = "me" | "site";

export default function AboutTabs({
  meHtml,
  siteHtml,
}: {
  meHtml: string;
  siteHtml: string;
}) {
  const [tab, setTab] = useState<Tab>("me");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "site" || hash === "me") setTab(hash);
  }, []);

  const switchTab = (t: Tab) => {
    setTab(t);
    window.history.replaceState(null, "", t === "me" ? "#me" : "#site");
  };

  return (
    <>
      <div className="about-tabs">
        <button
          className={`about-tab${tab === "me" ? " active" : ""}`}
          onClick={() => switchTab("me")}>
          me
        </button>
        <button
          className={`about-tab${tab === "site" ? " active" : ""}`}
          onClick={() => switchTab("site")}>
          site
        </button>
      </div>
      <div
        className="page-content post-body"
        dangerouslySetInnerHTML={{ __html: tab === "me" ? meHtml : siteHtml }}
      />
    </>
  );
}
