// next.config.mjs
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This will allow production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'assets.api.uizard.io',
            },
            {
                protocol: 'https',
                hostname: 'maps.googleapis.com',
            },

        ],
    },
    webpack: (config, { dev }) => {
        // Use MiniCssExtractPlugin in production only
        // config.plugins.push(new MiniCssExtractPlugin());


        // Modify existing rules to use MiniCssExtractPlugin.loader
        // config.module.rules.push({
        //     test: /\.css$/i,
        //     use: [MiniCssExtractPlugin.loader, "css-loader"],
        // });

        return config;
    },
};

export default nextConfig;
