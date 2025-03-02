"use client";

import React, {useEffect, useState} from "react";
import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    Link,
    Spacer,
    addToast
} from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import {Icon} from "@iconify/react";
import {useRouter, useSearchParams} from "next/navigation";
import {CalendarDateTime, CalendarDate, today,} from "@internationalized/date";

import ThreeDotsDropdown from "@/components/store/store-header/subheader/three-dots";
import {renderCalendarTopContent} from "@/components/store/store-header/subheader/working-hours";
import {useStore} from "@/components/providers/store-provider";
import {updateOrderTime} from "@/app/(store)/[id]/actions";
import {useProductDialog} from "@/components/providers/product-provider";
import {
    parseDateParams,
    parseDateTime,
    setCalendarParams
} from "@/components/store/store-header/calendar/calendar-params";
import {IconLocation} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import dynamic from "next/dynamic";
import clarity from "@microsoft/clarity";
import {formatDate, SmartDatetimeInput} from "@/components/store/store-header/calendar/smart-calendar";

const LocationMap = dynamic(
    () => import("@/components/store/store-header/subheader/location-map"),
    { ssr: false }
);

interface StoreSubHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
}



export function StoreSubHeader({ dateParam, timeParam}: StoreSubHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { store } = useStore();
    const { handleOpen } = useProductDialog();
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(parseDateParams(`${dateParam} ${timeParam}`));
    const { theme } = useTheme();
    const [latitude, longitude] = [50.853356, 5.669382];

    const location = store?.location.route ? `${store.location.route}` : "Address Placeholder";
    const subLocation = store?.location.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";

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
                <Spacer y={4}/>
                <Link
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    className={'flex flex-row gap-x-4 items-center'}
                >
                    <IconLocation size={24}
                                  primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                  secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                    />
                    <div className={'flex flex-col gap-y-0'}>
                        <p className={"text-sm  text-text"}>
                            {location}
                        </p>
                        <p className={"text-xs  text-default-600"}>
                            {subLocation}
                        </p>
                    </div>
                </Link>
                <Spacer y={4}/>
                <div className={'h-40 w-full rounded-medium border-1 overflow-hidden'}>
                    <LocationMap latitude={latitude} longitude={longitude}  />
                </div>
                <Spacer y={4}/>
                <div className={'flex flex-row justify-between gap-x-4'}>
                    <ButtonGroup
                        fullWidth
                        size={'sm'}
                        radius={'md'}
                        className={'text-grayText'}
                    >
                        <SmartDatetimeInput
                            schedule={store.schedule}
                            minValue={today("Europe/Amsterdam")}
                            value={selectedDate}
                            onValueChange={handleDateChange}
                            placeholder='Schedule Order Time'
                        >
                            <Button
                                startContent={<Icon icon={'solar:walking-round-linear'} width={24}/>}
                                variant={selectedDate && "bordered"}
                                className={`${selectedDate ? 'text-default-600' : 'text-white bg-gradient-primary'}`}
                                onPress={() =>
                                    addToast({
                                        // title: "Pick Up",
                                        description: "Pick Up Option is selected",
                                        //@ts-ignore
                                        color: "success",
                                        shouldShowTimeoutProgress: true,
                                        timeout: 1000,
                                    })}
                            >
                                {(selectedDate) ? `Pick Up at ${formatDate(selectedDate)}` : "Order for Pick Up"}
                            </Button>
                        </SmartDatetimeInput>
                        {/*<Button*/}
                        {/*    isDisabled*/}
                        {/*    startContent={<Icon icon={'bxs:car'} width={24}/>}*/}
                        {/*    variant="bordered"*/}
                        {/*>*/}
                        {/*    Delivery*/}
                        {/*</Button>*/}
                    </ButtonGroup>
                </div>
        </div>
    );
}
