'use client';

import React, { useState } from "react";
import {Card, Image, CardFooter, Popover, PopoverTrigger, PopoverContent, CardBody} from "@heroui/react";
import {ProductData} from "@/lib/actions/product";
import {useProductDialog} from "@/components/providers/product-provider";
import {formatCurrency} from "@/lib/utils";
import {useTranslations} from "next-intl";
import {useStore} from "@/components/providers/store-provider";
import {useSession} from "@/components/providers/session-provider";
import { Icon } from "@iconify/react";
import { useHoverPopover } from "@/hooks/use-hover-popover";
import { useDelivery } from "@/components/providers/delivery-provider";
interface ProductBaseProps {
    productData: ProductData;
}

export const ProductBase: React.FC<ProductBaseProps> = ({
    productData,
}) => {
    const [isManualOpen, setIsManualOpen] = useState(false);
    const { isHovered, setIsHovered, triggerRef, popoverRef } = useHoverPopover();
    
    // Combine manual opening and hover state
    const isPopoverOpen = isManualOpen || isHovered;

    const { handleOpen } = useProductDialog();
    const t2 = useTranslations("Dietary");
    const t = useTranslations("app/(store)/components/product-page");
    const { store } = useStore();
    const { session } = useSession();
    const { isDelivery, validationResult } = useDelivery();
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

    return (
        <div
            id={productData.id}
            className={`cursor-pointer max-w-sm border-1 rounded-2xl overflow-hidden relative`}
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
                                                            flex items-center gap-2 px-1 py-1.5 text-sm text-success-700 
                                                            bg-success-50 rounded-lg transition-colors duration-150
                                                            ${index === 0 ? 'animate-fade-in-down' : ''}
                                                        `}
                                                    >
                                                        <Icon icon="mdi:food-certified" className="text-success-600" width={18} />
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
                <CardFooter className={`px-2`}>
                    <div className={`flex flex-col w-full gap-1 backdrop-blur-md`}>
                        <p className={`text-xs sm:text-sm font-medium line-clamp-2 leading-tight h-8 sm:h-10`}>
                            {productData.name}
                        </p>
                        {(storeMinTimeOrder !== undefined) ? (
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
                        ) : (
                            <div className="h-4"/>
                        )}
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-1">
                                {/* <span className="text-yellow-500">★★★★☆</span>
                                <span className="text-xs text-default-600">4.0</span> */}
                            </div>
                            <p className={`text-base sm:text-lg font-semibold`}>
                                {formatCurrency(productData.price)}
                            </p>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};