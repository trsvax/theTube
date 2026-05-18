import { getPosts, getPost } from "@/lib/posts";
import Link from "next/link";
import CopyShortUrl from "@/app/components/CopyShortUrl";

export async function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: `${post.title} — theTube` };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <>
      <div className="post-header">
        <h1>{post.title}</h1>
        <div className="post-meta">
          {post.date}
          {post.tags.map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
          {post.shortSlug && <CopyShortUrl shortSlug={post.shortSlug} />}
          {post.coffee && <span className="coffee">☕ {post.coffee}</span>}
        </div>
      </div>
      <div
        className="post-body"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
      <div className="post-footer">
        <Link href="/" className="back-link">
          ← All posts
        </Link>
        {(post.discussionNumber || post.issueNumber) && (
          <a
            href={`https://github.com/trsvax/theTube/issues/${post.discussionNumber ?? post.issueNumber}`}
            className="discuss-link"
            target="_blank"
            rel="noopener noreferrer">
            Discuss on GitHub →
          </a>
        )}
      </div>
    </>
  );
}
