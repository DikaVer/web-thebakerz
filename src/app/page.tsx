import { Footer } from '@/components/footer';
import { LandingHeroSection } from '@/components/landing/marketplace/landing-hero-section';
import { BakersGrowthSection } from '@/components/landing/marketplace/bakers-growth-section';
import { getSearchCoordinates } from '@/lib/actions/cookies/delivery-cookie';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getLocalizedMetadata, metadataTranslations } from '@/components/metadata'; // Import base metadata function and translations
import Partners from '@/components/landing/partners';
import { GoogleMapsProvider } from '@/components/providers/google-maps-provider';

// Define specific metadata overrides for the homepage
const pageMetadataTranslations = {
    en: {
        title: 'Find Local Bakeries & Pastry Shops Near You | TheBakerz Marketplace',
        description: 'Easily find and order from the best local artisanal bakeries, home bakers, and pastry shops near you. Enter your address to discover fresh bread, cakes, pastries, and more on TheBakerz.',
        keywords: 'find local bakery, bakery near me, pastry shop near me, order bread online, order cake online, local food delivery, artisanal bread delivery, home bakery near me, TheBakerz marketplace',
        ogTitle: 'Discover & Order from Local Bakeries Near You | TheBakerz',
        ogDescription: 'Find the best artisanal bread, pastries, and cakes from local bakers. Enter your address and explore bakeries near you on TheBakerz.',
        twitterTitle: 'Find Local Bakeries & Pastry Shops Nearby | TheBakerz',
        twitterDescription: 'Craving fresh baked goods? 🥐🎂 Find and order from local artisanal bakeries near you on TheBakerz marketplace. #localbakery #bakerynearme #pastries #cakes #bread'
    },
    nl: {
        title: 'Vind Lokale Bakkers & Patissiers bij Jou in de Buurt | TheBakerz Marktplaats',
        description: 'Vind en bestel eenvoudig bij de beste lokale ambachtelijke bakkers, thuisbakkers en patissiers bij jou in de buurt. Voer je adres in en ontdek vers brood, taarten, gebak en meer op TheBakerz.',
        keywords: 'lokale bakker vinden, bakker in de buurt, patisserie in de buurt, online brood bestellen, online taart bestellen, lokale voedselbezorging, ambachtelijk brood bezorgen, thuisbakker in de buurt, TheBakerz marktplaats',
        ogTitle: 'Ontdek & Bestel bij Lokale Bakkers in de Buurt | TheBakerz',
        ogDescription: 'Vind het beste ambachtelijke brood, gebak en taarten van lokale bakkers. Voer je adres in en verken bakkerijen bij jou in de buurt op TheBakerz.',
        twitterTitle: 'Vind Lokale Bakkers & Patisserieën in de Buurt | TheBakerz',
        twitterDescription: 'Zin in verse baksels? 🥐🎂 Vind en bestel bij lokale ambachtelijke bakkers bij jou in de buurt op de TheBakerz marktplaats. #lokalebakker #bakkerindebuurt #gebak #taarten #brood'
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
        title: pageSpecifics.title, // Override title
        description: pageSpecifics.description, // Override description
        keywords: Array.from(new Set([...baseKeywords, ...pageKeywords])), // Merge and deduplicate keywords
        alternates: {
            ...baseMetadata.alternates,
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageSpecifics.ogTitle, // Override OG title
            description: pageSpecifics.ogDescription, // Override OG description
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageSpecifics.twitterTitle, // Override Twitter title
            description: pageSpecifics.twitterDescription, // Override Twitter description
        },
    };
}

// Main HomePage component
export default async function Page() {

    const initialCoords = await getSearchCoordinates();
    if (initialCoords) {
        redirect(`/search`);
    }

  return (
    <main className="min-h-screen">
     <LandingHeroSection />
      <BakersGrowthSection />
      <Partners />  
      <Footer />
    </main>
  );
}
