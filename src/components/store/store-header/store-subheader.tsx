"use client";

import React, {useEffect, useState} from "react";
import {
    Button, ButtonGroup, Card, CardBody, Link,
    Spacer
} from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import {Icon, type IconProps} from "@iconify/react";
import {useRouter, useSearchParams} from "next/navigation";
import {CalendarDateTime, CalendarDate, now, today, ZonedDateTime} from "@internationalized/date";

import ThreeDotsDropdown from "@/components/store/store-header/subheader/three-dots";
import {renderCalendarTopContent} from "@/components/store/store-header/subheader/working-hours";
import {useStore} from "@/components/providers/store-provider";
import {SmartDatetimeInput} from "@/components/store/store-header/calendar/smart-calendar";
import {updateOrderTime} from "@/app/(store)/[id]/actions";
import {useProductDialog} from "@/components/providers/product-provider";
import {
    parseDateParams,
    parseDateTime,
    setCalendarParams
} from "@/components/store/store-header/calendar/calendar-params";
import {CopyText} from "@/components/ui/copy-text";
import {IconCopy, IconLocation, IconPhone} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("@/components/store/store-header/subheader/location-map"), { ssr: false });


interface StoreSubHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
}



export function StoreSubHeader({ dateParam, timeParam}: StoreSubHeaderProps) {
    const { session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { store, sentinelRef } = useStore();
    const { handleOpen } = useProductDialog();
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(parseDateParams(`${dateParam} ${timeParam}`));
    const { theme } = useTheme();
    const [latitude, longitude] = [50.853356, 5.669382];

    const location = store?.location.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";

    useEffect(() => {
        setCalendarParams(searchParams, router, dateParam, timeParam);
    }, []);


    // --- 2. onChange Handler for DatePicker: Save the date/time and update URL search params ---
    const handleDateChange = (newDate: CalendarDateTime | CalendarDate) => {
        if (newDate instanceof CalendarDate) {
            setSelectedDate(newDate);
        } else {
            const {date, time} = parseDateTime(newDate);
            // Update the URL search parameters (make sure this runs on the client)
            if (date && time) {
                setCalendarParams(searchParams, router, date, time);
                updateOrderTime(date, time);
            }
            setSelectedDate(newDate);
        }
    };



    return (
        <div className="flex flex-col w-full max-w-[440px]">
            <Card
                className={'w-full shadow-none border-1'}
            >
                <CardBody>
                    <Link
                        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                        className={'flex flex-row gap-x-4 items-center'}
                    >
                        <IconLocation size={24}
                                      primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                      secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                        />
                        <p className={"md:text-lg truncate w-[85%] text-grayText"}>
                            {location}
                        </p>
                    </Link>
                    <Spacer y={3}/>
                    <div className={'h-40 w-full rounded-2xl border-1 overflow-hidden'}>
                        <LocationMap latitude={latitude} longitude={longitude}  />
                    </div>
                    <Spacer y={3}/>
                    <div className={'flex flex-row justify-between gap-x-4'}>
                        <ButtonGroup
                            size={'sm'}
                            radius={'full'}
                            className={'text-grayText'}
                        >
                            <Button
                                startContent={<Icon icon={'solar:walking-round-linear'} width={24}/>}
                                variant="bordered"
                                className={'bg-gradient-card'}
                            >
                                Pick Up
                            </Button>
                            <Button
                                isDisabled
                                startContent={<Icon icon={'bxs:car'} width={24}/>}
                                variant="bordered"
                            >
                                Delivery
                            </Button>
                        </ButtonGroup>
                        {renderCalendarTopContent()}
                    </div>
                </CardBody>
            </Card>
            {(session?.user?.role === "bakerz" && session.store?.id === store.id) && (
                    <div className={'flex flex-row  justify-end gap-x-4 mt-6'}>
                        <Button
                            className="w-[150px] h-12 justify-start bg-gradient-primary text-white font-medium"
                            startContent={
                                <Icon
                                    icon="solar:add-square-broken"
                                    width={24}
                                    className="text-white"
                                />
                            }
                            onPress={() => {
                                handleOpen();
                            }}
                        >
                            Add Item
                        </Button>
                        <ThreeDotsDropdown/>
                    </div>
                )
            }

            <div ref={sentinelRef} className="h-1"></div>
        </div>
    );
}
