import { Footer } from '@/components/footer';
import { LandingHeroSection } from '@/components/landing/marketplace/landing-hero-section';
import { BakersGrowthSection } from '@/components/landing/marketplace/bakers-growth-section';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server'; // Kept for potential future use, though hardcoding to 'en' now
import { getLocalizedMetadata } from '@/components/metadata'; // Removed metadataTranslations
import Partners from '@/components/landing/partners';
import { GoogleMapsProvider } from '@/components/providers/google-maps-provider';

// Define specific metadata overrides for the homepage
const pageMetadataTranslations = {
    en: {
        title: 'Local Bakeries & Pastry Shops Near You | TheBakerz', // < 60 chars
        description: 'Find & order from local artisanal bakeries, home bakers & pastry shops. Discover fresh bread, cakes & pastries on TheBakerz. Explore now!', // < 160 chars, CTA
        keywords: 'local bakery, bakery near me, pastry shop near me, order bread online, cake delivery, artisanal bread, home bakery, TheBakerz, find bakers', // Optimized keywords
        ogTitle: 'Discover & Order From Local Bakeries | TheBakerz', // Optimized OG Title
        ogDescription: 'Find artisanal bread, pastries & cakes from local bakers. Explore bakeries near you & order on TheBakerz today!', // Optimized OG Description, CTA
        twitterTitle: 'Find Local Bakeries & Pastry Shops | TheBakerz', // Optimized Twitter Title
        twitterDescription: 'Craving fresh baked goods? 🥐🎂 Find & order from local bakeries near you on TheBakerz. #localbakery #bakerynearme #TheBakerz' // Optimized Twitter Description
    }
    // NL translations removed
};

export async function generateMetadata(): Promise<Metadata> {
    // const locale = await getLocale(); // Hardcoding to 'en' for now
    const localeKey: 'en' = 'en'; // Explicitly 'en'
    const baseMetadata = getLocalizedMetadata(localeKey);

    const pageSpecifics = pageMetadataTranslations[localeKey];
    const baseKeywords = baseMetadata.keywords || []; // Get base keywords from the already localized metadata
    const pageKeywords = pageSpecifics.keywords.split(', ');

    const canonicalUrl = `https://www.thebakerz.com/`; // Root canonical for homepage

    // Merge metadata
    return {
        ...baseMetadata,
        title: pageSpecifics.title, 
        description: pageSpecifics.description, 
        keywords: Array.from(new Set([...baseKeywords, ...pageKeywords])),
        alternates: {
            ...baseMetadata.alternates,
            canonical: canonicalUrl, // Set specific canonical for homepage
            languages: { // Ensure only en-US and x-default for homepage
                'en-US': canonicalUrl,
                'x-default': canonicalUrl,
            }
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title: pageSpecifics.ogTitle, 
            description: pageSpecifics.ogDescription, 
            url: canonicalUrl, // OG URL should be the canonical homepage URL
        },
        twitter: {
            ...baseMetadata.twitter,
            title: pageSpecifics.twitterTitle, 
            description: pageSpecifics.twitterDescription, 
        },
    };
}

// Main HomePage component
export default async function Page() {

  return (
    <main className="min-h-screen">
     <LandingHeroSection />
      <BakersGrowthSection />
      <Partners />  
      <Footer />
    </main>
  );
}
