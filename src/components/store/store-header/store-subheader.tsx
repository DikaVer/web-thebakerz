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
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {CalendarDateTime, CalendarDate, today,} from "@internationalized/date";

import {useStore} from "@/components/providers/store-provider";
import {updateOrderTime} from "@/app/(store)/[id]/actions";
import {
    parseDateParams,
    parseDateTime
} from "@/components/store/store-header/calendar/calendar-params";
import {IconLocation} from "@/components/ui/icons";
import {useTheme} from "next-themes";
import dynamic from "next/dynamic";
import {formatDate, SmartDatetimeInput} from "@/components/store/store-header/calendar/smart-calendar";

const LocationMap = dynamic(
    () => import("@/components/store/store-header/subheader/location-map"),
    { ssr: false }
);

interface StoreSubHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
    setSelectedDateGlobal?: (date: CalendarDateTime | CalendarDate | undefined) => void;
}



export function StoreSubHeader({ dateParam, timeParam, setSelectedDateGlobal}: StoreSubHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { store } = useStore();
    const { session } = useSession();
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(parseDateParams(`${dateParam} ${timeParam}`));
    const { theme } = useTheme();
    const location = store?.location.route ? `${store.location.route}` : "Address Placeholder";
    const subLocation = store?.location.route ? `${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";

    // --- 2. onChange Handler for DatePicker: Save the date/time and update URL search params ---
    const handleDateChange = (newDate: CalendarDateTime | CalendarDate) => {
        if (newDate instanceof CalendarDate) {
            setSelectedDate(newDate);
        } else {
            const {date, time} = parseDateTime(newDate);
            // Update the URL search parameters (make sure this runs on the client)
            if (date && time) {
                const parsedDate = parseDateParams(`${date} ${time}`);
                setSelectedDate(parsedDate);
                setSelectedDateGlobal && setSelectedDateGlobal(parsedDate);
                updateOrderTime(date, time);
            }
            setSelectedDate(newDate);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-[440px]">
                <Spacer y={4}/>
                <Link
                    href={`https://www.google.com/maps?q=${store.location.latitude},${store.location.longitude}`}
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
                    {store.location.latitude && store.location.longitude &&
                        <LocationMap latitude={Number(store.location.latitude)} longitude={Number(store.location.longitude)} />
                    }
                </div>
                {(session?.user?.role !== "bakerz" || session.store?.id !== store.id) && (
                    <>
                        <Spacer y={4}/>
                        <ButtonGroup
                            fullWidth
                            size={'sm'}
                            radius={'md'}
                            className={'text-grayText'}
                        >
                            <SmartDatetimeInput
                                schedule={store.schedule}
                                minValue={today("Europe/Amsterdam").add({ days: 1 })}
                                value={selectedDate}
                                onValueChange={handleDateChange}
                                placeholder='Schedule Order Time'
                            >
                                <Button
                                    startContent={<Icon icon={'solar:walking-round-linear'} width={24}/>}
                                    variant={selectedDate instanceof CalendarDateTime ? "bordered" : 'solid'}
                                    className={`${selectedDate instanceof CalendarDateTime ? 'text-default-600' : 'text-white bg-gradient-primary'} text-sm`}
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
                                    {(selectedDate instanceof CalendarDateTime) ? `Pick Up at ${formatDate(selectedDate)}` : "Select Pick Up Time"}
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
                    </>
                )}
        </div>
    );
}
