"use client";

import React from "react";
import {
    Spacer,
    Alert,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { useDelivery } from "@/components/providers/delivery-provider";
import DeliveryInfo from "@/components/store/store-header/subheader/delivery-info";
import { usePathname } from "next/navigation";


interface StoreSubHeaderDeliveryProps {
}

export function StoreSubHeaderDelivery({ }: StoreSubHeaderDeliveryProps) {
    const t = useTranslations("app/(store)/components/store-subheader");
    const pathname = usePathname();
    const isCheckout = pathname.includes("checkout");

    const { 
        // Address validation
        validationResult,

        // Address
        address
    } = useDelivery();


    return (
        <div className="flex flex-col w-full h-full justify-between">
            {(address && validationResult.isInRange && validationResult.validatedAddress && validationResult.deliveryRegion) && (
                <>
                    <Spacer y={4} />
                    <DeliveryInfo
                        deliveryRegion={validationResult.deliveryRegion}
                    />
                </>
            )}
            {!address && (
                <div className="flex flex-col w-full h-full justify-between">
                    <Spacer y={4} />
                    <Alert 
                        color="warning"
                    >
                        <p className="text-xl">{t('please_enter_address_to_check_delivery')}</p>
                    </Alert>
                </div>
            )}

            {(!validationResult.isInRange && address && isCheckout) && (
                <div className="flex flex-col w-full h-full justify-between">
                    <Spacer y={4} />
                    <Alert 
                        color="danger"
                    >
                        <p className="text-xl">{t('address_not_in_delivery_range')}</p>
                    </Alert>
                </div>
            )}

        </div>
    );
}