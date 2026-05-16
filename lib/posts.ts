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
  type?: "draft" | "thought" | "post";
  summary: string;
  shortSlug?: string;
  issueNumber?: number;
  discussionNumber?: number;
}

export interface Post extends PostMeta {
  html: string;
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
  return filename.replace(/\.md$/, "");
}

export function getPosts(): PostMeta[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
      const { meta } = parseFrontmatter(raw);
      return {
        slug: slugify(filename),
        title: (meta.title as string) ?? slugify(filename),
        date: (meta.date as string) ?? "",
        tags: (meta.tags as string[]) ?? [],
        audience: (meta.audience as string) ?? "public",
        draft: meta.draft === "true" || meta.draft === true,
        type: ((meta.type as string) ?? "post") as "draft" | "thought" | "post",
        summary: (meta.summary as string) ?? "",
        shortSlug: (meta.shortSlug as string) ?? undefined,
      };
    })
    .filter((p) => !p.draft && p.type !== "draft")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Render [design]: blocks as <img> tags (src/alt from block fields; strip if no src yet)
// Skips blocks inside code fences so code examples render correctly.
async function renderDesignBlocks(
  body: string,
  marked: (src: string, ...args: unknown[]) => Promise<string>,
): Promise<string> {
  const lines = body.split("\n");
  const result: string[] = [];
  let i = 0;
  let inFence = false;
  while (i < lines.length) {
    if (lines[i].startsWith("```") || lines[i].startsWith("~~~")) {
      inFence = !inFence;
      result.push(lines[i]);
      i++;
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
      const bodyHtml = await marked(bodyMd);
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
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const html = await marked(await renderDesignBlocks(body, marked));
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
    html,
  };
}
