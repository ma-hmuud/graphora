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
        destination: `${env.NEXT_PUBLIC_SERVER_URL}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
