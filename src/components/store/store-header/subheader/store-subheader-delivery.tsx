"use client";

import React, { useEffect} from "react";
import {
    Button,
    Spacer,
    Card,
    CardBody,
    Spinner,
    useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { IconLocation } from "@/components/ui/icons";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useDelivery } from "@/components/providers/delivery-provider";
import DeliveryInfo from "@/components/store/store-header/subheader/delivery-info";


interface StoreSubHeaderDeliveryProps {
}

export function StoreSubHeaderDelivery({ }: StoreSubHeaderDeliveryProps) {
    const { theme } = useTheme();
    const t = useTranslations("app/(store)/components/store-subheader");

    const { 
        // Date selection
        isLoadingDate,
        isDateUpdating,
        isSubheaderLoaded,
        
        // Address management
        showDeliveryInfo,
        
        // Address validation
        validationResult,

        
        // Set subheader loaded state
        setSubheaderLoaded
    } = useDelivery();
    
    // Helper function to get icon colors based on conditions
    const getIconColors = () => {
        const isActive = showDeliveryInfo && validationResult.isInRange;
        
        if (theme === 'light') {
            return {
                primary: isActive ? '#000' : '#fff',
                secondary: isActive ? '#000' : '#fff'
            };
        } else {
            return {
                primary: isActive ? '#ffffff' : '#ffffff',
                secondary: isActive ? '#ffffff' : '#ffffff'
            };
        }
    };

    // Notify parent when loading is complete
    useEffect(() => {

        // Use a slight delay to ensure UI stability
        const timer = setTimeout(() => {
            setSubheaderLoaded(!isDateUpdating || !isLoadingDate);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [isDateUpdating, isLoadingDate, setSubheaderLoaded]);


    return (
        <div className="flex flex-col w-full h-full justify-between max-w-[440px]">
            
            <Button
                className={`w-full justify-between ${showDeliveryInfo && validationResult.isInRange ? "bg-transparent text-text" : "bg-gradient-primary text-white"}`}
                variant="solid"
                startContent={
                    !isSubheaderLoaded ? (
                        <Spinner size="sm" color="current" />
                    ) : (
                        <IconLocation
                            size={24}
                            primaryColor={getIconColors().primary}
                            secondaryColor={getIconColors().secondary}
                            className="flex-shrink-0"
                        />
                    )
                }
                endContent={
                    <Icon 
                        icon={showDeliveryInfo ? "solar:pen-linear" : "solar:add-square-linear"} 
                        width={24} 
                        className={showDeliveryInfo && validationResult.isInRange ? "text-text" : "text-white"}
                    />
                }
            >
                <div className="flex flex-col items-start min-w-0 flex-1">
                    {showDeliveryInfo && validationResult.isInRange && validationResult.validatedAddress ? (
                        <>
                            <p className="text-sm truncate w-full text-left">
                                {`${validationResult?.validatedAddress?.street}, ${validationResult?.validatedAddress?.houseNumber}, ${validationResult?.validatedAddress?.zipCode}`}
                            </p>
                            {validationResult?.validatedAddress?.additionalInfo && (
                                <p className="text-xs truncate w-full text-left">
                                    {validationResult?.validatedAddress?.additionalInfo}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm truncate w-full text-left">
                            {!isSubheaderLoaded ? t("loadingAddress") : t("enterDeliveryAddressPrompt")}
                        </p>
                    )}
                </div>
            </Button>

            <Spacer y={4} />

            {showDeliveryInfo && validationResult.isInRange && validationResult.validatedAddress && validationResult.deliveryRegion ? (
                <DeliveryInfo
                    deliveryRegion={validationResult.deliveryRegion}
                />
            ) : (
                <div>
                    <Card shadow="none" className="w-full overflow-hidden border border-border cursor-pointer max-w-[440px]">
                        <CardBody className="p-6 flex flex-col items-center justify-center gap-3 w-[440px] max-w-[100%]">
                            {!isSubheaderLoaded ? (
                                <>
                                    <Spinner color="primary" size="lg" />
                                    <p className="text-sm text-default-500">{t("loadingDeliveryOptions")}</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-default-100 flex items-center justify-center">
                                        <Icon icon="solar:map-point-search-bold" width={24} className="text-default-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-default-700">{t("noDeliveryAddressYet")}</p>
                                        <p className="text-xs mt-1 text-default-500 max-w-64 mx-auto">{t("enterAddressToSeeDeliveryOptions")}</p>
                                    </div>
                                </>
                            )}
                        </CardBody>
                    </Card>
                </div>
            )}
        
        </div>
    );
}