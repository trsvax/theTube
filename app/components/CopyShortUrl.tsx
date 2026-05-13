"use client";

import { useState } from "react";

export default function CopyShortUrl({ shortSlug }: { shortSlug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/${shortSlug}`;

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button className="short-url-copy" onClick={copy} title={url}>
      {copied ? "copied" : `/${shortSlug}`}
    </button>
  );
}
