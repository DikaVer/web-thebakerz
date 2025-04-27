import { Suspense } from 'react';
import { SearchComponent } from '@/components/search/search-comp';
import { findNearbyStores, NearbyStore } from '@/lib/actions/store';
import { StorePanelSkeleton } from '@/components/search/components/store-panel-skeleton';
import { StorePanel } from '@/components/search/components/store-panel';
import type { Metadata } from 'next'; // Import Metadata type
import { getLocale, getTranslations } from 'next-intl/server'; // Import getLocale
import { getLocalizedMetadata, metadataTranslations } from '@/components/metadata'; // Import base metadata utils
import { logger } from '@/lib/logger';
import { Coordinates, getSearchCity, getSearchCoordinates, getSearchCountry } from '@/lib/delivery-cookie';

// Define search page specific metadata translations
const pageMetadataTranslations = {
    en: {
        defaultTitle: "Search Bakeries | TheBakerz",
        defaultDescription: "Find artisanal bakeries, pastry shops, and home bakers near you for pickup or delivery on TheBakerz.",
        cityTitle: "Bakeries in {city} | Search on TheBakerz",
        cityDescription: "Discover local bakeries in {city} offering {mode}. Find fresh bread, pastries, and cakes near you on TheBakerz.",
        keywordsBase: "search bakery, find bakery, local bakery, pastry shop search, bread delivery, cake delivery, artisanal bakery",
        keywordsCity: "bakery in {city}, {city} pastry shop, {city} bread delivery, {city} cake order, {city} {mode}"
    },
    nl: {
        defaultTitle: "Zoek Bakkerijen | TheBakerz",
        defaultDescription: "Vind ambachtelijke bakkers, patisserieën en thuisbakkers bij u in de buurt voor afhalen of bezorgen op TheBakerz.",
        cityTitle: "Bakkerijen in {city} | Zoeken op TheBakerz",
        cityDescription: "Ontdek lokale bakkerijen in {city} die {mode} aanbieden. Vind vers brood, gebak en taarten bij u in de buurt op TheBakerz.",
        keywordsBase: "zoek bakkerij, vind bakkerij, lokale bakker, patisserie zoeken, brood bezorgen, taart bezorgen, ambachtelijke bakkerij",
        keywordsCity: "bakkerij in {city}, {city} patisserie, {city} brood bezorgen, {city} taart bestellen, {city} {mode}"
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
  }>;
}

