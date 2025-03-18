import type {Metadata} from "next";

export const metadataTranslations = {
    'en': {
        title: 'TheBakerz | All-in-One Platform for Artisanal Bakers',
        titleTemplate: '%s | TheBakerz - Bakery Management Solution',
        description: 'Transform your bakery business with TheBakerz - the complete management platform for artisanal bakers. Streamline orders, launch your webshop, and grow your business all in one place.',
        keywords: "bakery management, artisanal bakers, bakery software, order management, webshop for bakers, home bakery business, pastry business solution, bakery marketplace, artisan food platform, small bakery tools",
        ogTitle: 'TheBakerz | All-in-One Platform for Artisanal Bakers',
        ogDescription: 'Transform your bakery business with TheBakerz - the complete platform for artisanal bakers. Manage orders, run your webshop, and grow your business in one place.',
        twitterTitle: 'TheBakerz | All-in-One Bakery Management Platform',
        twitterDescription: 'Transform your bakery business with TheBakerz - the complete platform for artisanal bakers. Manage orders, run your webshop, and grow your business in one place.',
        category: 'technology',
        altText: 'TheBakerz - All-in-One Platform for Artisanal Bakers'
    },
    'nl': {
        title: 'TheBakerz | Alles-in-één Platform voor Ambachtelijke Bakkers',
        titleTemplate: '%s | TheBakerz - Bakkerij Beheersoplossing',
        description: 'Transformeer je bakkerijbedrijf met TheBakerz - het complete beheersplatform voor ambachtelijke bakkers. Stroomlijn bestellingen, lanceer je webshop en laat je bedrijf groeien, allemaal op één plek.',
        keywords: "bakkerij beheer, ambachtelijke bakkers, bakkerij software, bestellingsbeheer, webshop voor bakkers, thuisbakkerij bedrijf, patisserie bedrijfsoplossing, bakkerij marktplaats, ambachtelijk voedselplatform, kleine bakkerij hulpmiddelen",
        ogTitle: 'TheBakerz | Alles-in-één Platform voor Ambachtelijke Bakkers',
        ogDescription: 'Transformeer je bakkerijbedrijf met TheBakerz - het complete platform voor ambachtelijke bakkers. Beheer bestellingen, run je webshop en groei je bedrijf op één plek.',
        twitterTitle: 'TheBakerz | Alles-in-één Bakkerij Beheerplatform',
        twitterDescription: 'Transformeer je bakkerijbedrijf met TheBakerz - het complete platform voor ambachtelijke bakkers. Beheer bestellingen, run je webshop en groei je bedrijf op één plek.',
        category: 'technologie',
        altText: 'TheBakerz - Alles-in-één Platform voor Ambachtelijke Bakkers'
    }
};


export function getLocalizedMetadata(locale: string): Metadata {

    let localeDefault: 'en' | 'nl' = 'en';
    if (locale === 'nl-NL' || locale === 'nl') {
        localeDefault = 'nl';
    }

    const translations = metadataTranslations[localeDefault];

    return {
        metadataBase: new URL(`https://www.thebakerz.com/`),
        title: {
            default: translations.title,
            template: translations.titleTemplate
        },
        description: translations.description,
        keywords: translations.keywords,
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
            canonical: 'https://www.thebakerz.com/',
            languages: {
                'nl-NL': 'https://www.thebakerz.com/nl',
                'en-NL': 'https://www.thebakerz.com/',
            }
        },
        openGraph: {
            title: translations.ogTitle,
            description: translations.ogDescription,
            url: 'https://www.thebakerz.com/',
            siteName: 'TheBakerz',
            type: 'website',
            locale: locale === 'nl-NL' ? 'nl_NL' : 'en_NL',
            images: [
                {
                    url: 'https://storage4thebakerz.blob.core.windows.net/email-messages/TheBakerzLogo.svg',
                    width: 1301,
                    height: 1309,
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

// For backward compatibility
export const metadataDefault = getLocalizedMetadata('en');
