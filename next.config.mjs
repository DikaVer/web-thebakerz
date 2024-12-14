// next.config.mjs
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
            }

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
};

export default nextConfig;
