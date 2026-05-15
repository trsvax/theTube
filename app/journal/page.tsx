import type { Metadata } from "next";
import PostList from "@/app/components/PostList";

export const metadata: Metadata = {
  title: "Journal — theTube",
};

export default function JournalPage() {
  return (
    <div className="page-content">
      <h1>Blog</h1>
      <PostList />
    </div>
  );
}
