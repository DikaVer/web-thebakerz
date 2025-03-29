"use client";

import React, { useEffect } from "react";
import {
    Button,
    ButtonGroup,
    Spacer,
    Skeleton,
    Spinner
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { CalendarDateTime, CalendarDate, now } from "@internationalized/date";
import { useStore } from "@/components/providers/store-provider";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";
import { useTranslations } from "next-intl";
import PickupInfo from "./pickup-info";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useSession } from "@/components/providers/session-provider";

interface StoreSubHeaderPickUpProps {
}

export function StoreSubHeaderPickUp({ }: StoreSubHeaderPickUpProps) {
    const { store } = useStore();
    const t = useTranslations("app/(store)/components/store-subheader");
    const { session } = useSession();
    
    const {
        selectedDate,
        isLoadingDate,
        isDateUpdating,
        handleDateChange,
        setMapLoaded
    } = useDelivery();

    return (
        <div className="flex flex-col w-full max-w-[440px]">
            
            {/* Display store pickup info */}
            <PickupInfo 
                store={store} 
                onMapLoaded={() => setMapLoaded(true)}
            />
            
            {/* Pickup time selector */}
            {(session?.user?.role !== "bakerz" || session.store?.id !== store.id) && (
                <ButtonGroup
                    fullWidth
                    size="sm"
                    radius="md"
                    className="text-grayText"
                >
                    <SmartDatetimeInput
                        schedule={store.schedule}
                        minValue={(() => {
                            return now("Europe/Amsterdam").add({ minutes: store.minTimeOrder || 2880 });
                        })()}
                        value={selectedDate}
                        onValueChange={(newDate) => handleDateChange(newDate)}
                        placeholder={t("scheduleOrderTime")}
                    >
                        <Button
                            startContent={isDateUpdating || isLoadingDate ? <Spinner size="sm" color="current" /> : <Icon icon="solar:walking-round-linear" width={24}/>}
                            variant={selectedDate instanceof CalendarDateTime ? "bordered" : 'solid'}
                            className={`${selectedDate instanceof CalendarDateTime ? 'text-default-600' : 'text-white bg-gradient-primary'} text-sm`}
                            onPress={() => {}}
                            isDisabled={isLoadingDate || isDateUpdating}
                        >
                            {isLoadingDate ? (
                                <Skeleton className="h-4 w-32 rounded-lg" />
                            ) : (selectedDate instanceof CalendarDateTime) ? (
                                `${t("pickUpAt")} ${formatDate(selectedDate)}`
                            ) : (
                                t("selectPickUpTime")
                            )}
                        </Button>
                    </SmartDatetimeInput>
                </ButtonGroup>
            )}
        </div>
    );
}