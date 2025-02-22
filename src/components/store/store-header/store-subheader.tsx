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
        <div className="flex flex-col w-full justify-center items-center max-w-[440px] md:w-1/3">
            <Spacer y={4}/>
            <div className={'flex flex-row w-full justify-end'}>
                {renderCalendarTopContent()}
            </div>
            <Spacer y={4}/>
            <div className="flex flex-row w-full items-end justify-end">
                {(session?.user?.role === "bakerz" && session.store?.id === store.id) ? (
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
                ) : (
                    <>
                        <SmartDatetimeInput
                            schedule={store.schedule}
                            minValue={today("Europe/Amsterdam")}
                            value={selectedDate}
                            onValueChange={handleDateChange}
                            placeholder='Schedule Order Time'
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
