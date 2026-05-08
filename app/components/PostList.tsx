"use client";

import { useState } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export default function PostList({ posts }: { posts: PostMeta[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();
  const filtered = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;

  return (
    <>
      <div className="tag-filter">
        <button className={`tag-btn${activeTag === null ? " active" : ""}`} onClick={() => setActiveTag(null)}>
          All
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-btn${activeTag === tag ? " active" : ""}`}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
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
