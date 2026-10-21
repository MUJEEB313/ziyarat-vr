import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` writes plain HTML to ./out (served by GitHub Pages).
  output: "export",
  // Served under /<repo-name> on GitHub Pages; empty for a custom domain.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  // Directory-style URLs (/videos/ → videos/index.html) work on any static host.
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
