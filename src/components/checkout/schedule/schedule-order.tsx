"use client";

import React, { useEffect, useState } from "react";
import {

    Button,
    cn,
    ButtonGroup,
    Spacer,
    Alert,
} from "@heroui/react";

import { Icon, IconProps } from "@iconify/react";
import { CalendarDateTime, CalendarDate } from "@internationalized/date";

import { useStore } from "@/components/providers/store-provider";
import { DeliverySubheader } from "@/components/store/store-header/delivery-subheader";
import { useTranslations } from "next-intl";
import {useDelivery} from "@/components/providers/delivery-provider";
import { SelectTime } from "@/components/ui/select-time";
import { DeliveryAddressButton } from "@/components/ui/select-time/delivery-address-button";

interface StoreSubHeaderProps {
    handleNext: () => void;
}

type SocialIconProps = Omit<IconProps, "icon">;

export function ScheduleOrder({
                                  handleNext,
                              }: StoreSubHeaderProps) {
    const { store } = useStore();
    const cT = useTranslations("app/(store)/components/store-header");
    const t = useTranslations("app/(store)/components/checkout");
    const {
        isDelivery,
        selectedDate,
        validationResult,
        isTogglingDelivery,
        toggleDeliveryMode,
        address
    } = useDelivery();


    const phone = {
        name: t("phone"),
        href: `https://wa.me/${store?.phone?.replace(/\D/g, '')}`,
        icon: (props: SocialIconProps) => (
            <Icon {...props} icon="mdi:whatsapp" strokeWidth={1.5} width={24} />
        ),
    };

    const isNext = isDelivery ? (selectedDate instanceof CalendarDateTime && validationResult?.isInRange) : (selectedDate instanceof CalendarDateTime)

    return (
        <div className={'w-full flex flex-col items-center'}>
            <div className="flex flex-col w-full h-full justify-start">
             {/* Toggle Delivery Button */}
             <div className="flex items-center justify-start py-4">
                <div className="relative p-1 rounded-xl bg-background">
                    <ButtonGroup
                        isIconOnly
                        className="relative z-10 overflow-hidden"
                        isDisabled={isTogglingDelivery}
                    >
                        <Button
                            disableRipple
                            onPress={() => toggleDeliveryMode(false)}
                            isIconOnly
                            className={cn(
                                "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                !isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
                                isTogglingDelivery ? "opacity-50" : "opacity-100"
                            )}
                            variant="light"
                            isDisabled={isTogglingDelivery}
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
                                <span className={cn("text-sm ", isDelivery ? "text-default-500" : "text-foreground-secondary")}>{cT('pickup')}</span>
                            </div>
                        </Button>
                        <Button
                            disableRipple
                            onPress={() => toggleDeliveryMode(true)}
                            className={cn(
                                "min-w-32 transition-all duration-300 data-[hover=true]:bg-transparent",
                                isDelivery ? "text-foreground-secondary font-medium" : "text-default-500 font-normal",
                                isTogglingDelivery ? "opacity-50" : "opacity-100"
                            )}
                            variant="light"
                            isDisabled={isTogglingDelivery}
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
                                <span className={cn("text-sm", isDelivery ? "text-foreground-secondary" : "text-default-500")}>{cT('delivery')}</span>
                            </div>
                        </Button>
                    </ButtonGroup>
                    <div
                        className={cn(
                            "absolute top-1 bottom-1 w-[calc(50%)] rounded-full bg-white dark:bg-default-700 transition-all duration-300",
                            isDelivery ? "translate-x-[calc(100%)]" : "translate-x-[1px]"
                        )}
                        style={{
                            left: 0
                        }}
                    />
                </div>
            </div>
            {/* Enter Delivery Address Button */}
            {isDelivery && (
                    <DeliveryAddressButton/>
                )}
            </div>

            <div className={'flex flex-col w-full justify-center '}>
                <DeliverySubheader/>
            </div>
            <Spacer y={4} />
            <SelectTime />
            <Spacer y={4} />
            <div className={'flex flex-row w-full justify-center'}>
                <Button
                    variant={'bordered'}
                    isDisabled={!isNext}
                    className={`${
                        !isNext
                            ? ""
                            : "bg-gradient-primary text-white border-none"
                    }  w-full max-w-[440px]`}
                    endContent={
                        <Icon icon={'solar:alt-arrow-right-linear'} width={24} />
                    }
                    onPress={() => {
                        if (isNext) {
                            handleNext();
                        }
                    }}
                >
                    {isDelivery ? t("saveDeliveryDetails") : t("savePickUpDetails")}
                </Button>
            </div>
        </div>
    );
}