"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PostItem {
  type: "post";
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
}

const FEEDS = [
  "https://thetube.today/public/content.json",
  "https://user.thetube.today/content.json",
  "https://kids.thetube.today/content.json",
  "https://friends.thetube.today/content.json",
];

async function tryFetch(url: string): Promise<PostItem[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).filter((i: PostItem) => i.type === "post");
  } catch {
    return [];
  }
}

export default function PostList() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const fetchPosts = () =>
    Promise.all(FEEDS.map(tryFetch)).then((results) => {
      const seen = new Set<string>();
      const merged = results
        .flat()
        .filter((p) => (seen.has(p.slug) ? false : seen.add(p.slug) && true))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      setPosts(merged);
    });

  useEffect(() => {
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
          onClick={() => setActiveTag(null)}>
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-btn${activeTag === tag ? " active" : ""}`}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}>
            {tag}
          </button>
        ))}
      </div>
      <ul className="post-list">
        {filtered.map((post) => (
          <li key={post.slug} className="post-card">
            <Link href={`/posts/${post.slug}`}>
              <div className="post-meta">
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
