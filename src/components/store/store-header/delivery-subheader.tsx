"use client";

import React from "react";
import { StoreSubHeaderPickUp } from "@/components/store/store-header/subheader/store-subheader-pickup";
import { StoreSubHeaderDelivery } from "@/components/store/store-header/subheader/store-subheader-delivery";
import { useDelivery } from "@/components/providers/delivery-provider";
import {Button, ButtonGroup, cn, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useStore} from "@/components/providers/store-provider";
import {useTranslations} from "next-intl";

interface DeliverySubheaderProps {

}

export function DeliverySubheader() {
    const {
        isDelivery,
        isTogglingDelivery,
        toggleDeliveryMode,
        isSubheaderLoaded
    } = useDelivery();

    const t = useTranslations("app/(store)/components/store-header");
    const { store } = useStore();


    return (<>
            <Spacer y={4}/>
                {
                    isDelivery ? (
                            <StoreSubHeaderDelivery key={'delivery-settings'}/>
                        ) : (
                            <StoreSubHeaderPickUp key={'pickup-settings'}/>
                        )
                }
            </>);
}
