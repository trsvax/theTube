"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PostItem {
  type: "post" | "thought" | "journal";
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
}

const ALL_ROLE_FEEDS: Record<string, string> = {
  user: "/user/index.json",
  kids: "/kids/index.json",
  friends: "/friends/index.json",
};

// thetube_roles is a hint only — not a security boundary.
// Lambda@Edge enforces access; this just avoids fetching feeds that will 403.
// Tampering with it is the hard way of typing a URL in the address bar.
function getFeeds(): string[] {
  const match = document.cookie.match(/(?:^|;\s*)thetube_roles=([^;]*)/);
  const roles = match ? decodeURIComponent(match[1]).split(",") : [];
  const roleFeeds = roles.flatMap((r) => ALL_ROLE_FEEDS[r] ?? []);
  return ["/public/index.json", ...roleFeeds];
}

async function tryFetch(url: string): Promise<PostItem[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).filter(
      (i: PostItem) => i.type === "post" || i.type === "thought" || i.type === "journal",
    );
  } catch {
    return [];
  }
}

export default function PostList({
  initialPosts = [],
}: {
  initialPosts?: PostItem[];
}) {
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const selectTag = (tag: string | null) => {
    setActiveTag(tag);
    window.history.replaceState(null, "", tag ? `#${tag}` : location.pathname);
  };

  const fetchPosts = () =>
    Promise.all(getFeeds().map(tryFetch)).then((results) => {
      const seen = new Set<string>();
      const merged = results
        .flat()
        .filter((p) => (seen.has(p.slug) ? false : seen.add(p.slug) && true))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      setPosts(merged);
    });

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) setActiveTag(hash);
    fetchPosts();
    const onVisible = () =>
      document.visibilityState === "visible" && fetchPosts();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <>
      <div className="tag-filter">
        <button
          className={`tag-btn${activeTag === null ? " active" : ""}`}
          onClick={() => selectTag(null)}>
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-btn${activeTag === tag ? " active" : ""}`}
            onClick={() => selectTag(activeTag === tag ? null : tag)}>
            #{tag}
          </button>
        ))}
      </div>
      <ul className="post-list">
        {filtered.map((post) => (
          <li key={post.slug} className="post-card">
            <Link href={`/posts/${post.slug}`}>
              <div className="post-meta">
                {post.type === "thought" && (
                  <span className="type-badge">thought</span>
                )}
                {post.date}
                {post.tags.map((t) => (
                  <span key={t} className="tag">
                    #{t}
                  </span>
                ))}
              </div>
              <div className="post-title">{post.title}</div>
              <div className="post-summary">{post.summary}</div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
