'use client';

import React, { useCallback, useEffect, useState } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SchedulerContent } from "@/components/scheduler/scheduler";
import useIsSmallScreen from "@/lib/hooks/use-is-small-screen";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AddressDataStoreField, AddressDataUserField, AddressUserData, CheckoutData } from "@/lib/definitions";
import { cityLatLngMap, timeMap } from "@/lib/local-variables";
import { format, addDays } from 'date-fns';
import { formatAddress, formatDataDate, formatDateTime } from "@/lib/utils";
import {useCheckoutSettings} from "@/lib/hooks/useCheckoutSettings";

// ---------------------- Shared Components ---------------------- //

interface DateBlockProps {
    day: string;
    date: number;
    status: string;
    bgColor: string;
}

const DateBlock: React.FC<DateBlockProps> = ({ day, date, status, bgColor }) => (
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

interface CheckoutDetailsProps {
    checkoutData: CheckoutData;
}

const CheckoutDetails: React.FC<CheckoutDetailsProps> = ({ checkoutData }) => {
    return (
        <div className="ml-2">
            {checkoutData.deliveryMode === "PICKUP" ? (
                <div className="cm:mt-1">
                    <p className="text-sm cm:text-base text-black font-medium">
                        {checkoutData.selectedTime
                            ? `Pick Up: ${format(new Date(checkoutData.selectedTime.date), 'd MMM')}`
                            : "Pick Up"}
                    </p>
                    <div className="flex">
                        <p className="text-sm cm:text-base text-black font-medium w-24">
                            {checkoutData.selectedTime ? (
                                `${formatDateTime(timeMap[checkoutData.selectedTime.time].from)} - ${formatDateTime(timeMap[checkoutData.selectedTime.time].to)}`
                            ) : (
                                <strong>Select Time</strong>
                            )}
                        </p>
                        <IconChevronDown className="w-5 h-5 cm:w-6 cm:h-6" />
                    </div>
                </div>
            ) : (
                <div className="grid -space-y-1.5 -mt-1">
                    <p className="text-sm cm:text-base text-black font-medium">
                        {checkoutData.selectedTime
                            ? `Delivery: ${format(new Date(checkoutData.selectedTime.date), 'd MMM')}`
                            : "Delivery"}
                    </p>
                    <p className="text-sm cm:text-base text-black font-medium">
                        {checkoutData.selectedTime ? (
                            `${formatDateTime(timeMap[checkoutData.selectedTime.time].from)} - ${formatDateTime(timeMap[checkoutData.selectedTime.time].to)}`
                        ) : (
                            <strong>Select Time</strong>
                        )}
                    </p>
                    <div className="flex">
                        <p className="text-sm cm:text-base text-black clamp-title w-24 font-medium">
                            {checkoutData.savedAddresses && checkoutData.deliveryAddress ? (
                                formatAddress(checkoutData.savedAddresses[checkoutData.deliveryAddress])
                            ) : (
                                <strong>Select Address</strong>
                            )}
                        </p>
                        <IconChevronDown className="w-5 h-5 cm:w-6 cm:h-6" />
                    </div>
                </div>
            )}
        </div>
    );
};

const generateDates = (
    availability: Record<string, { from: keyof typeof timeMap; to: keyof typeof timeMap; availability: "Free" | "Busy"; }> | null,
    isTinyScreen: boolean,
    isSmallScreen: boolean
) => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 5; i++) {
        const currentDate = addDays(today, i);
        const formattedDate = formatDataDate(currentDate);
        const day = format(currentDate, 'EEE').toUpperCase();
        const date = currentDate.getDate();

        const status = availability && availability[formattedDate]
            ? (availability[formattedDate].availability === "Free" ? "Open" : "Limited")
            : "Closed";
        const bgColor = status === "Open" ? "border-greenBakerz hover:bg-greenBakerz"
            : status === "Limited" ? "border-orangeBakerz hover:bg-orangeBakerz"
                : "border-redBakerz hover:bg-redBakerz";

        if ((i === 4 && !isTinyScreen) || (i === 5 && !isSmallScreen) || (i !== 4 && i !== 5)) {
            dates.push(<DateBlock key={formattedDate} day={day} date={date} status={status} bgColor={bgColor} />);
        }
    }

    return dates;
};



