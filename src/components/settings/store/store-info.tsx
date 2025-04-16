'use client';

import React from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { useStore } from "@/components/providers/store-provider";
import { useSession } from "@/components/providers/session-provider";

interface StoreInfoProps {
  className?: string;
}

// Map of country codes to flag icons
const countryFlagMap: Record<string, string> = {
  'NL': 'circle-flags:lang-nl',
  'FR': 'circle-flags:lang-fr',
  'GB': 'circle-flags:lang-en-us',
  'BE': 'circle-flags:lang-be',
  'DE': 'circle-flags:lang-de',
  'ES': 'circle-flags:lang-es',
  'IT': 'circle-flags:lang-it',
  'US': 'circle-flags:us',
  // Default flag for unmapped countries
  'default': 'solar:map-point-linear'
};

// Map of currency codes to symbols
const currencySymbolMap: Record<string, string> = {
  'EUR': '€',
  'USD': '$',
  'GBP': '£',
};

const StoreInfo: React.FC<StoreInfoProps> = ({ className }) => {
  const t = useTranslations("app/(return_page)/settings/components/store-info");
  const { store } = useStore();
  const { session } = useSession();
  const isLoading = !store;

  if (!store || !session.user) {
    return null;
  }

  // Get the country code from store location
  const countryCode = store.region || 'NL';
  
  // Get the flag icon for the country
  const flagIcon = countryFlagMap[countryCode] || countryFlagMap.default;
  
  // Get currency and symbol
  const currency = store.currency.toUpperCase() || "EUR";
  const currencySymbol = currencySymbolMap[currency] || '';

  // Map delivery option to readable text
  const getDeliveryOptionText = () => {
    switch (store.deliveryOption) {
      case 'pickup':
        return t("pickupOnly");
      case 'delivery':
        return t("deliveryOnly");
      case 'multi':
        return t("pickupAndDelivery");
      default:
        return t("notConfigured");
    }
  };

  return (
    <Card className={`w-full overflow-hidden transition-all duration-300 ${className}`} shadow="sm">
      <CardBody className="p-0 w-full">
        <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-secondary dark:to-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon icon="solar:shop-linear" className="h-5 w-5 text-primary" />
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-sm font-medium dark:text-black">{t("storeInformation")}</span>
              </Skeleton>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Owner Info */}
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="solar:user-linear" className="h-4 w-4 text-success" />
                <span className="text-xs text-default-600">{t("owner")}</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-lg font-semibold">{session.user.username}</span>
              </Skeleton>
            </div>
            
            {/* Region Info */}
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon={"solar:map-point-linear"} className="h-4 w-4" />
                <span className="text-xs text-default-600">{t("region")}</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <div className="flex items-center gap-2">
                  <Icon icon={flagIcon} width={24} />
                  <span className="text-lg font-semibold">
                    {store.region|| t("notConfigured")}
                  </span>
                </div>
              </Skeleton>
            </div>

            {/* Currency Info */}
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="solar:dollar-minimalistic-linear" className="h-4 w-4 text-warning" />
                <span className="text-xs text-default-600">{t("currencyText")}</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {currency} {currencySymbol && `${currencySymbol}`}
                  </span>
                </div>
              </Skeleton>
            </div>
            
            {/* Delivery Option */}
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-default-50 dark:bg-default-100">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="solar:delivery-linear" className="h-4 w-4 text-primary dark:text-secondary" />
                <span className="text-xs text-default-600">{t("deliveryOption")}</span>
              </div>
              <Skeleton isLoaded={!isLoading} className="rounded-full">
                <span className="text-lg font-semibold">{getDeliveryOptionText()}</span>
              </Skeleton>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StoreInfo; 