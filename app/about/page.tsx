import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import AboutTabs from "../components/AboutTabs";

export const metadata: Metadata = {
  title: "About — theTube",
};

export default async function AboutPage() {
  const contentDir = path.join(process.cwd(), "content");
  const [meHtml, siteHtml] = await Promise.all([
    marked(fs.readFileSync(path.join(contentDir, "about.md"), "utf8")),
    marked(fs.readFileSync(path.join(contentDir, "site.md"), "utf8")),
  ]);
  return <AboutTabs meHtml={meHtml} siteHtml={siteHtml} />;
}
