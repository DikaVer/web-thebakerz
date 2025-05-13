'use client';
import { NearbyStore } from '@/lib/actions/store';
import { StorePanel } from './store-panel';
import { logger } from '@/lib/logger';
import { cn } from '@heroui/react';
import { isEmptyFilters } from './product-results';
import { useProductDialog } from '@/components/providers/product-provider';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import clarity from '@microsoft/clarity';
interface StoreResultsProps {
  stores: NearbyStore[];
  isUserCord: boolean;
  mode: 'pickup' | 'delivery';
}

export function StoreClientResults({ stores, isUserCord, mode }: StoreResultsProps) {
  const { filterParams } = useProductDialog();
  const isFiltered = !isEmptyFilters(filterParams);
  const t = useTranslations("app/search");
  useEffect(() => {
    clarity.setTag("page", "search");
  }, []);
  
  // Log to help debug duplicate IDs
  logger.debug("storeResults", "Store IDs:", { storeIds: stores.map(store => store.id) });
  
  return (
    <div className={cn(isFiltered ? "hidden" : "block")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stores.map((store, index) => (
          // Use combination of store.id and index to ensure uniqueness
          <StorePanel
            key={`${store.id}-${index}`}
            store={store}
            deliveryMode={mode}
            isUserCord={isUserCord}
          />
        ))}
        {stores.length === 0 && (
          <div className="col-span-full flex flex-col justify-center items-center text-center py-10 text-default-600 min-h-svh">
            <p className="text-lg font-medium">{t("noStoresFound")}</p>
            <p className="text-sm">{t("tryChangingLocationOrDeliveryMode")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreClientResults;
