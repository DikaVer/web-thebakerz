import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getLocalizedMetadata, metadataTranslations } from '@/components/metadata'; // Import base metadata function and translations
import Media from '@/components/media/media';

// Define specific metadata overrides for the media page
const pageMetadataTranslations = {
    en: {
        title: 'Connect With TheBakerz | Social Media & Press Contact',
        description: 'Find and follow TheBakerz on social media platforms. Get in touch with our press team for media inquiries, interviews, and collaboration opportunities.',
        keywords: 'TheBakerz social media, bakery press contact, bakery social channels, TheBakerz LinkedIn, TheBakerz Facebook, TheBakerz Instagram, contact media team',
        ogTitle: 'Find TheBakerz On Social Media | Press & Media Contact',
        ogDescription: 'Connect with TheBakerz on LinkedIn, Facebook, Instagram, TikTok and YouTube. Contact our press team for media inquiries and collaboration opportunities.',
        twitterTitle: 'Follow TheBakerz | Social Media & Press Contact',
        twitterDescription: 'Find us on your favorite social platforms! 📱 Connect with TheBakerz and stay updated with our latest news and announcements. #bakery #socialmedia #press'
    },
    nl: {
        title: 'Verbind Met TheBakerz | Social Media & Perscontact',
        description: 'Vind en volg TheBakerz op sociale mediaplatforms. Neem contact op met ons persteam voor media-aanvragen, interviews en samenwerkingsmogelijkheden.',
        keywords: 'TheBakerz sociale media, bakkerij perscontact, bakkerij sociale kanalen, TheBakerz LinkedIn, TheBakerz Facebook, TheBakerz Instagram, contact mediateam',
        ogTitle: 'Vind TheBakerz Op Sociale Media | Pers & Mediacontact',
        ogDescription: 'Verbind met TheBakerz op LinkedIn, Facebook, Instagram, TikTok en YouTube. Neem contact op met ons persteam voor media-aanvragen en samenwerkingsmogelijkheden.',
        twitterTitle: 'Volg TheBakerz | Sociale Media & Perscontact',
        twitterDescription: 'Vind ons op je favoriete sociale platforms! 📱 Verbind met TheBakerz en blijf op de hoogte van ons laatste nieuws en aankondigingen. #bakkerij #socialemedia #pers'
    }
};

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const baseMetadata = getLocalizedMetadata(locale);

    let localeKey: 'en' | 'nl' = 'en';
    if (locale === 'nl-NL' || locale === 'nl') {
        localeKey = 'nl';
    }

    const pageSpecifics = pageMetadataTranslations[localeKey];
    const baseKeywords = metadataTranslations[localeKey].keywords.split(', ');
    const pageKeywords = pageSpecifics.keywords.split(', ');

    // Merge metadata
    return {
        ...baseMetadata,
        title: pageSpecifics.title, 
        description: pageSpecifics.description,
        keywords: Array.from(new Set([...baseKeywords, ...pageKeywords])),
        alternates: {
            ...baseMetadata.alternates,
            canonical: `https://www.thebakerz.com/media`,
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageSpecifics.ogTitle,
            description: pageSpecifics.ogDescription,
            url: `https://www.thebakerz.com/media`,
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

    return (
        <main className="min-h-screen">
            <Media />
        </main>
    );
}
