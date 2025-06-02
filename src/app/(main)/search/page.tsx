import { Suspense } from 'react';
import { findNearbyStores, NearbyStore} from '@/lib/actions/store';
import { StorePanelSkeleton } from '@/components/search/components/store-panel-skeleton';
import type { Metadata } from 'next'; // Import Metadata type
import { getLocale, getTranslations } from 'next-intl/server'; // Import getLocale
import { getLocalizedMetadata } from '@/components/metadata'; // Import base metadata utils
import { logger } from '@/lib/logger';
import { Coordinates, getDeliveryMode } from '@/lib/actions/cookies/delivery-cookie';
import { GoogleMapsProvider } from '@/components/providers/google-maps-provider';
import { getCurrentDeliveryAddress } from '@/app/(store)/[id]/delivery-actions';
import { Spacer } from '@heroui/react';
import ProductResults from '@/components/search/components/product-results';
import { StoreClientResults } from '@/components/search/components/store-results';

// Define search page specific metadata translations
const pageMetadataTranslations = {
    en: {
        defaultTitle: "Search Bakeries Near You | TheBakerz", // Primary keyword first
        defaultDescription: "Find artisanal bakeries & pastry shops for pickup or delivery. Explore local bakers on TheBakerz now!", // CTA added
        cityTitle: "{city} Bakeries | Search Near You | TheBakerz", // Adjusted for keywords & branding
        cityDescription: "Discover bakeries in {city} for {mode}. Find fresh bread, pastries & cakes. Order on TheBakerz!", // CTA added
        keywordsBase: "search bakery, find bakery, local bakery, pastry shop, bread delivery, cake delivery, artisanal bakery, near me", // Added "near me"
        keywordsCity: "bakery in {city}, {city} pastry shop, {city} bread, {city} cakes, {city} {mode}, {city} bakery delivery, {city} bakery pickup" // More specific
    }
};

// Define bakery type (can be removed if not used directly here anymore)
// interface Bakery { ... }

interface SearchPageProps {
  searchParams?: Promise<{
    lat?: string;
    lng?: string;
    city?: string;
    mode?: 'pickup' | 'delivery';
    country?: string;
    q?: string; // For general search query
  }>;
}

export async function generateMetadata(
    { searchParams }: SearchPageProps
): Promise<Metadata> {
    const locale = await getLocale();
    // Always use 'en' as we are removing 'nl'
    const localeKey: 'en' = 'en';
    const baseMetadata = getLocalizedMetadata(localeKey);

    const pageSpecifics = pageMetadataTranslations[localeKey];

    let title = pageSpecifics.defaultTitle;
    let description = pageSpecifics.defaultDescription;
    let currentKeywords = pageSpecifics.keywordsBase.split(', ');
    let canonicalUrl = `https://www.thebakerz.com/search`;

    // Await searchParams since it's now a Promise
    const resolvedSearchParams = await searchParams;
    const city = resolvedSearchParams?.city;
    const mode = resolvedSearchParams?.mode || 'pickup'; // Default to pickup if not specified
    const query = resolvedSearchParams?.q;

    if (city) {
        title = pageSpecifics.cityTitle.replace('{city}', city);
        description = pageSpecifics.cityDescription.replace('{city}', city).replace('{mode}', mode);
        const citySpecKeywords = pageSpecifics.keywordsCity.replace(/\{city\}/g, city).replace(/\{mode\}/g, mode).split(', ');
        currentKeywords.push(...citySpecKeywords);
        canonicalUrl = `https://www.thebakerz.com/search?city=${encodeURIComponent(city)}&mode=${mode}`;
    } else if (query) {
        // Handle general search query in title and description if needed
        title = `Search results for "${query}" | TheBakerz`;
        description = `Find bakeries and products matching "${query}". Explore your options on TheBakerz!`;
        canonicalUrl = `https://www.thebakerz.com/search?q=${encodeURIComponent(query)}`;
    }

    // Ensure title and description lengths
    title = title.length > 60 ? title.substring(0, 57) + '...' : title;
    description = description.length > 160 ? description.substring(0, 157) + '...' : description;

    const baseKeywords = baseMetadata.keywords || [];
    const mergedKeywords = Array.from(new Set([...baseKeywords, ...currentKeywords]));

    return {
        ...baseMetadata,
        title,
        description,
        keywords: mergedKeywords,
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
            title,
            description,
            url: canonicalUrl,
        },
        twitter: {
            ...baseMetadata.twitter,
            title,
            description,
        },
    };
}

// Default location (Amsterdam)
const DEFAULT_LAT = 52.366989;
const DEFAULT_LNG = 4.888490;

// Helper function to create the skeleton grid
const StoresLoadingSkeleton = () => {
  // We can't use useMediaQuery here, so let's render a reasonable default number
  const skeletonCount = 8; // Or adjust based on typical layout
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <StorePanelSkeleton key={index} />
      ))}
    </div>
  );
};

// Main component to fetch and render stores
async function StoreResults({ coords, mode, country, isUserCord }: { coords: Coordinates, mode: 'pickup' | 'delivery', country?: string, isUserCord: boolean }) {

  let stores: NearbyStore[] = [];
  if ((mode === 'delivery' && isUserCord) || mode === 'pickup') {
    stores = await findNearbyStores(coords.lat, coords.lng, mode, isUserCord, country);
  }
  
  const t = await getTranslations("app/search");
  // Log to help debug duplicate IDs
  logger.debug("storeResults", "Store IDs:", { storeIds: stores.map(store => store.id) });
  
  return (
      <div className={'min-h-svh'}>
          <StoreClientResults stores={stores} isUserCord={isUserCord} mode={mode} />
          <ProductResults storeIds={stores.map(store => store.id)} />
          <Spacer y={8}/>
      </div>
  );
}

export default async function Page(props : SearchPageProps) {
  const deliveryMode = await getDeliveryMode();
  const savedAddress = await getCurrentDeliveryAddress();
  const initialCoords = savedAddress?.coordinates || { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
  const initialCountry = savedAddress?.country || undefined;
  const initialIsUserCord = savedAddress?.coordinates ? true : false;

  return (
    <GoogleMapsProvider> 
      
        {/* 
          Use Suspense inside SearchComponent to show a loading state while StoreResults fetches data. 
          The key ensures Suspense re-triggers when coords or mode change.
        */}
        <div className='flex flex-col p-4'>
          <Suspense key={`${initialCoords.lat}-${initialCoords.lng}-${deliveryMode}`} fallback={<StoresLoadingSkeleton />}>
            {/* 
              Pass coords and mode needed for fetching.
              Render this async component inside Suspense.
            */}
            
              <StoreResults 
                coords={initialCoords}
                mode={deliveryMode} 
                country={initialCountry} 
                isUserCord={initialIsUserCord}
              /> 
          
          </Suspense>
        </div>
    </GoogleMapsProvider>
  );
} 