export async function generateMetadata(
    { searchParams }: SearchPageProps
): Promise<Metadata> {
    const locale = await getLocale();
    const baseMetadata = getLocalizedMetadata(locale);

    let localeKey: 'en' | 'nl' = 'en';
    if (locale === 'nl-NL' || locale === 'nl') {
        localeKey = 'nl';
    }

    // Get search parameters
    const search = await searchParams;

    const city = search?.city;
    const mode = search?.mode === 'delivery' ? (localeKey === 'nl' ? 'bezorging' : 'delivery') : (localeKey === 'nl' ? 'afhalen' : 'pickup');

    const pageSpecifics = pageMetadataTranslations[localeKey];

    let title = pageSpecifics.defaultTitle;
    let description = pageSpecifics.defaultDescription;
    let specificKeywords = '';

    if (city) {
        title = pageSpecifics.cityTitle.replace('{city}', city);
        description = pageSpecifics.cityDescription.replace('{city}', city).replace('{mode}', mode);
        specificKeywords = pageSpecifics.keywordsCity.replace(/\{city\}/g, city).replace('{mode}', mode);
    }

    // Construct URL based on params
    const params = new URLSearchParams();
    if (search?.lat) params.set('lat', search.lat);
    if (search?.lng) params.set('lng', search.lng);
    if (city) params.set('city', city);
    if (search?.mode) params.set('mode', search.mode);
    const searchUrl = `https://www.thebakerz.com/search${params.toString() ? '?' + params.toString() : ''}`;

    // Merge keywords
    const baseKeywords = metadataTranslations[localeKey].keywords.split(', ');
    const pageBaseKeywords = pageSpecifics.keywordsBase.split(', ');
    const cityKeywords = specificKeywords.split(', ').map(k => k.trim()).filter(Boolean);
    const mergedKeywords = Array.from(new Set([...baseKeywords, ...pageBaseKeywords, ...cityKeywords]));

    return {
        ...baseMetadata,
        title,
        description,
        keywords: mergedKeywords,
        alternates: {
            ...baseMetadata.alternates,
            canonical: searchUrl,
            // Adjust alternate links if needed, potentially based on city/mode
            languages: {
                'en-US': searchUrl.replace('/nl/', '/'), // Basic replacement, might need refinement
                'nl-NL': searchUrl.replace('/nl/', '/'),
                'x-default': searchUrl.replace('/nl/', '/'),
            }
        },
        openGraph: {
            ...baseMetadata.openGraph,
            title,
            description,
            url: searchUrl,
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
const DEFAULT_CITY = 'Amsterdam';
const DEFAULT_MODE = 'pickup';
const DEFAULT_COUNTRY = 'NL';

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
async function StoreResults({ coords, mode, country }: { coords: Coordinates, mode: 'pickup' | 'delivery', country?: string }) {
  const stores = await findNearbyStores(coords.lat, coords.lng, mode, country);
  
  const t = await getTranslations("app/search");
  // Log to help debug duplicate IDs
  logger.debug("storeResults", "Store IDs:", { storeIds: stores.map(store => store.id) });
  
  return (
      <div className={'min-h-svh'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
              {stores.map((store, index) => (
                  // Use combination of store.id and index to ensure uniqueness
                  <StorePanel
                      key={`${store.id}-${index}`}
                      store={store}
                      deliveryMode={mode}
                  />
              ))}
              {stores.length === 0 && (
                  <div className="col-span-full text-center py-10 text-default-600 min-h-svh">
                      <p className="text-lg font-medium">{t("noStoresFound")}</p> {/* Add translations later if needed */}
                      <p className="text-sm">{t("tryChangingLocationOrDeliveryMode")}</p>
                  </div>
              )}
          </div>
      </div>
  );
}

export default async function Page(props : SearchPageProps) {
  // Get search parameters (no await needed as searchParams is already available)
  const searchParams = await props.searchParams; // Use the props directly
  const latParam = searchParams?.lat;
  const lngParam = searchParams?.lng;
  const cityParam = searchParams?.city;
  const countryParam = searchParams?.country;
  const modeParam = searchParams?.mode;

  let initialCoords: Coordinates | null = null;
  let initialCity: string | null = null;
  let initialMode: 'pickup' | 'delivery' = DEFAULT_MODE;
  let initialCountry: string | null = null;

  // 1. Prioritize URL Search Params
  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    if (!isNaN(lat) && !isNaN(lng)) {
      initialCoords = { lat, lng };
      initialCity = cityParam || null;
      initialCountry = countryParam || null;
    }
  }

  // 2. If no valid coords from params, try cookies
  if (!initialCoords) {
    initialCoords = await getSearchCoordinates();
    if (initialCoords) {
      initialCity = await getSearchCity();
      initialCountry = await getSearchCountry();
    } else {
      // 3. If no coords from cookies, use defaults
      initialCoords = { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
      initialCity = DEFAULT_CITY;
      initialCountry = DEFAULT_COUNTRY;
    }
  }

  // Determine initial mode: Param > Default
  if (modeParam === 'pickup' || modeParam === 'delivery') {
    initialMode = modeParam;
  }

  // We must have coordinates to proceed
  if (!initialCoords) {
    const t = await getTranslations("app/search");
    return <div>{t("errorCouldNotDetermineLocation")}</div>;
  }

  return (
    <SearchComponent
      initialCoords={initialCoords}
      // Pass resolved initial values to the client component
      initialDeliveryMode={initialMode}
    >
      {/* 
         Use Suspense to show a loading state while StoreResults fetches data. 
         The key ensures Suspense re-triggers when coords or mode change the data fetching.
      */}
      <Suspense key={`${initialCoords.lat}-${initialCoords.lng}-${initialMode}`} fallback={<StoresLoadingSkeleton />}>
        {/* 
           Pass coords and mode needed for fetching. 
           Render this async component inside Suspense.
        */}
        <StoreResults coords={initialCoords} mode={initialMode} country={initialCountry || undefined} />
      </Suspense>
    </SearchComponent>
  );
} 