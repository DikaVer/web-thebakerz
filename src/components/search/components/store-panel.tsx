'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardBody, CardFooter, Chip, Popover, PopoverContent, PopoverTrigger, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { NearbyStore } from '@/lib/actions/store'; // Assuming NearbyStore is exported
import { formatCurrency } from '@/lib/utils'; // Assuming a currency formatting util
import { useTranslations } from 'next-intl';
import { examppleStore } from '@/lib/local-variables';
import { renderScheduleDisplay } from '@/components/store/store-header/subheader/working-hours';
import { useHoverPopover } from '@/hooks/use-hover-popover';
import { useMediaQuery } from 'usehooks-ts';
import { useSignInModal } from '@/components/ui/modal-signin';
import { useSession } from '@/components/providers/session-provider';
import { useFavorites } from '@/components/providers/favorites-provider';

interface StorePanelProps {
    store: NearbyStore;
    deliveryMode: 'pickup' | 'delivery';
    isUserCord: boolean;
}

// Add AnimatedNumber component
const AnimatedNumber = ({ value }: { value: number }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (value !== displayValue) {
            setIsAnimating(true);
            const startValue = displayValue;
            const endValue = value;
            const duration = 500; // Animation duration in ms
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function for smooth animation
                const easeOutQuad = (t: number) => t * (2 - t);
                const currentValue = Math.round(startValue + (endValue - startValue) * easeOutQuad(progress));

                setDisplayValue(currentValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setIsAnimating(false);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [value]);

    return (
        <span className={`transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            {displayValue}
        </span>
    );
};

// Add AnimatedHeart component
const AnimatedHeart = ({ isFavorite }: { isFavorite: boolean }) => {
    return (
        <Icon 
            icon="solar:heart-bold" 
            width={20} 
            className={`transition-all duration-300 transform ${
                isFavorite 
                    ? "text-danger-500 scale-110" 
                    : "text-white scale-100"
            }`} 
        />
    );
};

export function StorePanel({ store, deliveryMode, isUserCord }: StorePanelProps) {
    const wH = useTranslations("app/(store)/components/working-hours");
    const t = useTranslations("search.components.storePanel");
    const [isManualOpen, setIsManualOpen] = React.useState(false);
    const { isHovered, setIsHovered, triggerRef, popoverRef } = useHoverPopover();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { openModal, ModalSign } = useSignInModal();
    const { session } = useSession();
    const { isStoreFavorite, addStoreToFavorites, removeStoreFromFavorites } = useFavorites();

    const [isFavorite, setIsFavorite] = useState(isStoreFavorite(store.id));
    const [likeCount, setLikeCount] = useState(isFavorite ? store.totalLikes + 1 : store.totalLikes);
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Create ref for the popover component
    const componentRef = useRef<HTMLDivElement>(null);
    const popoverWrapperRef = useRef<HTMLDivElement>(null);
    
    // Combine manual opening and hover state
    // On mobile, we only use manual open state
    const isPopoverOpen = isMobile ? isManualOpen : (isManualOpen || isHovered);
    
    const handlePopoverOpenChange = (open: boolean) => {
        setIsManualOpen(open);
        // Don't close by state if we're hovering and not on mobile
        if (!open && !isHovered && !isMobile) {
            setIsHovered(false);
        }
    };
    
    // Close popover when clicking outside on mobile
    useEffect(() => {
        if (!isMobile) return;
        
        const handleClickOutside = (event: Event) => {
            // Only close if we're clicking outside both the trigger and popover
            if (
                componentRef.current && 
                !componentRef.current.contains(event.target as Node) &&
                popoverRef.current && 
                !popoverRef.current.contains(event.target as Node) &&
                triggerRef.current && 
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsManualOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMobile]);
    
    // Prevent link activation when interacting with popover
    const preventLinkAction = isPopoverOpen;

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

    const handleFavoriteToggle = async () => {
        if(!session?.user) {
            openModal();
            return;
        }

        setIsAnimating(true);
        if (isFavorite) {
            setIsFavorite(false);
            setLikeCount(prev => prev - 1);
            await removeStoreFromFavorites(store.id);
        } else {
            setIsFavorite(true);
            setLikeCount(prev => prev + 1);
            await addStoreToFavorites(store.id, store?.ownerName || "Undefined", store?.background || "/search/store_front_clean.webp");
        }
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div ref={componentRef} className="relative">
            <ModalSign 
                message="And you add store to your favorites"
            />
            <Button
                radius="full"
                variant="light"
                color="secondary"
                size="sm"
                className={`absolute top-2 right-2 z-10 bg-black/20 font-bold text-lg text-white transition-all duration-300 ${
                    isAnimating ? 'scale-105' : 'scale-100'
                }`}
                onPress={handleFavoriteToggle}
            >
                {likeCount > 0 && (  
                    <AnimatedNumber value={likeCount} />
                )}
                <AnimatedHeart isFavorite={isFavorite} />
            </Button>
            <Link 
                href={`/${store.storeName || store.id}`} 
                className="block group"
                onClick={(e) => {
                    if (preventLinkAction) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
                <Card shadow="none" isPressable className="w-full h-full border border-transparent group-hover:border-primary transition-colors overflow-hidden">
                    <CardBody className="overflow-visible p-0 relative h-48"> 
                        {/* Main image with gradient overlay for better text visibility */}
                        <div className="relative h-full w-full">
                            <Image
                                alt={store?.storeName || 'Bakery image'}
                                className="object-cover w-full h-full"
                                src={store?.background || "/search/store_front_clean.webp"}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/search/store_front_clean.webp";
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </CardBody>
                    <CardFooter className="text-sm flex-col !items-start p-4 gap-1.5">
                        <div className="flex justify-between items-start w-full">
                            <h4 className="font-bold text-2xl truncate mr-2">{store?.ownerName || store?.storeName}</h4>
                            {deliveryMode === 'pickup' ? (
                                <Chip 
                                    size="sm" 
                                    color={isStoreOpen ? "success" : "danger"}
                                    variant="flat"
                                >
                                    {isStoreOpen ? t('open') : t('closed')}
                                </Chip>
                            ) : (
                                isUserCord && (
                                    <></>
                                    // <Chip 
                                    //     size="sm" 
                                    //     color={isDeliveryAvailable ? "success" : "danger"}
                                    //     variant="flat"
                                    // >
                                    //     {isDeliveryAvailable ? t('deliveryAvailable') : t('deliveryUnavailable')}
                                    // </Chip>
                                )
                            )}
                        </div>
                        {store.totalLikesProduct > 0 && (
                            <div className="flex items-end gap-2">
                                <Icon 
                                    icon="tabler:user-heart" 
                                    className="text-foreground"
                                    width={24} 
                                />
                                <p className="text-xs md:text-sm whitespace-pre-wrap font-light text-foreground">
                                    {store.totalLikesProduct} total likes
                                </p>
                            </div>
                        )}
                        
                        <p className="text-default-600 text-xs line-clamp-2">{store?.slug || 'Artisanal baked goods'}</p>
                        
                        <div className="flex flex-col flex-wrap items-start gap-y-1 gap-x-2 font-light text-xs mt-1 w-full">
                            <div className="flex w-full items-end justify-between gap-1">
                                <div className="flex gap-1 items-center">
                                    {isUserCord && (
                                        <>
                                            <Icon icon="solar:routing-3-linear" width={14} className="flex-shrink-0" />
                                            <span>{distanceString}</span>
                                        </>
                                    )}
                                    </div>
                                    {!store.deliveryRegion?.isPostDelivery ? (
                                        <div onClick={(e) => {
                                            if (isMobile) {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }
                                        }}>
                                            <Popover 
                                                placement="bottom" 
                                                showArrow 
                                                offset={10}
                                                isOpen={isPopoverOpen}
                                                onOpenChange={handlePopoverOpenChange}
                                            >
                                                <PopoverTrigger>
                                                    <div 
                                                        ref={triggerRef}
                                                        className={`flex ${(deliveryMode === 'delivery' && !isUserCord) && 'hidden'} items-center justify-between border-1 gap-2 p-1 px-2 rounded-full hover:bg-default-100 cursor-pointer ${examppleStore.includes(store.id) && "hidden"}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setIsManualOpen(prev => !prev);
                                                        }}
                                                        onMouseEnter={() => !isMobile && setIsHovered(true)}
                                                        onMouseLeave={(e) => {
                                                            if (isMobile) return;
                                                            
                                                            const relatedTarget = e.relatedTarget as Node;
                                                            if (popoverRef.current?.contains(relatedTarget)) {
                                                                return;
                                                            }
                                                            if (!isManualOpen) {
                                                                setIsHovered(false);
                                                            }
                                                        }}
                                                    >
                                                        <span className="text-text font-medium">
                                                            {deliveryMode === 'delivery' ? t('deliveryHours') : t('workingHours')}
                                                        </span>
                                                        <Icon icon="solar:info-circle-linear" width={16} className="text-text" />
                                                    </div>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <div 
                                                        ref={popoverWrapperRef}
                                                        onClick={(e) => {
                                                            // This ensures clicks inside the popover don't bubble up
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <div 
                                                            className="flex flex-col gap-2" 
                                                            ref={popoverRef}
                                                            onMouseEnter={() => !isMobile && setIsHovered(true)}
                                                            onMouseLeave={() => {
                                                                if (isMobile) return;
                                                                
                                                                // Only close if we're not in manual open mode
                                                                if (!isManualOpen) {
                                                                    setIsHovered(false);
                                                                }
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                            }}
                                                        >
                                                            {/* {isMobile && (
                                                                <div className="flex justify-end mb-2">
                                                                    <Button
                                                                        isIconOnly
                                                                        variant="solid"
                                                                        size="sm"
                                                                        className="bg-primary text-white"
                                                                        onPress={() => setIsManualOpen(false)}
                                                                    >
                                                                        <Icon icon="solar:close-circle-bold" width={20} height={20} />
                                                                    </Button>
                                                                </div>
                                                            )} */}
                                                            {deliveryMode === 'delivery' && store.deliveryRegion && store.deliveryRegion.deliverySchedule
                                                                ? renderScheduleDisplay(store.deliveryRegion.deliverySchedule, wH)
                                                                : renderScheduleDisplay(store.schedule, wH)}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 border-1 p-1 px-2 rounded-full">
                                            <p className="font-medium">Postal Delivery</p>
                                        </div>
                                    )}
                                <Chip
                                    size="md"
                                    color={"warning"}
                                    variant="flat"
                                    className={`${examppleStore.includes(store.id) ? "bg-warning-400 px-2 text-black dark:text-black" : "hidden"}`}
                                >
                                    Example Store
                                </Chip>
                            </div>
                            
                            <div className="flex items-center gap-1 flex-1">
                                {(deliveryMode === 'delivery' && isUserCord) ? (
                                    <>
                                        <Icon icon="solar:delivery-linear" width={14} className="flex-shrink-0" />
                                        <span className="truncate">{deliveryInfo}</span>
                                    </>
                                ) : (
                                    <></>
                                )}

                            </div>
                            {(deliveryMode === 'pickup' ? store.minTimeOrder : store.deliveryRegion?.minOrderTime) && (
                                <div className="flex items-center gap-1 flex-1">
                                    <Icon icon="solar:clock-circle-linear" width={14} className="flex-shrink-0 text-warning-500" />
                                    <span className="truncate">
                                        {t("MinLeadTime")}: {(() => {
                                            const minutes = deliveryMode === 'pickup' ? store.minTimeOrder : store.deliveryRegion?.minOrderTime;
                                            if (!minutes) return '';
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
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </Link>
            
            {/* Add an overlay that closes the popover when clicked (mobile only) */}
            {isMobile && isPopoverOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setIsManualOpen(false)}
                    onTouchStart={() => setIsManualOpen(false)}
                />
            )}
        </div>
    );
}
