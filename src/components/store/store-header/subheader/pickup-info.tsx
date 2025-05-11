"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import {Card, CardBody, cn, Divider, Skeleton} from "@heroui/react";
import { Icon } from "@iconify/react";
import { StoreData } from "@/lib/actions/store";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { IconLocation } from "@/components/ui/icons";

// Import LocationMap directly for better performance
import LocationMap from "@/components/store/store-header/subheader/location-map";
import { usePathname } from "next/navigation";

interface PickupInfoProps {
  store: StoreData;
}

export default function PickupInfo({ store}: PickupInfoProps) {
  const t = useTranslations("app/(store)/components/store-subheader");
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isCheckout = pathname.includes("/checkout");
  
  // Generate a stable map ID for the current store
  const mapId = React.useMemo(() => 
    `map-${store.id}-${store?.location?.latitude}-${store?.location?.longitude}`,
    [store.id, store?.location?.latitude, store?.location?.longitude]
  );
  
  // Simulating loading effect for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);


  // Set minimum order to 10 euro (1000 cents)
  const minimumOrder = 1000;

  // Format address
  const location = store?.location?.route ? `${store.location.route}` : t("addressPlaceholder");
  const subLocation = store?.location?.route
    ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}`
    : t("locationPlaceholder");
    
  // Determine if store is open based on schedule
  const isStoreOpen = React.useMemo(() => {
    if (!store.schedule) return false;
    
    // Get current date and time
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Map day number to day name
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[currentDay];
    
    // Get today's schedule
    const todaySchedule = store.schedule[todayName as keyof typeof store.schedule];
    
    // Check if the store is open today
    if (!todaySchedule?.isEnabled) return false;
    
    // Convert current time to minutes for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Convert store opening hours to minutes
    const openingTimeInMinutes = todaySchedule.start.hour * 60 + todaySchedule.start.minute;
    const closingTimeInMinutes = todaySchedule.end.hour * 60 + todaySchedule.end.minute;
    
    // Check if current time is within store hours
    return currentTimeInMinutes >= openingTimeInMinutes && currentTimeInMinutes < closingTimeInMinutes;
  }, [store.schedule]);

  return (
    <>
      <Card shadow="none" className="h-auto overflow-hidden transition-all duration-300">
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-4 w-1/3 rounded-lg" />
              <Skeleton className="h-5 w-full rounded-lg" />
              <Skeleton className="h-5 w-2/3 rounded-lg" />
              <Skeleton className="h-36 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {/* Title with icon */}
            
              <div className={cn("flex h-full", isCheckout ? "flex-col" : "flex-col md:flex-row")}>
                <div className={cn("flex flex-col gap-2 w-full", isCheckout ? "w-full" : "w-full md:max-w-[440px]")}>
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100  dark:from-blue-200 dark:to-secondary-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-primary/10">
                            <Icon icon="solar:shop-2-linear" className="h-5 w-5 text-primary" />
                        </div>
                        <Skeleton isLoaded={!isLoading} className="rounded-full w-40">
                            <span className="text-sm font-medium dark:text-black">{t("pickUp")}</span>
                        </Skeleton>
                        </div>
                        {/*<div className="flex items-center gap-1">*/}
                        {/*<Icon icon="solar:star-linear" className="h-4 w-4 text-yellow-500" />*/}
                        {/*<span className="text-xs font-medium">Premium</span>*/}
                        {/*</div>*/}
                    </div>
                    </div>


                  <div className={'flex flex-row'}>
                    {/*<Divider orientation="vertical" className={"h-[100%]]"}/>*/}
                    <div className={'px-4 pt-2 w-full'}>
                      {/* Store address */}
                      <div className="mb-3 flex items-center gap-2">
                        <IconLocation size={20}
                                      primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                      secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                        />
                        <div>
                          <p className="text-sm text-text">{location}</p>
                          <p className="text-xs text-default-600">{subLocation}</p>
                        </div>
                      </div>

                      {/* Minimum order */}
                      <div className="flex items-center gap-3 mb-3">
                        <Icon icon="solar:card-linear" className="text-default-600" width={16}/>
                        <p className="text-xs text-default-600">
                          {t("minimumOrder")}: {formatCurrency(minimumOrder)}
                        </p>
                      </div>

                      {/* Min Lead Time */}
                      {(store.minTimeOrder !== undefined) && (
                          <div className="flex items-center gap-3 text-xs text-warning-500 mb-3">
                            <Icon icon="solar:clock-circle-linear" className="text-warning-500" width={16}/>
                            <div className="flex flex-row gap-1">
                              <span>{t("MinLeadTime")}: </span>
                              <span>
                                {(() => {
                                  const minutes = store.minTimeOrder;
                                  if (minutes < 60) {
                                    return `${minutes} min`;
                                  } else if (minutes < 24 * 60) {
                                    const hours = minutes / 60;
                                    return `${hours} ${hours === 1 ? t("hour") : t("hours")}`;
                                  } else {
                                    const days = Math.floor(minutes / (24 * 60));
                                    const remainingHours = (minutes % (24 * 60)) / 60;
                                    if (remainingHours === 0) {
                                      return `${days} ${days === 1 ? t("day") : t("days")}`;
                                    } else {
                                      return `${days} ${days === 1 ? t("day") : t("days")} ${remainingHours} ${remainingHours === 1 ? t("hour") : t("hours")}`;
                                    }
                                  }
                                })()}
                            </span>
                            </div>
                          </div>
                      )}

                      {/* Availability */}
                      <div className="flex items-center gap-3 mb-4">
                        <Icon
                            icon="solar:clock-circle-linear"
                            className={isStoreOpen ? "text-success" : "text-danger"}
                            width={16}
                        />
                        <p className={`text-xs ${isStoreOpen ? "text-success" : "text-danger"}`}>
                          {isStoreOpen ? t("storeOpen") : t("storeClosed")}
                        </p>
                      </div>

                       {/* Buyer Protection */}
                       <div className="flex flex-col gap-1 p-3 rounded-lg bg-background mb-4">
                          <div className="flex items-center gap-2 mb-1 h-10">
                            <Icon icon="solar:shield-check-linear" className="h-5 w-5 text-foreground" />
                            <span className="text-sm font-semibold">Buyer protection</span>
                          </div>
                          <Skeleton isLoaded={!isLoading} className="rounded-full">
                            <span className="text-sm text-default-600">
                              If the actual item doesn't match the listed composition, 
                              you can return it or get a refund.
                            </span>
                          </Skeleton>
                        </div>

                      {/* Cancellation Rules */}
                      <div className="flex flex-col gap-1 p-3 rounded-lg bg-background mb-4">
                        <div className="flex items-center gap-2 mb-1 h-10">
                          <Icon icon="solar:close-circle-linear" className="h-5 w-5 text-foreground" />
                          <span className="text-sm font-semibold">Cancellation rules</span>
                        </div>
                        <Skeleton isLoaded={!isLoading} className="rounded-full">
                          <span className="text-sm text-default-600">
                            You can cancel the order before preparation, the 
                            money will be fully refunded to you.
                          </span>
                        </Skeleton>
                      </div>
                    </div>
                    {/*<Divider orientation="vertical" className={"h-[100%]]"}/>*/}
                  </div>
                </div>
                {!isCheckout && (
                  <div className="flex-1 min-h-[200px] md:min-h-[300px] w-full rounded-medium rounded-t-none md:rounded-medium md:rounded-l-none overflow-hidden" ref={mapContainerRef}>
                  {(store?.location?.latitude && store?.location?.longitude) ? (
                    <LocationMap 
                      key={mapId}
                      latitude={Number(store.location.latitude)} 
                      longitude={Number(store.location.longitude)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Icon icon="solar:danger-triangle-bold-duotone" className="text-danger text-2xl mr-2"/>
                      <span className="text-danger-700 text-sm">Error loading map</span>
                    </div>
                  )}
                </div>
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>
      
      </>
  );
} 