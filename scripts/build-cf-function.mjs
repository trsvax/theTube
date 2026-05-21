// build-cf-function.mjs — generates the CloudFront short-URL redirect function
// Output: cf-short-urls.js (project root, uploaded to CloudFront on deploy)
import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return meta;
}

const slugs = {};

for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const meta = parseFrontmatter(
    fs.readFileSync(path.join(POSTS_DIR, file), "utf8"),
  );
  if (meta.shortSlug) {
    slugs[meta.shortSlug] = `/posts/${file.replace(/\.md$/, "")}`;
  }
}

const src = `var SLUGS = ${JSON.stringify(slugs, null, 2)};

var REDIRECTS = {
  "/blog": "/journal",
};

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Write endpoint — return 202, CloudFront logs the request
  if (uri.startsWith("/w/") && request.querystring) {
    return {
      statusCode: 202,
      statusDescription: "Accepted",
      headers: {
        "access-control-allow-origin": { value: "https://thetube.today" },
        "cache-control": { value: "no-store" },
      },
    };
  }

  // Path redirect (e.g. /blog → /journal)
  var redirect = REDIRECTS[uri];
  if (redirect) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: redirect } },
    };
  }

  // Short URL redirect
  var slug = uri.slice(1);
  var target = SLUGS[slug];
  if (target) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: target } },
    };
  }

  // Rewrite extensionless URLs to .html
  if (!uri.includes(".")) {
    var clean = uri.replace(/\\/$/, "");
    request.uri = (clean || "/index") + ".html";
  }

  return request;
}
`;

fs.writeFileSync(path.join(process.cwd(), "cf-short-urls.js"), src);
console.log(
  `cf-short-urls.js: ${Object.keys(slugs).length} slug(s) — ${JSON.stringify(slugs)}`,
);
