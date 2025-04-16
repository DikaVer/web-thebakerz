import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getLocalizedMetadata, metadataTranslations } from '@/components/metadata';

// Define page-specific metadata translations
const pageMetadataTranslations = {
    en: {
        title: "Become a Partner | Grow Your Bakery with TheBakerz",
        description: "Join TheBakerz platform! Get your own webshop, streamline orders, manage recipes, and reach more customers. Start your free trial today.",
        keywords: "join thebakerz, bakery partner program, bakery software signup, webshop for bakers, online bakery platform, grow bakery business, bakery order management, free trial bakery software",
        ogTitle: "Partner with TheBakerz & Grow Your Bakery Business",
        ogDescription: "Expand your reach and simplify operations. Get a dedicated webshop, order management, and more with TheBakerz. Sign up now!",
        twitterTitle: "Grow Your Bakery with TheBakerz | Become a Partner",
        twitterDescription: "Ready to boost your bakery sales? Join TheBakerz for a free trial and get your own webshop, order tools, and more. #bakerybusiness #onlinebakery #pastrychef"
    },
    nl: {
        title: "Word Partner | Laat Je Bakkerij Groeien met TheBakerz",
        description: "Sluit je aan bij het TheBakerz platform! Krijg je eigen webshop, stroomlijn bestellingen, beheer recepten en bereik meer klanten. Start vandaag nog je gratis proefperiode.",
        keywords: "word lid van thebakerz, partnerprogramma bakkerij, aanmelden bakkerij software, webshop voor bakkers, online bakkerij platform, bakkerij laten groeien, orderbeheer bakkerij, gratis proefversie bakkerij software",
        ogTitle: "Word Partner van TheBakerz & Laat Je Bakkerij Groeien",
        ogDescription: "Vergroot je bereik en vereenvoudig je activiteiten. Krijg een eigen webshop, orderbeheer en meer met TheBakerz. Meld je nu aan!",
        twitterTitle: "Laat Je Bakkerij Groeien met TheBakerz | Word Partner",
        twitterDescription: "Klaar om je bakkerijomzet te verhogen? Sluit je aan bij TheBakerz voor een gratis proefperiode en krijg je eigen webshop, besteltools en meer. #bakkerij #onlinebakkerij #patissier"
    }
};

// GenerateMetadata function
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const baseMetadata = getLocalizedMetadata(locale);

    let localeKey: 'en' | 'nl' = 'en';
    if (locale === 'nl-NL' || locale === 'nl') {
        localeKey = 'nl';
    }

    const pageSpecifics = pageMetadataTranslations[localeKey];
    const partnerUrl = `https://www.thebakerz.com/become-partner`;

    // Merge keywords
    const baseKeywords = metadataTranslations[localeKey].keywords.split(', ');
    const pageKeywords = pageSpecifics.keywords.split(', ');
    const mergedKeywords = Array.from(new Set([...baseKeywords, ...pageKeywords]));

    return {
        ...baseMetadata,
        title: pageSpecifics.title,
        description: pageSpecifics.description,
        keywords: mergedKeywords,
        alternates: {
            ...baseMetadata.alternates,
            canonical: partnerUrl,
            languages: {
                'en-US': `https://www.thebakerz.com/become-partner`,
                'nl-NL': `https://www.thebakerz.com/become-partner`,
                'x-default': `https://www.thebakerz.com/become-partner`,
            }
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageSpecifics.ogTitle,
            description: pageSpecifics.ogDescription,
            url: partnerUrl,
            // Consider a specific OG image for this page?
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageSpecifics.twitterTitle,
            description: pageSpecifics.twitterDescription,
            // Consider a specific Twitter image for this page?
        },
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
