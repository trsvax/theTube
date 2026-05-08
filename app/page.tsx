import { getPosts } from "@/lib/posts";
import PostList from "./components/PostList";

export default function IndexPage() {
  const posts = getPosts();
  return <PostList posts={posts} />;
}
