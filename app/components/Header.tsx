"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
const LOGIN_URL =
  "https://thetube.auth.us-east-1.amazoncognito.com/oauth2/authorize" +
  "?client_id=6ml2ns0ra2rdsjlaiov1hmankt" +
  "&response_type=code" +
  "&scope=email+openid+profile" +
  "&redirect_uri=https://auth.thetube.today/callback";

const LOGOUT_URL = "https://auth.thetube.today/logout";

function getUser(): string | null {
  const match = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("thetube_user="));
  return match
    ? decodeURIComponent(match.trim().slice("thetube_user=".length))
    : null;
}

export default function Header() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <header>
      <Link href="/" className="site-logo">
        <picture>
          <source
            srcSet="/logo-primary-dark.svg"
            media="(prefers-color-scheme: dark)"
          />
          <img
            src="/logo-primary-light.svg"
            alt="The Tube — a stream of thoughts"
            height={80}
          />
        </picture>
      </Link>
      <nav>
        <Link href="/journal">Journal</Link>
        <Link href="/links">Links</Link>
        <Link href="/about">About</Link>
        <a
          href="https://github.com/trsvax/theTube"
          aria-label="GitHub"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-icon">
          <svg
            height="22"
            width="22"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
        {user ? (
          <a
            href={LOGOUT_URL}
            aria-label={`Sign out ${user}`}
            title={user}
            className="nav-icon">
            <svg
              height="22"
              width="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </a>
        ) : (
          <a href={LOGIN_URL} className="nav-auth">
            Sign in
          </a>
        )}
      </nav>
    </header>
  );
}
