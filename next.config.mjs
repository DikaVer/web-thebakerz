// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This will allow production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'assets.api.uizard.io',
            },
        ],
    },
};

export default nextConfig;
