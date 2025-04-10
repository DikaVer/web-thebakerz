"use client";

import React, { useEffect } from "react";
import { StoreSubHeaderPickUp } from "@/components/store/store-header/subheader/store-subheader-pickup";
import { StoreSubHeaderDelivery } from "@/components/store/store-header/subheader/store-subheader-delivery";
import { CalendarDateTime, CalendarDate } from "@internationalized/date";
import { useDelivery } from "@/components/providers/delivery-provider";
import {Button, ButtonGroup, cn, Spacer} from "@heroui/react";
import {Icon} from "@iconify/react";
import {useStore} from "@/components/providers/store-provider";
import {useSession} from "@/components/providers/session-provider";
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
    const { session } = useSession();


    return (<>
                {(store.deliveryOption === "multi" && session?.user?.role !== "bakerz" && session.store?.id !== store.id) ? (
                    <div className="flex items-center justify-end w-full py-4">
                        <div className="relative p-1 rounded-xl bg-default-100 shadow-sm">
                            <ButtonGroup className="relative z-10 overflow-hidden" isDisabled={isTogglingDelivery || !isSubheaderLoaded}>
                                <Button
                                    disableRipple
                                    onPress={() => toggleDeliveryMode(false)}
                                    className={cn(
                                        "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                        !isDelivery ? "text-primary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery || !isSubheaderLoaded ? "opacity-50" : "opacity-100"
                                    )}
                                    variant="light"
                                    isDisabled={isTogglingDelivery || !isSubheaderLoaded}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon="solar:shop-2-bold"
                                            width={20}
                                            height={20}
                                            className={cn(
                                                "transition-all duration-300",
                                                !isDelivery ? "text-primary" : "text-default-500"
                                            )}
                                        />
                                        <span className="text-sm">{t('pickup')}</span>
                                    </div>
                                </Button>
                                <Button
                                    disableRipple
                                    onPress={() => toggleDeliveryMode(true)}
                                    className={cn(
                                        "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                        isDelivery ? "text-primary font-medium" : "text-default-500 font-normal",
                                        isTogglingDelivery || !isSubheaderLoaded ? "opacity-50" : "opacity-100"
                                    )}
                                    variant="light"
                                    isDisabled={isTogglingDelivery || !isSubheaderLoaded}
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon
                                            icon="solar:scooter-bold"
                                            width={20}
                                            height={20}
                                            className={cn(
                                                "transition-all duration-300",
                                                isDelivery ? "text-primary" : "text-default-500"
                                            )}
                                        />
                                        <span className="text-sm">{t('delivery')}</span>
                                    </div>
                                </Button>
                            </ButtonGroup>
                            {/* Animated background pill */}
                            <div
                                className={cn(
                                    "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-default-50 dark:bg-default-700 shadow-md transition-all duration-300",
                                    isDelivery ? "translate-x-[calc(100%)]" : "translate-x-[8px]"
                                )}
                                style={{
                                    left: 0
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <Spacer y={4}/>
                )}
                {(session?.user?.role !== "bakerz" && session.store?.id !== store.id) ?
                    isDelivery ? (
                            <StoreSubHeaderDelivery key={'delivery-settings'}/>
                        ) : (
                            <StoreSubHeaderPickUp key={'pickup-settings'}/>
                        )
                    :
                    <StoreSubHeaderPickUp key={'pickup-settings'}/>
                }
            </>);
}
