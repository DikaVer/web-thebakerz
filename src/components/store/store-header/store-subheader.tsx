"use client";

import React, {useState} from "react";
import {
    Button,
    Spacer
} from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import { Icon } from "@iconify/react";
import {useRouter, useSearchParams} from "next/navigation";
import {CalendarDateTime, CalendarDate, now, today, ZonedDateTime} from "@internationalized/date";

import ThreeDotsDropdown from "@/components/store/store-header/subheader/three-dots";
import {renderCalendarTopContent} from "@/components/store/store-header/subheader/working-hours";
import {useStore} from "@/components/providers/store-provider";
import {SmartDatetimeInput} from "@/components/store/store-header/calendar/smart-calendar";
import {updateOrderTime} from "@/app/(store)/[id]/actions";
import {useProductDialog} from "@/components/providers/product-provider";


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

    if (!year || !month || !day || !hour || !minute) {
        return undefined;
    }

    return new CalendarDateTime(year, month, day, hour, minute);
}

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
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | undefined>(parseDateParams(`${dateParam} ${timeParam}`));


    // --- 2. onChange Handler for DatePicker: Save the date/time and update URL search params ---
    const handleDateChange = (newDate: CalendarDateTime) => {
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
        setSelectedDate(newDate);
    };



    return (
        <div className="flex flex-col w-full justify-center items-center max-w-[440px] md:w-1/3">
            <Spacer y={4}/>
            <div className={'flex flex-row w-full justify-end'}>
                {renderCalendarTopContent()}
            </div>
            <Spacer y={4}/>
            <div className="flex flex-row w-full items-end justify-end">
                {(session?.user?.role === "bakerz" && session.store?.id === store.id) ? (
                    <Button
                        className="w-[150px] h-14 justify-start bg-gradient-primary text-white font-medium"
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
                ) : (
                    <>
                        <SmartDatetimeInput
                            schedule={store.schedule}
                            minValue={today("Europe/Amsterdam")}
                            value={selectedDate}
                            onValueChange={handleDateChange}
                            placeholder='Enter a date and time'
                        />
                    </>
                )}
                <Spacer x={2}/>

                <ThreeDotsDropdown/>

            </div>
            <div ref={sentinelRef} className="h-1"></div>
        </div>
    );
}
