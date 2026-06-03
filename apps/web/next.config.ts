import "@graphora/env/web";
import { env } from "@graphora/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/:path*`,
      },
      {
        source: "/graphql",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/graphql`,
      },
      // If you have other REST endpoints under /api or similar
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
