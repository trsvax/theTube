import type { Metadata } from "next";
import PostList from "@/app/components/PostList";

export const metadata: Metadata = {
  title: "Blog — theTube",
};

export default function BlogPage() {
  return (
    <div className="page-content">
      <h1>Blog</h1>
      <PostList />
    </div>
  );
}
