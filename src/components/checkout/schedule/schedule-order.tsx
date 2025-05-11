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
    } = useDelivery();

    const isNext = isDelivery ? (selectedDate instanceof CalendarDateTime && validationResult?.isInRange) : (selectedDate instanceof CalendarDateTime)

    return (
        <div className={'w-full flex flex-col items-center'}>
            <div className="flex flex-col w-full h-full justify-start">   
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