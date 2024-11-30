'use client';

import React, {useEffect, useState } from "react";
import { IconChevronDown } from "@/components/ui/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SchedulerContent } from "@/components/scheduler/scheduler";
import useIsSmallScreen from "@/lib/hooks/use-is-small-screen";
import { AddressDataStoreField, AddressDataUserField,CheckoutData } from "@/lib/definitions";
import { cityLatLngMap, timeMap } from "@/lib/local-variables";
import { format, addDays } from 'date-fns';
import { formatAddress, formatDataDate, formatDateTime } from "@/lib/utils";
import {addUserLocationData, useCheckoutSettings} from "@/lib/hooks/useCheckoutSettings";
import useHowManyCalendars from "@/lib/hooks/use-how-many-calendars";

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
                className={`flex flex-grow-0 rounded-xl w-12 h-12 border-3 space-y-1 font-medium items-center justify-center ${bgColor} trigger-hover transition duration-700`}>
                <div className={`flex flex-col items-center justify-center`}>
                    <p className="text-on-hover-white text-base">{day}</p>
                    <p className="text-on-hover-white text-xl">{date}</p>
                </div>
            </div>
        </TooltipTrigger>
        <TooltipContent>
            <p>{status}</p>
        </TooltipContent>
    </Tooltip>
);

// interface CheckoutDetailsProps {
//     checkoutData: CheckoutData;
// }
//
// const CheckoutDetails: React.FC<CheckoutDetailsProps> = ({ checkoutData }) => {
//     return (
//         <div className="ml-2">
//             {checkoutData.deliveryMode === "PICKUP" ? (
//                 <div className="cm:mt-1">
//                     <p className="text-sm cm:text-base font-medium">
//                         {checkoutData.selectedTime
//                             ? `Pick Up: ${format(new Date(checkoutData.selectedTime.date), 'd MMM')}`
//                             : "Pick Up"}
//                     </p>
//                     <div className="flex">
//                         <p className="text-sm cm:text-base font-medium w-[104px]">
//                             {checkoutData.selectedTime ? (
//                                 `${formatDateTime(timeMap[checkoutData.selectedTime.time].from)} - ${formatDateTime(timeMap[checkoutData.selectedTime.time].to)}`
//                             ) : (
//                                 <strong>Select Time</strong>
//                             )}
//                         </p>
//                         <IconChevronDown className="w-5 h-5 cm:w-6 cm:h-6 text-text" />
//                     </div>
//                 </div>
//             ) : (
//                 <div className="grid -space-y-1.5 -mt-1">
//                     <p className="text-sm cm:text-base font-medium">
//                         {checkoutData.selectedTime
//                             ? `Delivery: ${format(new Date(checkoutData.selectedTime.date), 'd MMM')}`
//                             : "Delivery"}
//                     </p>
//                     <p className="text-sm cm:text-base font-medium">
//                         {checkoutData.selectedTime ? (
//                             `${formatDateTime(timeMap[checkoutData.selectedTime.time].from)} - ${formatDateTime(timeMap[checkoutData.selectedTime.time].to)}`
//                         ) : (
//                             <strong>Select Time</strong>
//                         )}
//                     </p>
//                     <div className="flex">
//                         <p className="text-sm cm:text-base clamp-title w-24 font-medium">
//                             {checkoutData.savedAddresses && checkoutData.deliveryAddress ? (
//                                 formatAddress(checkoutData.savedAddresses[checkoutData.deliveryAddress])
//                             ) : (
//                                 <strong>Select Address</strong>
//                             )}
//                         </p>
//                         <IconChevronDown className="w-5 h-5 cm:w-6 cm:h-6 text-text" />
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

const generateDates = (
    numCalendars: number,
    availability: Record<string, { from: keyof typeof timeMap; to: keyof typeof timeMap; availability: "Free" | "Busy"; }> | null,
) => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= numCalendars; i++) {
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

        dates.push(<DateBlock key={formattedDate} day={day} date={date} status={status} bgColor={bgColor} />);

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

    const fixedCheckoutData: CheckoutData = {
        deliveryMode: "PICKUP",
        deliveryAddress: null,
        savedAddresses: null,
        selectedTime: null
    };

    const numCalendars = useHowManyCalendars();

    return (
        <div className=" w-full h-12 cm:h-16 flex flex-row cursor-pointer">
            <div className="rounded-2xl bg-white opacity-80 h-12 w-full cm:w-128 cm:h-16 flex items-center justify-between pr-5">
                <TooltipProvider>
                    {generateDates(numCalendars, availability)}
                </TooltipProvider>
                {/*<div className="rounded-xl h-10 cm:h-14 items-center transition duration-500 hover:bg-gray-200 cursor-default">*/}
                    {/*<CheckoutDetails checkoutData={fixedCheckoutData} />*/}
                {/*</div>*/}
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
    const numCalendars = useHowManyCalendars();

    return (
        <div className="w-full h-12 cm:h-16 flex pr-5">
            <div
                className="rounded-2xl opacity-80 h-12 w-full cm:h-16 flex items-center justify-between cursor-pointer pr-5"
                onClick={() => setIsDialogOpen(true)}
            >
                <TooltipProvider>
                    {generateDates(numCalendars, availability)}
                </TooltipProvider>
                {/*<div className="rounded-xl w-auto h-10 cm:h-14 items-center transition duration-500 hover:bg-gray-200">*/}
                {/*    <CheckoutDetails checkoutData={checkoutData} />*/}
                {/*</div>*/}
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


