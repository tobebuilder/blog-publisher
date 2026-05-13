import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'pg', 'pg-cloudflare'],
};

export default nextConfig;
