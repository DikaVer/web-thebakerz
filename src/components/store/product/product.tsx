'use client';

import React, {useEffect, useState} from "react";
import {Card, Image, CardFooter, Popover, PopoverTrigger, PopoverContent, CardBody, Button} from "@heroui/react";
import {ProductData} from "@/lib/actions/product";
import {useProductDialog} from "@/components/providers/product-provider";
import {formatCurrency} from "@/lib/utils";
import {useTranslations} from "next-intl";
import {useStore} from "@/components/providers/store-provider";
import {useSession} from "@/components/providers/session-provider";
import { Icon } from "@iconify/react";
import { useHoverPopover } from "@/hooks/use-hover-popover";
import { useDelivery } from "@/components/providers/delivery-provider";
import { DietaryIcon } from "@/components/store/product/components/super-icons";
import { updateCart } from "@/lib/actions/cart";
import { useCart } from "@/components/providers/cart-provider";
import showSuccessMessage from "@/components/toast/toast-succes";
import showErrorMessage from "@/components/toast/toast-error";
import { getOrderTime, getDeliveryTime, removeAllSchedules } from "@/app/(store)/[id]/actions";
import { scheduledToCalendarDateTime } from "@/lib/utils";
import { getLocalTimeZone } from '@internationalized/date';

interface ProductBaseProps {
    productData: ProductData;
}

