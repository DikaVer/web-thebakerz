'use server';

import React from 'react';
import { Coordinates, DeliveryMode } from '@/lib/delivery-cookie';
import { FilterButton } from '@/components/store/filter/FilterButton';
import { findNearbyStores } from '@/lib/actions/store';
import { StorePanel } from '@/components/search/components/store-panel';
import { logger } from '@/lib/logger';
import { Spacer } from '@heroui/react';
import SearchWrapper from './components/search-wrapper';

// Server component for store results
async function StoreResultsComponent({ coords, mode, country, isUserCord }: { coords: Coordinates, mode: DeliveryMode, country?: string, isUserCord: boolean }) {
  const stores = await findNearbyStores(coords.lat, coords.lng, mode, isUserCord, country);
  
  logger.debug("StoreResultsComponent", "Store IDs:", { storeIds: stores.map(store => store.id) });
  
  return (
      <div className={'min-h-svh'}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
              {stores.map((store, index) => (
                  <StorePanel
                      key={`${store.id}-${index}`}
                      store={store}
                      deliveryMode={mode}
                      isUserCord={isUserCord}
                  />
              ))}
              {stores.length === 0 && (
                  <div className="col-span-full flex flex-col justify-center items-center text-center py-10 text-default-600 min-h-svh">
                      <p className="text-lg font-medium">No stores found</p> 
                      <p className="text-sm">Try changing your location or delivery mode.</p>
                  </div>
              )}
          </div>
          <Spacer y={8}/>
      </div>
  );
}

interface SearchComponentProps {
    initialCoords: Coordinates;
    initialDeliveryMode: DeliveryMode;
    initialCountry?: string;
    initialIsUserCord: boolean;
}

export async function SearchComponent({ 
    initialCoords,
    initialDeliveryMode,
    initialCountry,
    initialIsUserCord
}: SearchComponentProps) {
    // Fetch the store results directly
    const storeResults = await StoreResultsComponent({
        coords: initialCoords,
        mode: initialDeliveryMode,
        country: initialCountry,
        isUserCord: initialIsUserCord
    });

    return (
        <div className="flex flex-col w-full h-full mt-4 px-4">
            {/* Pass the pre-rendered store results to the client component */}
            <SearchWrapper
                initialCoords={initialCoords}
                initialDeliveryMode={initialDeliveryMode}
                initialCountry={initialCountry}
                storeResults={storeResults}
            />
        </div>
    );
}
