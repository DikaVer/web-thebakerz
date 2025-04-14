import type {Metadata} from "next";

export const metadataTranslations = {
    'en': {
        title: 'TheBakerz | All-in-One Platform for Bakers & Pastry Shops',
        titleTemplate: '%s | TheBakerz - Grow Your Bakery Business',
        description: 'Supercharge your bakery with TheBakerz! We offer lead generation, order management, webshop creation, marketing tools, secure payments, and delivery coordination for artisanal bakers, pastry chefs, and home bakeries. Join our marketplace or streamline your operations.',
        keywords: "bakery software, pastry shop management, artisanal bakers platform, order management system, webshop for bakers, lead generation bakery, online bakery marketplace, bread delivery service, pastry delivery, home bakery tools, payment processing bakers, marketing for bakeries, TheBakerz",
        ogTitle: 'TheBakerz: Grow Your Bakery Business - Orders, Webshop, Marketing & More',
        ogDescription: 'The complete platform for bakers & pastry chefs. Manage orders, build your webshop, attract customers, handle payments, and coordinate deliveries with TheBakerz.',
        twitterTitle: 'TheBakerz: All-in-One Bakery & Pastry Shop Platform',
        twitterDescription: 'Streamline your bakery operations! Get lead gen, order management, webshop, marketing, payments & delivery tools with TheBakerz. #bakery #pastry #smallbusiness',
        category: 'technology',
        altText: 'TheBakerz Logo - All-in-One Platform for Bakers and Pastry Shops'
    },
    'nl': {
        title: 'TheBakerz | Alles-in-één Platform voor Bakkers & Patissiers',
        titleTemplate: '%s | TheBakerz - Laat Je Bakkerij Groeien',
        description: 'Geef je bakkerij een boost met TheBakerz! Wij bieden leadgeneratie, orderbeheer, webshopcreatie, marketingtools, veilige betalingen en leveringscoördinatie voor ambachtelijke bakkers, patissiers en thuisbakkerijen. Sluit je aan bij onze marktplaats of stroomlijn je activiteiten.',
        keywords: "bakkerij software, patisserie beheer, platform ambachtelijke bakkers, orderbeheersysteem, webshop voor bakkers, leadgeneratie bakkerij, online bakkerij marktplaats, brood bezorgservice, gebak bezorging, thuisbakkerij tools, betalingsverwerking bakkers, marketing voor bakkerijen, TheBakerz",
        ogTitle: 'TheBakerz: Laat Je Bakkerij Groeien - Bestellingen, Webshop, Marketing & Meer',
        ogDescription: 'Het complete platform voor bakkers & patissiers. Beheer bestellingen, bouw je webshop, trek klanten aan, verwerk betalingen en coördineer leveringen met TheBakerz.',
        twitterTitle: 'TheBakerz: Alles-in-één Platform voor Bakkerijen & Patisserieën',
        twitterDescription: 'Stroomlijn je bakkerijactiviteiten! Krijg lead gen, orderbeheer, webshop, marketing, betalingen & bezorgtools met TheBakerz. #bakkerij #patisserie #mkb',
        category: 'technologie',
        altText: 'TheBakerz Logo - Alles-in-één Platform voor Bakkers en Patissiers'
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
        applicationName: 'TheBakerz',
        authors: [{ name: 'TheBakerz Team', url: 'https://www.thebakerz.com' }],
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
            canonical: `https://www.thebakerz.com/${localeDefault === 'nl' ? 'nl' : ''}`,
            languages: {
                'en-US': 'https://www.thebakerz.com/',
                'nl-NL': 'https://www.thebakerz.com/',
                'x-default': 'https://www.thebakerz.com/',
            }
        },
        openGraph: {
            title: translations.ogTitle,
            description: translations.ogDescription,
            url: `https://www.thebakerz.com/${localeDefault === 'nl' ? 'nl' : ''}`,
            siteName: 'TheBakerz',
            type: 'website',
            locale: localeDefault === 'nl' ? 'nl_NL' : 'en_US',
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
