'use client';
import { NearbyStore } from '@/lib/actions/store';
import { StorePanel } from './store-panel';
import { logger } from '@/lib/logger';
import { cn, Divider } from '@heroui/react';
import { isEmptyFilters } from './product-results';
import { useProductDialog } from '@/components/providers/product-provider';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import clarity from '@microsoft/clarity';
import { CustomOrderButton } from '@/components/ui/custom-order-button';
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
    clarity.setTag("page", "search-store-results");
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
          <div className="col-span-full flex flex-col justify-center items-center text-center py-10 text-default-600 min-h-svh max-w-2xl mx-auto">
            <p className="text-lg font-medium">{t("noStoresFound")}</p>
            <p className="text-sm">{t("tryChangingLocationOrDeliveryMode")}</p>
            <div>
            <div className="flex items-center gap-4 mt-4 justify-center">
            <Divider className="flex-1" />
            <span className="text-default-500">Or</span>
            <Divider className="flex-1" />
            </div>
            <p className="text-sm text-foreground-500 mt-4">{t("special")}</p>
            <CustomOrderButton 
              className="w-full mt-4 justify-center"
            />
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StoreClientResults;
