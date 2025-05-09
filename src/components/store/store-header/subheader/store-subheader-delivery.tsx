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


    // Notify parent when loading is complete
    useEffect(() => {

        // Use a slight delay to ensure UI stability
        const timer = setTimeout(() => {
            setSubheaderLoaded(!isDateUpdating || !isLoadingDate);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [isDateUpdating, isLoadingDate, setSubheaderLoaded]);


    return (
        <div className="flex flex-col w-full h-full justify-between">
            {(showDeliveryInfo && validationResult.isInRange && validationResult.validatedAddress && validationResult.deliveryRegion) && (
                <>
                    <Spacer y={4} />
                    <DeliveryInfo
                        deliveryRegion={validationResult.deliveryRegion}
                    />
                </>
            )}
        </div>
    );
}