import { Suspense } from 'react';
import { SearchComponent } from '@/components/search/search-comp';
import { getSearchCity, getSearchCoordinates, Coordinates } from '@/lib/cookie';
import { findNearbyStores, NearbyStore } from '@/lib/actions/store';
import { StorePanelSkeleton } from '@/components/search/components/store-panel-skeleton';
import { StorePanel } from '@/components/search/components/store-panel';
// import { useMediaQuery } from 'usehooks-ts'; // Cannot be used in Server Component

// Define bakery type (can be removed if not used directly here anymore)
// interface Bakery { ... }

interface SearchPageProps {
  searchParams?: Promise<{
    lat?: string;
    lng?: string;
    city?: string;
    mode?: 'pickup' | 'delivery';
  }>;
}

// Default location (Amsterdam)
const DEFAULT_LAT = 52.366989;
const DEFAULT_LNG = 4.888490;
const DEFAULT_CITY = 'Amsterdam';
const DEFAULT_MODE = 'pickup';

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
async function StoreResults({ coords, mode }: { coords: Coordinates, mode: 'pickup' | 'delivery' }) {
  const stores = await findNearbyStores(coords.lat, coords.lng, mode);
  
  // Log to help debug duplicate IDs
  console.log("Store IDs:", stores.map(store => store.id));
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {stores.map((store, index) => (
        // Use combination of store.id and index to ensure uniqueness
        <StorePanel 
          key={`${store.id}-${index}`} 
          store={store} 
          deliveryMode={mode} 
        />
      ))}
      {stores.length === 0 && (
        <div className="col-span-full text-center py-10 text-default-600">
          <p className="text-lg font-medium">No stores found</p> {/* Add translations later if needed */}
          <p className="text-sm">Try changing your location or delivery mode.</p>
        </div>
      )}
    </div>
  );
}

export default async function Page(props : SearchPageProps) {
  // Get search parameters (no await needed as searchParams is already available)
  const searchParams = await props.searchParams;
  const latParam = searchParams?.lat;
  const lngParam = searchParams?.lng;
  const cityParam = searchParams?.city;
  const modeParam = searchParams?.mode;

  let initialCoords: Coordinates | null = null;
  let initialCity: string | null = null;
  let initialMode: 'pickup' | 'delivery' = DEFAULT_MODE;

  // 1. Prioritize URL Search Params
  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    if (!isNaN(lat) && !isNaN(lng)) {
      initialCoords = { lat, lng };
      initialCity = cityParam || null;
    }
  }

  // 2. If no valid coords from params, try cookies
  if (!initialCoords) {
    initialCoords = await getSearchCoordinates();
    if (initialCoords) {
      initialCity = await getSearchCity();
    } else {
      // 3. If no coords from cookies, use defaults
      initialCoords = { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
      initialCity = DEFAULT_CITY;
    }
  }

  // Determine initial mode: Param > Default
  if (modeParam === 'pickup' || modeParam === 'delivery') {
    initialMode = modeParam;
  }

  // We must have coordinates to proceed
  if (!initialCoords) {
    return <div>Error: Could not determine location.</div>;
  }

  return (
    <SearchComponent
      // Pass resolved initial values to the client component
      initialCoords={initialCoords}
      initialCity={initialCity}
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
        <StoreResults coords={initialCoords} mode={initialMode} />
      </Suspense>
    </SearchComponent>
  );
} 