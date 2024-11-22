import type {Metadata} from "next";

export const metadataDefault: Metadata = {
    metadataBase: new URL(`https://www.TheBakerz.com/`),
    title: {
        default: 'TheBakerz',
        template: `%s | All-in-One Platform for Artisanal Bakers`
    },
    description: 'Transform your bakery business with TheBakerz - the complete platform for artisanal bakers. Manage orders, run your webshop, and grow your business in one place.',
    keywords: "bakery, artisanal, bakers, platform, webshop, orders, business growth, bakery management, online bakery marketplace",
    icons: {
        icon: [
            { url: '/icons/favicon.ico', sizes: '64x64', type: 'image/x-icon' },
            { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            // Android Chrome Icons
            { url: '/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [
            { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
        ],
    },
    alternates: {
        canonical: 'https://www.TheBakerz.com/',
    },
    openGraph: {
        title: 'TheBakerz',
        description: 'Transform your bakery business with TheBakerz - the complete platform for artisanal bakers. Manage orders, run your webshop, and grow your business in one place.',
        url: 'https://www.TheBakerz.com/',
        type: 'website',
        locale: 'en_US',
        images: [
            {
                url: 'https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/webStorage/TheBakerzLogo-50OzU9kUKfg3O3kD1MT1p8bBfdxxY2.png',
                width: 1301,
                height: 1309,
                alt: 'TheBakerz - All-in-One Platform for Artisanal Bakers',
            },
        ],
    },
    robots: 'index, follow',
    twitter: {
        card: 'summary_large_image',
        title: 'TheBakerz',
        description: 'Transform your bakery business with TheBakerz - the complete platform for artisanal bakers. Manage orders, run your webshop, and grow your business in one place.',
        images: ['https://2luntz9vzwxujpdd.public.blob.vercel-storage.com/webStorage/TheBakerzLogo-50OzU9kUKfg3O3kD1MT1p8bBfdxxY2.png'],
        creator: '@the_bakerz',
    },
}