// ---------------------- Calendar Components ---------------------- //

export interface MiniCalendarBakerzProps {
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    > | null;
}

export const MiniCalendarBakerz: React.FC<MiniCalendarBakerzProps> = ({ availability }) => {
    const isTinyScreen = useIsSmallScreen(400);
    const isSmallScreen = useIsSmallScreen(460);

    const fixedCheckoutData: CheckoutData = {
        deliveryMode: "PICKUP",
        deliveryAddress: null,
        savedAddresses: null,
        selectedTime: null
    };

    return (
        <div className="absolute top-2 right-2 w-full h-12 cm:h-16 flex flex-row-reverse cursor-pointer">
            <div className="rounded-2xl bg-white px-1.5 opacity-80 h-12 w-full cm:w-128 cm:h-16 flex items-center justify-between ml-4">
                <TooltipProvider>
                    {generateDates(availability, isTinyScreen, isSmallScreen)}
                </TooltipProvider>
                <div className="rounded-xl w-auto h-10 cm:h-14 items-center transition duration-500 hover:bg-gray-200 cursor-default">
                    <CheckoutDetails checkoutData={fixedCheckoutData} />
                </div>
            </div>
        </div>
    );
};

export interface MiniCalendarProps {
    location: AddressDataStoreField;
    deliveryOptions: Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    > | null;
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    > | null;
    userLocation: AddressDataUserField[] | null;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ location, deliveryOptions, availability, userLocation }) => {
    const isTinyScreen = useIsSmallScreen(400);
    const isSmallScreen = useIsSmallScreen(460);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSchedulerView, setIsSchedulerView] = useState<"scheduler" | "timeSelection" | "addressSelection" | "addressEditing">("scheduler");

    const { checkoutData, updateCheckoutData } = useCheckoutSettings();

    useEffect(() => {
        if (userLocation) {
            addUserLocationData(userLocation);
        }
    }, [userLocation]);

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
        <div className="absolute top-2 right-2 w-full h-12 cm:h-16 flex flex-row-reverse">
            <div
                className="rounded-2xl bg-white px-1.5 opacity-80 h-12 w-full cm:w-128 cm:h-16 flex items-center justify-between ml-4 cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
            >
                <TooltipProvider>
                    {generateDates(availability, isTinyScreen, isSmallScreen)}
                </TooltipProvider>
                <div className="rounded-xl w-auto h-10 cm:h-14 items-center transition duration-500 hover:bg-gray-200">
                    <CheckoutDetails checkoutData={checkoutData} />
                </div>
            </div>
            {isDialogOpen && (
                <SchedulerContent
                    isDialogOpen={isDialogOpen}
                    checkoutData={checkoutData}
                    updateCheckoutData={updateCheckoutData}
                    handleDialogClose={handleDialogClose}
                    isSchedulerView={isSchedulerView}
                    setIsSchedulerView={setIsSchedulerView}
                    availability={availability}
                />
            )}
        </div>
    );
};

// ---------------------- Utility Function ---------------------- //

const addUserLocationData = (userLocation: AddressDataUserField[]): AddressUserData => {
    const userLocationData: AddressUserData = userLocation.reduce((acc, location) => {
        acc[location.id] = {
            id: location.id,
            city: location.city,
            country: location.country,
            latitude: Number(location.latitude),
            longitude: Number(location.longitude),
            premise: location.premise,
            route: location.route,
            state: location.state,
            street_number: location.street_number,
            sub_premise: location.sub_premise,
            zip_code: location.zip_code,
            delivery_notes: location.delivery_notes,
        };
        return acc;
    }, {} as AddressUserData);

    if (Object.keys(userLocationData).length > 0) {
        localStorage.setItem('deliveryAddress', "");
        localStorage.setItem('savedAddresses', JSON.stringify(userLocationData));
    }

    return userLocationData;
};
