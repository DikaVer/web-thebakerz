/**
 * @fileoverview Switch between the pickup and delivery store subheaders.
 *
 * Exports the DeliverySubheader client component, which reads the current
 * mode from the delivery provider and renders StoreSubHeaderDelivery or
 * StoreSubHeaderPickUp accordingly.
 */
"use client";

import React from "react";
import { StoreSubHeaderPickUp } from "@/components/store/store-header/subheader/store-subheader-pickup";
import { StoreSubHeaderDelivery } from "@/components/store/store-header/subheader/store-subheader-delivery";
import { useDelivery } from "@/components/providers/delivery-provider";
import {Spacer} from "@heroui/react";
import {useTranslations} from "next-intl";

interface DeliverySubheaderProps {

}

export function DeliverySubheader() {
    const {
        isDelivery
    } = useDelivery();

    const t = useTranslations("app/(store)/components/store-header");


    return (<>
                {
                    isDelivery ? (
                            <StoreSubHeaderDelivery key={'delivery-settings'}/>
                        ) : (
                            <StoreSubHeaderPickUp key={'pickup-settings'}/>
                        )
                }
            </>);
}
