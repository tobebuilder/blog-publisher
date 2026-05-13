import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'pg', 'pg-cloudflare'],
  experimental: {
    serverMinification: true,
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
