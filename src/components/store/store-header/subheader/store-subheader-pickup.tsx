"use client";

import React, {useEffect, useState} from "react";
import {
    Button,
    ButtonGroup,
    Spacer,
    addToast,
    Skeleton,
    Spinner
} from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import { Icon } from "@iconify/react";
import { CalendarDateTime, CalendarDate, now } from "@internationalized/date";
import { useStore } from "@/components/providers/store-provider";
import { updateOrderTime, getOrderTime } from "@/app/(store)/[id]/actions";
import { parseDateParams, parseDateTime } from "@/components/store/store-header/calendar/calendar-params";
import { IconLocation } from "@/components/ui/icons";
import { useTheme } from "next-themes";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";
import { useTranslations } from "next-intl";
import PickupInfo from "./pickup-info";

interface StoreSubHeaderPickUpProps {
    onLoadingStateChange?: (isLoaded: boolean) => void;
    setSelectedGlobalDate?: (date: CalendarDateTime | CalendarDate | undefined) => void;
}

export function StoreSubHeaderPickUp({ onLoadingStateChange, setSelectedGlobalDate }: StoreSubHeaderPickUpProps) {
    const { store } = useStore();
    const { session } = useSession();
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(undefined);
    const [isLoadingDate, setIsLoadingDate] = useState(true);
    const [isDateUpdating, setIsDateUpdating] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const t = useTranslations("app/(store)/components/store-subheader");

    // Load saved pickup date and time
    useEffect(() => {
        const loadSavedDateTime = async () => {
            try {
                setIsLoadingDate(true);
                const { date, time } = await getOrderTime(store.id);
                
                if (date && time) {
                    const parsedDate = parseDateParams(`${date} ${time}`);
                    setSelectedDate(parsedDate);
                    setSelectedGlobalDate?.(parsedDate);
                }
            } catch (error) {
                console.error('Error loading saved order time:', error);
            } finally {
                setIsLoadingDate(false);
            }
        };
        
        loadSavedDateTime();
    }, [store.id]);

    // Notify parent when loading is complete
    useEffect(() => {
        if (onLoadingStateChange) {
            // Consider the component fully loaded when both date and map are loaded
            const isLoaded = !isLoadingDate && isMapLoaded;
            
            // Use a slight delay to ensure UI stability
            const timer = setTimeout(() => {
                onLoadingStateChange(isLoaded);
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [isLoadingDate, isMapLoaded, onLoadingStateChange]);

    // onChange Handler for DatePicker: Save the date/time and update cookies
    const handleDateChange = async (newDate: CalendarDateTime | CalendarDate) => {
        if (newDate instanceof CalendarDate) {
            setSelectedDate(newDate);
            setSelectedGlobalDate?.(newDate);
        } else {
            const {date, time} = parseDateTime(newDate);
            if (date && time) {
                const parsedDate = parseDateParams(`${date} ${time}`);
                setSelectedDate(parsedDate);
                setSelectedGlobalDate?.(parsedDate);
                setIsDateUpdating(true);
                try {
                    await updateOrderTime(store.id, date, time);
                    
                    addToast({
                        description: t("pickUpOptionSelected"),
                        color: "success",
                        shouldShowTimeoutProgress: true,
                        timeout: 1000,
                    });
                } catch (error) {
                    console.error('Error updating pickup time:', error);
                    addToast({
                        description: t("errorUpdatingOrderTime"),
                        color: "danger",
                        shouldShowTimeoutProgress: true,
                        timeout: 3000,
                    });
                } finally {
                    setIsDateUpdating(false);
                }
            }
            setSelectedDate(newDate);
            setSelectedGlobalDate?.(newDate);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-[440px]">
            
            {/* Display store pickup info */}
            <PickupInfo 
                store={store} 
                onMapLoaded={() => setIsMapLoaded(true)}
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
                        onValueChange={handleDateChange}
                        placeholder={t("scheduleOrderTime")}
                    >
                        <Button
                            startContent={isDateUpdating || isLoadingDate ? <Spinner size="sm" color="current" /> : <Icon icon="solar:walking-round-linear" width={24}/>}
                            variant={selectedDate instanceof CalendarDateTime ? "bordered" : 'solid'}
                            className={`${selectedDate instanceof CalendarDateTime ? 'text-default-600' : 'text-white bg-gradient-primary'} text-sm`}
                            onPress={() =>
                                addToast({
                                    description: t("pickUpOptionSelected"),
                                    color: "success",
                                    shouldShowTimeoutProgress: true,
                                    timeout: 1000,
                                })}
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