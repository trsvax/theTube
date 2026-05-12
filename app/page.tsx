import { getPosts } from "../lib/posts";
import PostList from "./components/PostList";

export default function IndexPage() {
  const publicPosts = getPosts()
    .filter((p) => p.audience === "public")
    .map((p) => ({ type: "post" as const, slug: p.slug, title: p.title, date: p.date, tags: p.tags, summary: p.summary }));
  return <PostList initialPosts={publicPosts} />;
}
