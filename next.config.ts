import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "",
  images: {
    unoptimized: true, // required for static export
  },
  env: {
    COMMIT_APP: process.env.COMMIT_APP ?? "dev",
    COMMIT_CONTENT: process.env.COMMIT_CONTENT ?? "dev",
    COMMIT_PRIVATE: process.env.COMMIT_PRIVATE ?? "dev",
  },
};

export default nextConfig;
