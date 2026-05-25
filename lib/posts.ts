import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  audience: string;
  draft?: boolean;
  workflow?: "draft" | "published";
  type?: "thought" | "post" | "journal";
  summary: string;
  shortSlug?: string;
  issueNumber?: number;
  discussionNumber?: number;
  coffee?: number;
}

export interface Post extends PostMeta {
  html: string;
  comments?: boolean;
}

// Vendored frontmatter parser — reads YAML block between --- delimiters.
// Supports string, array, and date values. No external dep needed.
function parseFrontmatter(raw: string): {
  meta: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    // array: [a, b, c]
    if (val.startsWith("[") && val.endsWith("]")) {
      meta[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      meta[key] = val;
    }
  }
  return { meta, body: match[2] };
}

function slugify(filename: string): string {
  // Strip directory prefix (e.g. 2026/05/) and .md extension — slug is always flat
  return path.basename(filename).replace(/\.md$/, "");
}

function findMarkdownFiles(dir: string, prefix = ""): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith(".md")) {
      files.push(rel);
    }
  }
  return files;
}

// Build a map of slug → relative path for resolving nested files
function buildSlugMap(): Map<string, string> {
  const files = findMarkdownFiles(POSTS_DIR);
  const map = new Map<string, string>();
  for (const f of files) {
    map.set(slugify(f), f);
  }
  return map;
}

const slugMap = buildSlugMap();

export function getPosts(): PostMeta[] {
  return [...slugMap.entries()]
    .map(([slug, filename]) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { meta } = parseFrontmatter(raw);
      return {
        slug,
        title: (meta.title as string) ?? slugify(filename),
        date: (meta.date as string) ?? "",
        tags: (meta.tags as string[]) ?? [],
        audience: (meta.audience as string) ?? "public",
        draft: meta.draft === "true" || meta.draft === true,
        workflow: ((meta.workflow as string) ?? "draft") as
          | "draft"
          | "published",
        type: ((meta.type as string) ?? "post") as
          | "thought"
          | "post"
          | "journal",
        summary: (meta.summary as string) ?? "",
        shortSlug: (meta.shortSlug as string) ?? undefined,
        coffee: meta.coffee ? Number(meta.coffee) : undefined,
      };
    })
    .filter((p) => p.workflow === "published")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// All slugs regardless of workflow — used by generateStaticParams to build all pages
export function getAllSlugs(): string[] {
  return [...slugMap.keys()];
}

// Render [design]: blocks as <img> tags (src/alt from block fields; strip if no src yet)
// Skips blocks inside code fences so code examples render correctly.
async function renderDesignBlocks(body: string): Promise<string> {
  const lines = body.split("\n");
  const result: string[] = [];
  let i = 0;
  let inFence = false;
  while (i < lines.length) {
    if (lines[i].startsWith("```") || lines[i].startsWith("~~~")) {
      inFence = !inFence;
      result.push(lines[i]);
      i++;
    } else if (!inFence && /^\[comment\]:/.test(lines[i])) {
      // Strip [comment]: lines — they're handled as a flag, not rendered
      i++;
    } else if (!inFence && /^\[(kiro|claude)\]:/.test(lines[i])) {
      // Strip [kiro]: and [claude]: blocks — AI metadata, not rendered
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        i++;
      }
      // Consume blank line terminator
      if (i < lines.length && lines[i].trim() === "") i++;
    } else if (!inFence && /^\[design\]:\s*.+$/.test(lines[i])) {
      let alt = "";
      let src = "";
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        if (lines[i].startsWith("alt: ")) alt = lines[i].slice(5).trim();
        else if (lines[i].startsWith("src: ")) src = lines[i].slice(5).trim();
        i++;
      }
      // Consume blank line terminator
      if (i < lines.length) i++;
      if (src) {
        const escapedAlt = alt.replace(/"/g, "&quot;");
        result.push(`<img src="${src}" alt="${escapedAlt}">`);
        result.push("");
      }
    } else if (!inFence && /^\[share\]:/.test(lines[i])) {
      let caption = "";
      let src = "";
      let captured = "";
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        if (lines[i].startsWith("caption: "))
          caption = lines[i].slice(9).trim();
        else if (lines[i].startsWith("src: ")) src = lines[i].slice(5).trim();
        else if (lines[i].startsWith("captured: "))
          captured = lines[i].slice(10).trim();
        i++;
      }
      // Consume blank line terminator
      if (i < lines.length) i++;
      if (src) {
        const esc = (s: string) => s.replace(/"/g, "&quot;");
        const figcaption = [caption, captured].filter(Boolean).join(" · ");
        result.push(
          `<figure class="share-image"><img src="${esc(src)}" alt="${esc(caption)}"><figcaption>${figcaption}</figcaption></figure>`,
        );
        result.push("");
      }
    } else if (!inFence && /^\[journey\]:/.test(lines[i])) {
      const summaryRaw = lines[i].slice(10).trim();
      const summary = summaryRaw || "The journey";
      i++;
      // Journey is always last — consume all remaining lines
      const bodyLines: string[] = [];
      while (i < lines.length) {
        bodyLines.push(lines[i]);
        i++;
      }
      const esc = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const repoBase = "https://github.com/trsvax/theTube/commit/";
      // Render inline [commit sha] references as GitHub links, then pass through marked
      const bodyMd = bodyLines
        .join("\n")
        .split(/\[commit ([0-9a-f]+)\]/g)
        .map((part, idx) =>
          idx % 2 === 0 ? part : `[${part.slice(0, 7)}](${repoBase}${part})`,
        )
        .join("");
      const { marked: markedInner } = await import("marked");
      const bodyHtml = await markedInner(bodyMd);
      result.push(
        `<details>\n<summary>${esc(summary)}</summary>\n${bodyHtml}</details>`,
      );
      result.push("");
    } else {
      result.push(lines[i]);
      i++;
    }
  }
  return result.join("\n");
}

export async function getPost(slug: string): Promise<Post> {
  const { marked } = await import("marked");
  const relPath = slugMap.get(slug);
  if (!relPath) throw new Error(`Post not found: ${slug}`);
  const raw = fs.readFileSync(path.join(POSTS_DIR, relPath), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const comments = /^\[comment\]:/m.test(body);
  const html = await marked(await renderDesignBlocks(body));
  return {
    slug,
    title: (meta.title as string) ?? slug,
    date: (meta.date as string) ?? "",
    tags: (meta.tags as string[]) ?? [],
    audience: (meta.audience as string) ?? "public",
    summary: (meta.summary as string) ?? "",
    shortSlug: (meta.shortSlug as string) ?? undefined,
    issueNumber: meta.issueNumber ? Number(meta.issueNumber) : undefined,
    discussionNumber: meta.discussionNumber
      ? Number(meta.discussionNumber)
      : undefined,
    coffee: meta.coffee ? Number(meta.coffee) : undefined,
    comments,
    html,
  };
}
