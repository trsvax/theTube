import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BuildWatcher from "./components/BuildWatcher";

export const metadata: Metadata = {
  title: "theTube",
  description: "Tech and travel writing.",
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: "theTube",
    description: "Tech and travel writing.",
    url: "https://thetube.today",
    siteName: "theTube",
    images: [
      { url: "https://thetube.today/images/og.png", width: 1200, height: 630 },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://thetube.today/images/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <div className="site-wrapper">
          <Header />
          <BuildWatcher />
          <main className="site-content">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
