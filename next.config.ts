import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      fs: { browser: './empty.ts' },
      stream: { browser: './empty.ts' },
      string_decoder: { browser: './empty.ts' },
      dns: { browser: './empty.ts' },
      net: { browser: './empty.ts' },
      crypto: { browser: './empty.ts' },
      tls: { browser: './empty.ts' },
    },
  },
  serverExternalPackages: ['pino', 'pino-pretty'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  // 'standalone' output is only needed for the Docker/Azure self-hosted image.
  // Vercel builds and runs the app natively, so it's disabled here. Re-enable
  // if you go back to the Docker deploy.
  // output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '2luntz9vzwxujpdd.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'storage4thebakerz.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'thebakerz.com' }],
        destination: 'https://www.thebakerz.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
