'use client';

import React, {useCallback, useEffect, useState} from "react";
import {IconChevronDown} from "@/components/ui/icons";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {SchedulerContent} from "@/components/scheduler/scheduler";
import useIsSmallScreen from "@/lib/hooks/use-is-small-screen";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {AddressDataUserField, AddressUserData, CheckoutData} from "@/lib/definitions";
import {timeMap} from "@/lib/local-variables";


export function MiniCalendarBakerz() {
    const isTinyScreen = useIsSmallScreen(400);
    const isSmallScreen = useIsSmallScreen(460);
    return (
        <div
            className="absolute top-2 right-2 w-full h-12 cm:h-16 flex flex-row-reverse cursor-pointer"
        >
            <div
                className="rounded-2xl bg-white px-1.5 opacity-80 h-12 w-full cm:w-128 cm:h-16 flex items-center justify-between ml-4">
                <TooltipProvider>
                    <Date day="MON" date={11} status="Free" bgColor="border-greenBakerz hover:bg-greenBakerz"/>
                    <Date day="TUE" date={12} status="Busy"
                          bgColor="border-orangeBakerz hover:bg-orangeBakerz"/>
                    <Date day="WED" date={13} status="Closed" bgColor="border-redBakerz hover:bg-redBakerz"/>
                    {!isTinyScreen && <Date day="THU" date={14} status="Free"
                                             bgColor="border-greenBakerz hover:bg-greenBakerz"/>}
                    {!isSmallScreen && <Date day="FRI" date={15} status="Busy"
                                             bgColor="border-orangeBakerz hover:bg-orangeBakerz"/>}
                </TooltipProvider>
                <div
                    className="rounded-xl w-auto h-10 cm:h-14 items-center transition duration-500 hover:bg-gray-200 cursor-default">
                    <CheckoutDetails checkoutData={{deliveryMode: "PICKUP",
                        deliveryAddress: null,
                        savedAddresses: null,
                        date: null,
                        time: null}}/>
                </div>
            </div>
        </div>
    );
}

