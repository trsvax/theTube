import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

export const metadata: Metadata = {
  title: "Links — theTube",
};

export default async function LinksPage() {
  const raw = fs.readFileSync(
    path.join(process.cwd(), "content/links.md"),
    "utf8",
  );
  const html = await marked(raw);
  return (
    <div
      className="page-content post-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
