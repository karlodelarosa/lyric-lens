import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;

// Local dev only — must not run during `next build` (opennextjs-cloudflare preview/deploy).
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