export function MiniCalendar() {
    const isTinyScreen = useIsSmallScreen(400);
    const isSmallScreen = useIsSmallScreen(460);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [isSchedulerView, setIsSchedulerView] = useState<"scheduler" | "timeSelection" | "addressSelection" | "addressEditing">("scheduler");


    const useCheckoutSettings = () => {
        const [checkoutData, setCheckoutData] = useState({
            deliveryMode: "PICKUP",
            deliveryAddress: null,
            savedAddresses: null,
            date: null,
            time: null,
        } as CheckoutData);

        const pathname = usePathname();
        const { replace } = useRouter();
        const searchParams = useSearchParams();

        // Utility function to get item from localStorage and handle parsing
        const getLocalStorageItem = <T,>(key: string, defaultValue: any): T => {
            const item = localStorage.getItem(key);
            if (key === 'deliveryMode' || key === 'date' || key === 'time') {
                return item ? (item as T) : defaultValue;
            } else {
                return item ? (JSON.parse(item) as T) : defaultValue;
            }
        };

        // Function to update checkout settings from localStorage
        const updateCheckoutData = useCallback(() => {
            const updatedCheckoutData = {
                deliveryMode: getLocalStorageItem<"PICKUP" | "DELIVERY">('deliveryMode', "PICKUP"),
                deliveryAddress: getLocalStorageItem<AddressDataUserField>('deliveryAddress', null),
                savedAddresses: getLocalStorageItem<AddressUserData>('savedAddresses', null),
                date: getLocalStorageItem<`${number}/${number}/${number}` | null>('date', null),
                time: getLocalStorageItem<keyof typeof timeMap | null>('time', null),
            } as CheckoutData;

            setCheckoutData(updatedCheckoutData);

            const params = new URLSearchParams(searchParams);
            params.set('deliveryMode', updatedCheckoutData.deliveryMode);

            if (updatedCheckoutData.date && updatedCheckoutData.time) {
                params.set('date', updatedCheckoutData.date);
                params.set('time', updatedCheckoutData.time.toString());
            }

            replace(`${pathname}?${params.toString()}`);
        }, []);


        useEffect(() => {
            updateCheckoutData(); // Initial update on mount
        }, [updateCheckoutData]);

        return { checkoutData, updateCheckoutData };
    };


    const { checkoutData, updateCheckoutData } = useCheckoutSettings();




    useEffect(() => {
        if (isDialogOpen) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        };
    }, [isDialogOpen]);


    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    return (
        <div
            className="absolute top-2 right-2 w-full h-12 cm:h-16 flex flex-row-reverse"
        >
            <div
                className="rounded-2xl bg-white px-1.5 opacity-80 h-12 w-full cm:w-128 cm:h-16 flex items-center justify-between ml-4 cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
            >
                <TooltipProvider>
                    <Date day="MON" date={11} status="Free" bgColor="border-greenBakerz hover:bg-greenBakerz"/>
                    <Date day="TUE" date={12} status="Busy"
                          bgColor="border-orangeBakerz hover:bg-orangeBakerz"/>
                    <Date day="WED" date={13} status="Closed" bgColor="border-redBakerz hover:bg-redBakerz"/>
                    {!isTinyScreen && <Date day="THU" date={14} status="Free"
                                            bgColor="border-greenBakerz hover:bg-greenBakerz"/>}
                    {!isSmallScreen && <Date day="FRI" date={15} status="Busy"
                                             bgColor="border-orangeBakerz hover:bg-orangeBakerz"/>}
                </TooltipProvider>
                <div
                    className="rounded-xl w-auto h-10 cm:h-14 items-center transition duration-500 hover:bg-gray-200">
                    <CheckoutDetails checkoutData={checkoutData}/>
                </div>
            </div>
            {isDialogOpen ?
                (<SchedulerContent
                    checkoutData={checkoutData}
                    updateCheckoutData={updateCheckoutData}
                    handleDialogClose={handleDialogClose}
                    isSchedulerView={isSchedulerView}
                    setIsSchedulerView={setIsSchedulerView}
                />) : null
            }
        </div>
    );
}

// Extracted component to reduce duplication
const CheckoutDetails = ({ checkoutData }: { checkoutData: CheckoutData }) => {
    return (
        <div className="ml-2">
            {checkoutData.deliveryMode === "PICKUP" ? (
                <div>
                    <p className="text-sm cm:text-base text-black font-medium">Pick Up</p>
                    <div className="flex">
                        <p className="text-sm cm:text-base text-black w-24">{checkoutData.time ||
                            <strong>Select Time</strong>}</p>
                        <IconChevronDown className="w-5 h-5 cm:w-6 cm:h-6"/>
                    </div>
                </div>
            ) : (
                <div className={'grid -space-y-1.5'}>
                    <p className="text-sm cm:text-base text-black font-medium">Delivery</p>
                    <p className="text-sm cm:text-base text-black">{checkoutData.time || <strong>Select Time</strong>}</p>
                    <div className="flex">
                    <p className="text-sm cm:text-base text-black clamp-title w-24">
                            {checkoutData.deliveryAddress?.route || <strong>Select Address</strong>}
                        </p>
                        <IconChevronDown className="w-5 h-5 cm:w-6 cm:h-6" />
                    </div>
                </div>
            )}
        </div>
    );
};


const Date = ({ day, date, status, bgColor }: { day: string, date: number, status: string, bgColor: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <div
                className={`rounded-xl w-10 h-10 cm:w-12 cm:h-12 border-3 -space-y-1 flex flex-col font-medium items-center justify-center ${bgColor} trigger-hover transition duration-700`}>
                <p className="text-black text-on-hover-white text-xs cm:text-sm">{day}</p>
                <p className="text-black text-on-hover-white text-base cm:text-xl">{date}</p>
            </div>
        </TooltipTrigger>
        <TooltipContent>
            <p>{status}</p>
        </TooltipContent>
    </Tooltip>
);
