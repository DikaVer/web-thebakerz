"use client";

import React, { useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import {
    Button, CalendarDate, Card, CardBody, Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Spacer
} from "@heroui/react";
import { useTheme } from "next-themes";
import { useSession } from "@/components/providers/session-provider";
import { DatePicker } from "@heroui/date-picker";
import { Icon } from "@iconify/react";
import {useRouter, useSearchParams} from "next/navigation";
import {CalendarDateTime} from "@internationalized/date";
import {WorkDay} from "@/lib/actions/calendar-actions";
import {updateOrderTime} from "@/app/(store)/[id]/actions";
import ThreeDotsDropdown from "@/components/store/store-header/subheader/three-dots";
import {renderCalendarTopContent} from "@/components/store/store-header/subheader/working-hours";


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
    console.log(dateValue);
    const [date, time] = dateValue.split(" ");
    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    console.log(year, month, day, hour, minute);

    if (!year || !month || !day || !hour || !minute) {
        return undefined;
    }

    return new CalendarDateTime(year, month, day, hour, minute);
}

interface StoreSubHeaderProps {
    dateParam: string | null;
    timeParam: string | null;
}


export function StoreSubHeader({ dateParam, timeParam }: StoreSubHeaderProps) {
    const { session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get the current date using your internationalized-date library
    const currentDate = parseDateParams(`${dateParam} ${timeParam}`);





    // --- 2. onChange Handler for DatePicker: Save the date/time and update URL search params ---
    const handleDateChange = (newDate: any) => {
        const {date, time} = parseDateTime(newDate);
        // Update the URL search parameters (make sure this runs on the client)
        if (date && time) {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set("date", date);
            newSearchParams.set("time", time);
            router.push(`?${newSearchParams.toString()}`);
            updateOrderTime(date, time).then(() => {
            });
        }
    };


    return (
        <div className="flex flex-col w-full items-center max-w-[440px] md:max-w-[540px]">
            <Spacer y={4}/>
            <div className={'flex flex-row w-full justify-end'}>
                {renderCalendarTopContent()}
            </div>
            <Spacer y={4}/>
            <div className="flex flex-row w-full items-end justify-end">
                {session?.user?.role === "bakerz" ? (
                    <Button
                        className="w-[150px] h-14 justify-start bg-gradient-primary text-white font-medium"
                        startContent={
                            <Icon
                                icon="solar:add-square-broken"
                                width={24}
                                className="text-white"
                            />
                        }
                    >
                        Add Item
                    </Button>
                ):(
                        <DatePicker
                            hideTimeZone
                            showMonthAndYearPickers

                            defaultValue={currentDate}
                            granularity="minute"
                            //@ts-ignore
                            minValue={currentDate}
                            label="Schedule Order"
                            variant="bordered"
                            className="w-full"
                            selectorIcon={
                                <Icon
                                    icon="solar:calendar-broken"
                                    width={24}
                                    className="text-default-500"
                                />
                            }
                            onChange={handleDateChange}
                        />
                    )}
                <Spacer x={2} />

                <ThreeDotsDropdown/>

            </div>
        </div>
    );
}
