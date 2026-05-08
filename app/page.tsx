import { getPosts } from "@/lib/posts";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PostList from "./components/PostList";

export default function IndexPage() {
  const posts = getPosts();
  return (
    <>
      <Header />
      <main>
        <PostList posts={posts} />
      </main>
      <Footer />
    </>
  );
}
