// aggregate-site.mjs — builds index.json from the sections registry
// Commit the output to the repo; the aggregate workflow syncs it to S3.
// Add new content sources here when they come online.
import fs from "node:fs";
import path from "node:path";

const SECTIONS = [
  { slug: "public", contentUrl: "/public/index.json", role: "public" },
  { slug: "user", contentUrl: "/user/index.json", role: "user" },
  { slug: "kids", contentUrl: "/kids/index.json", role: "kids" },
  { slug: "friends", contentUrl: "/friends/index.json", role: "friends" },
  {
    slug: "tapestry-nocode",
    contentUrl: "/books/tapestry-nocode/index.json",
    role: "public",
  },
];

const site = {
  updated: new Date().toISOString(),
  sections: SECTIONS,
};

fs.writeFileSync(
  path.join(process.cwd(), "index.json"),
  JSON.stringify(site, null, 2),
);

console.log(`index.json updated: ${site.updated}`);
console.log(`sections: ${SECTIONS.map((s) => s.slug).join(", ")}`);
