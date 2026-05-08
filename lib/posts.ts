import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "content/posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
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
        summary: (meta.summary as string) ?? "",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug: string): Promise<Post> {
  const { marked } = await import("marked");
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  const html = await marked(body);
  return {
    slug,
    title: (meta.title as string) ?? slug,
    date: (meta.date as string) ?? "",
    tags: (meta.tags as string[]) ?? [],
    summary: (meta.summary as string) ?? "",
    html,
  };
}
