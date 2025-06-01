import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getLocalizedMetadata } from '@/components/metadata'; 
import Media from '@/components/media/media';

// Define specific metadata overrides for the media page
const pageMetadataTranslations = {
    en: {
        title: 'TheBakerz Social Media & Press | Contact Us', // Optimized title < 60
        description: 'Connect with TheBakerz on LinkedIn, Facebook, Instagram, TikTok & YouTube. Contact press for media inquiries. Follow us!', // Optimized desc < 160, CTA
        keywords: 'TheBakerz social media, press contact, bakery social channels, TheBakerz LinkedIn, Facebook, Instagram, TikTok, YouTube, media inquiries, contact us', // expanded keywords
        ogTitle: 'TheBakerz Socials & Press Contact | TheBakerz', // Optimized OG
        ogDescription: 'Connect with TheBakerz on social media (LinkedIn, Facebook, Instagram, TikTok, YouTube). Contact our press team for inquiries.', // Optimized OG desc
        twitterTitle: 'Follow TheBakerz | Social Media & Press Info', // Optimized Twitter
        twitterDescription: 'Find TheBakerz on social media & get press contact info. Stay updated with our news! #bakery #socialmedia #press #TheBakerz' // Hashtag updated
    }
    // NL removed
};

export async function generateMetadata(): Promise<Metadata> {
    // const locale = await getLocale(); // locale not strictly needed
    const localeKey: 'en' = 'en'; // Hardcode to en
    const baseMetadata = getLocalizedMetadata(localeKey);

    const pageSpecifics = pageMetadataTranslations[localeKey];
    const baseKeywords = baseMetadata.keywords || [];
    const pageKeywords = pageSpecifics.keywords.split(', ');
    const canonicalUrl = `https://www.thebakerz.com/socials`; // Corrected canonical URL

    // Merge metadata
    return {
        ...baseMetadata,
        title: pageSpecifics.title, 
        description: pageSpecifics.description,
        keywords: Array.from(new Set([...baseKeywords, ...pageKeywords])),
        alternates: {
            ...baseMetadata.alternates,
            canonical: canonicalUrl,
            languages: { // Ensure only en-US and x-default are present
                'en-US': canonicalUrl,
                'x-default': canonicalUrl,
            }
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageSpecifics.ogTitle,
            description: pageSpecifics.ogDescription,
            url: canonicalUrl, // Use correct canonical URL
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageSpecifics.twitterTitle,
            description: pageSpecifics.twitterDescription,
        },
    };
}

// Media Page component
export default async function Page() {
    const contactPageSchema = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": pageMetadataTranslations.en.title,
        "description": pageMetadataTranslations.en.description,
        "url": "https://www.thebakerz.com/socials",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.thebakerz.com/socials"
        },
        "publisher": {
            "@type": "Organization",
            "name": "TheBakerz",
            "logo": {
                "@type": "ImageObject",
                "url": "https://storage4thebakerz.blob.core.windows.net/email-messages/TheBakerzLogo.svg"
            }
        }
        // Potentially add "contactPoint" if there are specific press contacts listed on the page
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
            />
            <main className="min-h-screen">
                <Media />
            </main>
        </>
    );
}
