"use client";

import React, {useEffect, useState} from "react";
import {
    Button,
    Spacer
} from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import { Icon } from "@iconify/react";
import {useRouter, useSearchParams} from "next/navigation";
import {CalendarDateTime, CalendarDate, now, today, ZonedDateTime} from "@internationalized/date";

import ThreeDotsDropdown from "@/components/store/store-header/subheader/three-dots";
import {renderCalendarContent, renderCalendarTopContent} from "@/components/store/store-header/subheader/working-hours";
import {useStore} from "@/components/providers/store-provider";
import {SmartDatetimeInput} from "@/components/store/store-header/calendar/smart-calendar";
import {updateOrderTime} from "@/app/(store)/[id]/actions";
import {useProductDialog} from "@/components/providers/product-provider";
import showErrorMessage from "@/components/toast/toast-error";
import {FormError} from "@/components/authentication/form-error";
import {CopyText} from "@/components/ui/copy-text";
import {IconCopy, IconLocation, IconPhone} from "@/components/ui/icons";
import {useTheme} from "next-themes";


// --- Function to parse a date to numeric date and time strings ---
export function parseDateTime(
    dateValue: CalendarDateTime | undefined
): { date: string | null; time: string | null } {

    if (!dateValue) {
        return {
            date: null,
            time: null
        };
    }

    return {
        date: `${dateValue.year}-${dateValue.month}-${dateValue.day}`,
        time: `${dateValue.hour}:${dateValue.minute}`
    };
}

export function parseDateParams(
    dateValue: string
): CalendarDateTime | undefined {
    const [date, time] = dateValue.split(" ");
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    if (year === undefined || month === undefined || day === undefined || hour === undefined || minute === undefined) {
        return undefined;
    }

    return new CalendarDateTime(year, month, day, hour, minute);
}

interface StoreSubHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
    handleNext: () => void;
}


export function ScheduleOrder({ dateParam, timeParam, handleNext}: StoreSubHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { store } = useStore();
    const [isError, setIsError] = useState(false);
    const { theme } = useTheme();

    const location = store?.location.route ? `${store.location.route}, ${store.location.city}, ${store.location.zipCode}, ${store.location.country}` : "Location Placeholder";


    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | undefined>(parseDateParams(`${dateParam} ${timeParam}`));
    useEffect(() => {
        const SearchParams = new URLSearchParams(searchParams.toString());
        const calendar = parseDateParams(`${dateParam} ${timeParam}`)
        const {date, time} = parseDateTime(calendar);
        SearchParams.set("date", date?.toString() ?? "");
        SearchParams.set("time", time?.toString() ?? "");
        router.push(`?${SearchParams.toString()}`);
    }, []);


    // --- 2. onChange Handler for DatePicker: Save the date/time and update URL search params ---
    const handleDateChange = (newDate: CalendarDateTime) => {
        const {date, time} = parseDateTime(newDate);
        // Update the URL search parameters (make sure this runs on the client)
        if (date && time) {
            setIsError(false);
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set("date", date);
            newSearchParams.set("time", time);
            router.push(`?${newSearchParams.toString()}`);
            updateOrderTime(date, time).then(() => {
            });
        }
        setSelectedDate(newDate);
    };



    return (
        <div>
            <div className={'grid grid-cols-1 gap-y-6 md:gap-y-1 md:grid-cols-2 w-full items-start justify-between pb-4'}>
                <div>
                    {/*<p className={'mr-2 font-medium text-default-600'}>Store Pick Up Details:</p>*/}
                    <Spacer y={2}/>
                    <CopyText
                        copyText={location}
                        className={"md:max-w-[400px] text-medium md:text-large"}
                        textNotify={"Location Copied!"}
                        startContent={<IconLocation size={24}
                                                    primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                                    secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                        />}
                        endContent={<IconCopy size={20}
                                              primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                                              secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                        />}
                    >
                        <p className={"md:text-lg truncate md:max-w-[300px] text-grayText"}>
                            {location}
                        </p>
                    </CopyText>
                    <CopyText
                        copyText={store?.phone ? store.phone : 'Phone Number Placeholder'}
                        className={"md:max-w-[400px] md:text-lg"}
                        textNotify={"Phone Number Copied!"}
                        startContent={<IconPhone size={24}
                                                 primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                                                 secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                        />}
                        endContent={<IconCopy size={20}
                                              primaryColor={`${theme === 'light' ? '#730c70' : '#faf4d1'}`}
                                              secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#a3a3a3'}`}
                        />}
                    >
                        <p className={"md:text-lg truncate md:max-w-[250px] text-grayText"}>
                            {store?.phone ? store.phone : 'Phone Number Placeholder'}
                        </p>
                    </CopyText>
                </div>
                <div className={'flex flex-col justify-start md:justify-end'}>
                    <div className={'flex flex-row w-full justify-start  md:justify-end'}>
                        {renderCalendarContent()}
                    </div>
                    <Spacer y={4}/>
                    <div className="flex flex-col w-full items-start md:items-end justify-center">
                        <SmartDatetimeInput
                            isError={isError}
                            schedule={store.schedule}
                            minValue={today("Europe/Amsterdam")}
                            value={selectedDate}
                            onValueChange={handleDateChange}
                            placeholder='Schedule Order Time'
                        />
                        {isError && <Spacer y={2}/>}
                        <FormError message={isError ? "Please select a date and time to continue" : ""}/>
                    </div>
                </div>
            </div>
            <Spacer y={4}/>
            <div className={'flex flex-row w-full justify-end'}>
                <Button
                    className={'bg-gradient-primary text-white'}
                    endContent={<Icon icon={'solar:alt-arrow-right-linear'} width={24}/>}
                    onPress={() => {
                        if (selectedDate) {
                            handleNext();
                        } else {
                            setIsError(true);
                        }
                    }}
                >
                    Save Pick Up Details
                </Button>
            </div>
        </div>
    );
}
