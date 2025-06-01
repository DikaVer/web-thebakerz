import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getLocalizedMetadata } from '@/components/metadata';

// Define page-specific metadata translations
const pageMetadataTranslations = {
    en: {
        title: "Partner with TheBakerz: Grow Your Bakery Business",
        description: "Join TheBakerz to get a webshop, manage orders & recipes, and reach more customers. Start your to grow your business now!",
        keywords: "bakery partner program, webshop for bakers, bakery software, online bakery platform, grow bakery business, bakery order management, bakery marketing, free trial",
        ogTitle: "Partner with TheBakerz & Boost Your Bakery Sales",
        ogDescription: "Expand reach & simplify operations with TheBakerz. Get your webshop, order tools & more. Sign up for a free access!",
        twitterTitle: "Grow Your Bakery with TheBakerz | Become a Partner",
        twitterDescription: "Boost sales with TheBakerz! Free access for webshop, order tools & more. #bakerybusiness #onlinebakery #TheBakerzPartner"
    }
};

// GenerateMetadata function
export async function generateMetadata(): Promise<Metadata> {
    // Always use 'en' as we are removing 'nl'
    const localeKey: 'en' = 'en';
    const baseMetadata = getLocalizedMetadata(localeKey);

    const pageSpecifics = pageMetadataTranslations[localeKey];

    // Merge keywords
    const baseKeywords = baseMetadata.keywords || [];
    const pageKeywords = pageSpecifics.keywords.split(', ');
    const mergedKeywords = Array.from(new Set([...baseKeywords, ...pageKeywords]));

    const canonicalUrl = `https://www.thebakerz.com/become-partner`;

    return {
        ...baseMetadata,
        title: pageSpecifics.title,
        description: pageSpecifics.description,
        keywords: mergedKeywords,
        alternates: {
            ...baseMetadata.alternates,
            canonical: canonicalUrl,
            languages: {
                'en-US': canonicalUrl,
                'x-default': canonicalUrl,
            }
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageSpecifics.ogTitle,
            description: pageSpecifics.ogDescription,
            url: canonicalUrl,
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageSpecifics.twitterTitle,
            description: pageSpecifics.twitterDescription,
        },
    };
}

export default function Layout({ children }: { children: React.ReactNode }) {
    const serviceSchema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "BusinessPlatform",
        "provider": {
            "@type": "Organization",
            "name": "TheBakerz"
        },
        "name": "TheBakerz Partner Program",
        "description": pageMetadataTranslations.en.description,
        "url": "https://www.thebakerz.com/become-partner",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR",
            "availability": "https://schema.org/OnlineOnly",
            "name": "Free Trial"
        },
        "areaServed": {
            "@type": "Country",
            "name": "Netherlands"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            {children}
        </>
    );
}
