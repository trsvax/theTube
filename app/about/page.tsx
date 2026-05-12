import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — theTube",
};

export default function AboutPage() {
  return (
    <div className="page-content">
      <h1>About</h1>

      <p>
        I&apos;m Barry Books — software engineer, cyclist, occasional traveler. I&apos;ve been
        building things on the web for a long time. This is where I write about it.
      </p>

      <p>
        theTube is a personal blog: technical posts, travel writing, and things I want to
        share with family and friends. Some of it is public. Some of it requires a login.
        The distinction isn&apos;t about paywalls — it&apos;s about audience. A post about a
        family trip belongs to a different group than a post about Lambda@Edge.
      </p>

      <p>
        The site is built on static HTML with no server. Authentication is real — Cognito,
        JWT, Lambda@Edge — but the public content is just files on S3. It works in Lynx.
        It costs about $1 a month. The architecture is its own argument for how much of
        the web doesn&apos;t need to be as complicated as it is.
      </p>

      <p>
        I&apos;m interested in owning what I write. Not because platforms are bad, but because
        a URL that belongs to me doesn&apos;t change when a company changes its terms. The
        content stays, the links stay, the audience I build here is mine.
      </p>

      <h2>Find me</h2>
      <ul>
        <li><a href="https://github.com/trsvax" rel="me noopener noreferrer" target="_blank">GitHub</a></li>
      </ul>

      <h2>This site</h2>
      <ul>
        <li>Built with Next.js, static export, S3 + CloudFront</li>
        <li>Source: <a href="https://github.com/trsvax/theTube" target="_blank" rel="noopener noreferrer">github.com/trsvax/theTube</a></li>
        <li>Have a thought? <a href="https://github.com/trsvax/theTube/issues" target="_blank" rel="noopener noreferrer">Open an issue</a></li>
      </ul>
    </div>
  );
}
