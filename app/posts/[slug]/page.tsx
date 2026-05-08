import { getPosts, getPost } from "@/lib/posts";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export async function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: `${post.title} — theTube` };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <>
      <Header />
      <main>
        <div className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            {post.date}
            {post.tags.map((t) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        <Link href="/" className="back-link">
          ← All posts
        </Link>
      </main>
      <Footer />
    </>
  );
}
