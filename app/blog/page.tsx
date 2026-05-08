import type { Metadata } from "next";
import { getPosts } from "@/lib/posts";
import PostList from "@/app/components/PostList";

export const metadata: Metadata = {
  title: "Blog — theTube",
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <div className="page-content">
      <h1>Blog</h1>
      <PostList posts={posts} />
    </div>
  );
}
