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
            videos: [
                {
                    url: 'https://www.youtube.com/watch?v=2hlFLVs1oMk',
                    type: 'video/youtube',
                    width: 1280,
                    height: 720,
                }
            ],
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageSpecifics.twitterTitle,
            description: pageSpecifics.twitterDescription,
        },
        other: {
            'video:duration': '120',
            'video:tag': 'bakery, business, platform, partnership, TheBakerz',
        }
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

    const videoSchema = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": "TheBakerz Platform Demo - How to Grow Your Bakery Business",
        "description": "Discover how TheBakerz platform helps bakers create their online presence, manage orders, and grow their business. See the platform features and tools designed specifically for bakery businesses.",
        "thumbnailUrl": "https://img.youtube.com/vi/2hlFLVs1oMk/maxresdefault.jpg",
        "uploadDate": "2024-12-01T00:00:00Z",
        "duration": "PT2M",
        "contentUrl": "https://www.youtube.com/watch?v=2hlFLVs1oMk",
        "embedUrl": "https://www.youtube-nocookie.com/embed/2hlFLVs1oMk",
        "publisher": {
            "@type": "Organization",
            "name": "TheBakerz",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.thebakerz.com/icons/icon-512x512.png"
            }
        },
        "creator": {
            "@type": "Organization",
            "name": "TheBakerz"
        },
        "mainEntity": {
            "@type": "WebPage",
            "url": "https://www.thebakerz.com/become-partner"
        },
        "keywords": "bakery business, online platform, webshop, order management, bakery marketing, TheBakerz demo",
        "isFamilyFriendly": true,
        "inLanguage": "en",
        "potentialAction": {
            "@type": "WatchAction",
            "target": "https://www.youtube.com/watch?v=2hlFLVs1oMk"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
            />
            {children}
        </>
    );
}
