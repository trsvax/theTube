// build-indexes.mjs — generates role-scoped index.json files after next build
// Output: out/<role>/index.json for each role
import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const OUT_DIR = path.join(process.cwd(), "out");
const ROLES = ["public", "user", "kids", "friends"];

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    meta[key] =
      val.startsWith("[") && val.endsWith("]")
        ? val
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : val;
  }
  return meta;
}

const byRole = Object.fromEntries(ROLES.map((r) => [r, []]));

for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const meta = parseFrontmatter(
    fs.readFileSync(path.join(POSTS_DIR, file), "utf8"),
  );
  const role = meta.audience ?? "public";
  if (!byRole[role]) continue;
  if (meta.workflow !== "published") continue;
  byRole[role].push({
    type: meta.type ?? "post",
    slug: file.replace(/\.md$/, ""),
    title: meta.title ?? file.replace(/\.md$/, ""),
    date: meta.date ?? "",
    tags: meta.tags ?? [],
    summary: meta.summary ?? "",
    ...(meta.shortSlug ? { shortSlug: meta.shortSlug } : {}),
  });
}

for (const role of ROLES) {
  const dir = path.join(OUT_DIR, role);
  fs.mkdirSync(dir, { recursive: true });
  const items = byRole[role].sort((a, b) => (a.date < b.date ? 1 : -1));
  fs.writeFileSync(
    path.join(dir, "index.json"),
    JSON.stringify({ version: 1, role, items }, null, 2),
  );
  console.log(`${role}/index.json: ${items.length} item(s)`);
}

const buildTime = process.env.BUILD_TIME ?? new Date().toISOString();
fs.writeFileSync(
  path.join(OUT_DIR, "build.json"),
  JSON.stringify({ buildTime }, null, 2),
);
console.log(`build.json: ${buildTime}`);
