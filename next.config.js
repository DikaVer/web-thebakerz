const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */
const nextConfig = {
    // cacheHandler: require.resolve("./cache-handler.mjs"),
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
            '*.webp': {
                loaders: ['@webpr/webpack'],
                as: '*.js',
            },
        },
    },
    serverExternalPackages: ["pino", "pino-pretty"],
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
    bundlePagesRouterDependencies: true,
    eslint: {
        // Warning: This will allow production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: false,
    },

    output: 'standalone',
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
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        if (isServer) {
            config.plugins.push(
                new webpack.IgnorePlugin({
                    resourceRegExp: /^pg-native$/,
                })
            );
        }

        config.resolve.fallback = {
            fs: false,
            stream: false,
            string_decoder: false,
            dns: false,
            net: false,
            crypto: false,
            tls: false,
        };

        // Ensure no aliases or modifications are breaking module resolution
        return config;
    },
    async redirects() {
        return [
            {
                // any path, but only when host is bare domain
                source: '/:path*',
                has: [{ type: 'host', value: 'thebakerz.com' }],
                destination: 'https://www.thebakerz.com/:path*',
                permanent: true,
            },
        ];
    },
};

module.exports = withNextIntl(nextConfig);

