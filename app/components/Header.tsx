import Link from "next/link";

export default function Header() {
  return (
    <header>
      <Link href="/" className="site-title">
        theTube
      </Link>
      <nav>
        <Link href="/about">About</Link>
      </nav>
    </header>
  );
}
