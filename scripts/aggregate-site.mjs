// aggregate-site.mjs — builds site.json from the sections registry
// Commit the output to the repo; the aggregate workflow syncs it to S3.
// Add new content sources here when they come online.
import fs from "node:fs";
import path from "node:path";

const SECTIONS = [
  { slug: "public", contentUrl: "/public/content.json", role: "public" },
  { slug: "user", contentUrl: "/user/content.json", role: "user" },
  { slug: "kids", contentUrl: "/kids/content.json", role: "kids" },
  { slug: "friends", contentUrl: "/friends/content.json", role: "friends" },
  {
    slug: "tapestry-nocode",
    contentUrl: "/books/tapestry-nocode/content.json",
    role: "public",
  },
];

const site = {
  updated: new Date().toISOString(),
  sections: SECTIONS,
};

fs.writeFileSync(
  path.join(process.cwd(), "site.json"),
  JSON.stringify(site, null, 2),
);

console.log(`site.json updated: ${site.updated}`);
console.log(`sections: ${SECTIONS.map((s) => s.slug).join(", ")}`);
