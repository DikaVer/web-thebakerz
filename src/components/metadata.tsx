import type {Metadata} from "next";



export const metadataTranslations = {
    'en': {
        title: 'Bakery & Pastry Shop Platform | TheBakerz',
        titleTemplate: '%s | TheBakerz',
        description: 'TheBakerz: All-in-one platform for bakers. Manage orders, webshop, payments & deliveries to grow your business. Explore now!',
        keywords: "bakery software, pastry shop management, artisanal bakers platform, order management, webshop for bakers, online bakery marketplace, cake delivery, pastry delivery, home bakery tools, payments for bakers, bakery marketing, TheBakerz, the best cakes, the best pastries, the best bread, the best desserts, the best bakery, the best pastry shop, the best bakery in the world, the best pastry shop in the world, the best cheesecake, the best chocolate, the best cookies, the best eclairs, the best macarons, the best pies, the best birthday cakes, the best wedding cakes",
        ogTitle: 'TheBakerz: Grow Your Bakery - Orders, Webshop & More',
        ogDescription: 'The complete platform for bakers: manage orders, build your webshop, attract customers, and handle payments with TheBakerz. Start today!',
        twitterTitle: 'TheBakerz: All-In-One Bakery & Pastry Platform',
        twitterDescription: 'Streamline bakery ops! Get order management, webshop, marketing, payments & delivery tools with TheBakerz. #bakery #pastry #TheBakerz',
        category: 'technology',
        altText: 'TheBakerz Logo - All-in-One Platform for Bakers and Pastry Shops'
    }
};


export function getLocalizedMetadata(locale: string): Metadata {
    const localeKey: 'en' = 'en';
    const translations = metadataTranslations[localeKey];

    const baseUrl = `https://www.thebakerz.com`;
    const canonicalUrl = locale === 'en' ? baseUrl : `${baseUrl}/${locale}`;

    return {
        metadataBase: new URL(baseUrl),
        applicationName: 'TheBakerz',
        authors: [{ name: 'TheBakerz Team', url: baseUrl }],
        title: {
            default: translations.title,
            template: translations.titleTemplate
        },
        description: translations.description,
        keywords: translations.keywords.split(', '),
        icons: {
            icon: [
                { url: '/icons/favicon.ico', sizes: '64x64', type: 'image/x-icon' },
                { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
                { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
                { url: '/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                { url: '/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
            ],
            apple: [
                { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
            ],
        },
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'en-US': baseUrl + '/',
                'x-default': baseUrl + '/',
            }
        },
        openGraph: {
            title: translations.ogTitle,
            description: translations.ogDescription,
            url: canonicalUrl,
            siteName: 'TheBakerz',
            type: 'website',
            locale: 'en_US',
            images: [
                {
                    url: 'https://storage4thebakerz.blob.core.windows.net/email-messages/TheBakerzLogo.svg',
                    width: 1200,
                    height: 630,
                    alt: translations.altText,
                },
            ],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            }
        },
        twitter: {
            card: 'summary_large_image',
            title: translations.twitterTitle,
            description: translations.twitterDescription,
            images: ['https://storage4thebakerz.blob.core.windows.net/email-messages/TheBakerzLogo.svg'],
            creator: '@the_bakerz',
            site: '@the_bakerz'
        },
        verification: {
            google: 'verification_token',
        },
        category: translations.category
    };
}

// For backward compatibility - uses 'en' metadata by default
export const metadataDefault = getLocalizedMetadata('en');
