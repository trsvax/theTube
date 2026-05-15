"use client";

import { useState } from "react";

type Tab = "me" | "site";

export default function AboutTabs({
  meHtml,
  siteHtml,
}: {
  meHtml: string;
  siteHtml: string;
}) {
  const [tab, setTab] = useState<Tab>("me");

  return (
    <>
      <div className="about-tabs">
        <button
          className={`about-tab${tab === "me" ? " active" : ""}`}
          onClick={() => setTab("me")}>
          me
        </button>
        <button
          className={`about-tab${tab === "site" ? " active" : ""}`}
          onClick={() => setTab("site")}>
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
