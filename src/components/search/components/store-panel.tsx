'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, CardFooter, Chip } from '@heroui/react';
import { Icon } from '@iconify/react';
import { NearbyStore } from '@/lib/actions/store'; // Assuming NearbyStore is exported
import { formatCurrency } from '@/lib/utils'; // Assuming a currency formatting util
import { useTranslations } from 'next-intl';

interface StorePanelProps {
    store: NearbyStore;
    deliveryMode: 'pickup' | 'delivery';
}

export function StorePanel({ store, deliveryMode }: StorePanelProps) {
    const t = useTranslations("search.components.storePanel");

    // Determine delivery/pickup info string
    let deliveryInfo = '';
    let deliveryPrice: number | undefined;
    let minOrder: number | undefined;
    
    if (deliveryMode === 'delivery') {
        // Find the applicable delivery range/price
        if(store.deliveryRange) {
            deliveryPrice = store.deliveryRange.deliveryPriceInCents;
            minOrder = store.deliveryRange.minOrderPriceInCents;
        }
        deliveryInfo = deliveryPrice !== undefined
            ? `${formatCurrency(deliveryPrice)} ${t('deliveryFee')}`
            : t('deliveryAvailable');
        if(minOrder !== undefined && minOrder > 0) {
             deliveryInfo += ` • ${formatCurrency(minOrder)} ${t('minOrder')}`
        }
    } 

    // Format distance
    const distanceString = store.distance < 1 
        ? `${Math.round(store.distance * 1000)} m`
        : `${store.distance.toFixed(1)} km`;

    // Determine if store is open based on schedule
    const isStoreOpen = useMemo(() => {
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

    // Determine if delivery is available now (simplified without region.schedule)
    const isDeliveryAvailable = useMemo(() => {
        if (deliveryMode !== 'delivery' || !store.deliveryRegions || store.deliveryRegions.length === 0) return false;
        
        const region = store.deliveryRegion;
        // First check if store is open at all - delivery requires the store to be open
        if (!region) return false;
        
        // Get current date and time
        const now = new Date();
        const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        // Map day number to day name
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayName = dayNames[currentDay];
        
        // Get today's schedule
        const todaySchedule = region.deliverySchedule[todayName as keyof typeof region.deliverySchedule];
        
        // Check if the store is open today
        if (!todaySchedule?.isEnabled) return false;
        
        // Convert current time to minutes for easier comparison
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        
        // Convert store opening hours to minutes
        const openingTimeInMinutes = todaySchedule.start.hour * 60 + todaySchedule.start.minute;
        const closingTimeInMinutes = todaySchedule.end.hour * 60 + todaySchedule.end.minute;
        
        // Check if current time is within store hours
        return currentTimeInMinutes >= openingTimeInMinutes && currentTimeInMinutes < closingTimeInMinutes;
    }, [store.deliveryRegions, store.distance, isStoreOpen, deliveryMode]);

    return (
        <Link href={`/${store.storeName || store.id}`} className="block group">
            <Card shadow="sm" isPressable className="w-full h-full border border-transparent group-hover:border-primary transition-colors overflow-hidden">
                <CardBody className="overflow-visible p-0 relative h-48"> 

                    {/* Main image with gradient overlay for better text visibility */}
                    <div className="relative h-full w-full">
                        <Image
                            alt={store.storeName || 'Bakery image'}
                            className="object-cover w-full h-full"
                            src={store.picture || "/search/store_front_clean.webp"}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </CardBody>
                
                <CardFooter className="text-sm flex-col !items-start p-4 gap-1.5">
                    <div className="flex justify-between items-start w-full">
                        <h4 className="font-bold text-large truncate mr-2">{store.storeName}</h4>
                        {/* Status badge overlay */}
                    
                        {deliveryMode === 'pickup' ? (
                            <Chip 
                                size="sm" 
                                color={isStoreOpen ? "success" : "danger"}
                                variant="flat"
                            >
                                {isStoreOpen ? t('open') : t('closed')}
                            </Chip>
                        ) : (
                            <Chip 
                                size="sm" 
                                color={isDeliveryAvailable ? "success" : "danger"}
                                variant="flat"
                            >
                                {isDeliveryAvailable ? t('deliveryAvailable') : t('deliveryUnavailable')}
                            </Chip>
                        )}
                  
                        {/* Store rating - Uncomment when ratings are available */}
                        {/* {store.rating && (
                            <div className="flex items-center gap-1 text-yellow-500 text-xs bg-yellow-100 px-1.5 py-0.5 rounded"> 
                                <Icon icon="solar:star-bold" width={14} />
                                <span>{store.rating.toFixed(1)}</span> 
                            </div>
                        )} */}
                    </div>
                    
                    <p className="text-default-600 text-xs line-clamp-2">{store.slug || 'Artisanal baked goods'}</p>
                    
                    <div className="flex flex-col flex-wrap items-start gap-y-1 gap-x-2 text-default-500 text-xs mt-1 w-full">
                        <div className="flex items-center gap-1">
                            <Icon icon="solar:routing-3-linear" width={14} className="flex-shrink-0" />
                            <span>{distanceString}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 flex-1">
                            {deliveryMode === 'delivery' ? (
                                <Icon icon="solar:delivery-linear" width={14} className="flex-shrink-0" />
                            ) : (
                                <></>
                                // <Icon icon="solar:shop-2-linear" width={14} className="flex-shrink-0" />
                            )}
                            <span className="truncate">{deliveryInfo}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