export const ProductBase: React.FC<ProductBaseProps> = ({
    productData,
}) => {
    const [isManualOpen, setIsManualOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isHovered, setIsHovered, triggerRef, popoverRef } = useHoverPopover();
    
    // Combine manual opening and hover state
    const isPopoverOpen = isManualOpen || isHovered;

    const { handleOpen } = useProductDialog();
    const t2 = useTranslations("Dietary");
    const t = useTranslations("app/(store)/components/product-page");
    const { store } = useStore();
    const { session } = useSession();
    const { isDelivery, validationResult, setSelectedDate } = useDelivery();
    const { addItem } = useCart();
    const storeMinTimeOrder = isDelivery ? validationResult?.deliveryRegion?.minOrderTime : store?.minTimeOrder;

    const handlePopoverOpenChange = (open: boolean) => {
        setIsManualOpen(open);
        // Don't close by state if we're hovering
        if (!open && !isHovered) {
            setIsHovered(false);
        }
    };

    // Prevent product dialog when interacting with popover
    const preventProductDialog = isPopoverOpen;

    const handleAddToCart = async () => {
        
        // If product has variants, open the dialog instead
        if (productData.variants && productData.variants.length > 0) {
            handleOpen(productData.id, store?.user_id === session?.user?.id);
            return;
        }
        
        setIsLoading(true);
        try {
            // Add item directly to cart without variants
            const result = await updateCart(
                productData.id, 
                productData.store_id, 
                productData.min_order || 1, 
                "", 
                []
            );
            
            if (result.success) {
                const dateTime = isDelivery 
                    ? await getDeliveryTime(productData.store_id, validationResult?.deliveryRegion?.name || "") 
                    : await getOrderTime(productData.store_id);
                
                // Check if we have both date and time
                if (dateTime.date && dateTime.time) {
                    // Check lead time validation
                    const selectedDateTime = scheduledToCalendarDateTime({date: dateTime.date, time: dateTime.time});
                    const currentDateTime = new Date();
                    const minLeadTime = productData.min_lead_time || 0; // in minutes
                    const minDateTime = new Date(currentDateTime.getTime() + minLeadTime * 60000);
                    const selectedDate = selectedDateTime.toDate(getLocalTimeZone());
                    if (selectedDate < minDateTime) {
                        await removeAllSchedules();
                        setSelectedDate(undefined);
                    }
                }
                
                showSuccessMessage({success: t("cartUpdatedSuccess")});
                result.itemCart && addItem(result.itemCart);
            } else if (result.error) {
                showErrorMessage({ error: result.error });
            }
        } catch (error: any) {
            showErrorMessage({ error: t("unexpectedError") });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            id={productData.id}
            className={`cursor-pointer max-w-sm rounded-2xl overflow-hidden relative`}
            onClick={() => {
                if (!preventProductDialog) {
                    handleOpen(productData.id, store?.user_id === session?.user?.id);
                }
            }}
        >
            <Card
                isFooterBlurred
                radius="lg"
                className={`border-none shadow-none items-end`}
            >
                <CardBody className="p-0">
                    <div className={`w-full aspect-square`}>
                        {Array.isArray(productData.dietary) && productData.dietary.length > 0 && (
                            <div className="absolute bottom-2 right-2 z-20">
                                <Popover 
                                    placement="top-end" 
                                    showArrow 
                                    offset={10}
                                    isOpen={isPopoverOpen}
                                    onOpenChange={handlePopoverOpenChange}
                                >
                                    <PopoverTrigger>
                                        <div 
                                            ref={triggerRef}
                                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-success-100 hover:bg-success-50 backdrop-blur-md cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsManualOpen(prev => !prev);
                                            }}
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={(e) => {
                                                const relatedTarget = e.relatedTarget as Node;
                                                if (popoverRef.current?.contains(relatedTarget)) {
                                                    return;
                                                }
                                                if (!isManualOpen) {
                                                    setIsHovered(false);
                                                }
                                            }}
                                        >
                                            <span className="text-success-600 text-sm font-medium">
                                                {t2("Diet")}
                                            </span>
                                            <Icon icon="solar:info-circle-linear" className="text-success-600" width={16} />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="p-1"
                                    >
                                        {(popoverProps) => (
                                            <div 
                                                className="flex flex-col gap-1 p-1" 
                                                ref={popoverRef}
                                                onMouseEnter={() => setIsHovered(true)}
                                                onMouseLeave={() => {
                                                    if (!isManualOpen) {
                                                        setIsHovered(false);
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                }}
                                            >
                                                {productData.dietary?.map((attr, index) => (
                                                    <div
                                                        key={attr}
                                                        className={`
                                                            flex items-center gap-2 px-2 py-1.5 text-sm text-success-700 
                                                            bg-success-50 rounded-lg transition-colors duration-150
                                                            ${index === 0 ? 'animate-fade-in-down' : ''}
                                                        `}
                                                    >
                                                        <DietaryIcon dietary={attr} size={28} />
                                                        <span className="font-medium">{t2(attr)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                        <Image
                            removeWrapper
                            alt={productData.name}
                            className="object-cover w-full rounded-b-none"
                            src={productData.picture}
                        />
                    </div>
                </CardBody>
                <CardFooter className={`p-1 px-3 pb-3`}>
                    <div className={`flex flex-col w-full gap-1 backdrop-blur-md`}>
                        <div className="flex justify-between items-center w-full">
                            {/* <div className="flex items-center gap-1"> */}
                                {/* <span className="text-yellow-500">★★★★☆</span>
                                <span className="text-xs text-default-600">4.0</span> */}
                            {/* </div> */}
                            <p className={`font-medium text-2xl`}>
                                {formatCurrency(productData.price)}
                            </p>
                        </div>
                        <p className={`text-sm font-normal line-clamp-2 leading-tight h-9`}>
                            {productData.name}
                        </p>
                        {(storeMinTimeOrder !== undefined) && (
                            <div className="flex items-center gap-1 text-xs text-default-600 mb-1">
                                <Icon icon="solar:clock-circle-linear" className="text-warning-500" width={14} />
                                <span>{t("MinLeadTime")}: </span>
                                <span>
                                    {(() => {
                                        const minutes = productData.min_lead_time ? Math.max(storeMinTimeOrder, productData.min_lead_time) : storeMinTimeOrder;
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
                                                return `${days} ${days === 1 ? t("day") : t("days")} ${remainingHours} ${remainingHours === 1 ? t("hour") : t("hours") }`;
                                            }
                                        }
                                    })()}
                                </span>
                            </div>
                        )}
                        <Button 
                            className="w-full bg-background text-base"
                            startContent={!isLoading && <Icon icon="material-symbols:add" width={24} />}
                            onPress={handleAddToCart}
                            isLoading={isLoading}
                        >
                            Add
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};