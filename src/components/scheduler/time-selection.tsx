// Define the interface for the props
import React, {useState} from "react";
import {IconArrow, Radio} from "@/components/ui/icons";
import {Button} from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import {CarouselDate} from "@/components/scheduler/carousel-date";
import {CheckoutData} from "@/lib/definitions";
import {sortedTimeKeys, timeMap} from "@/lib/local-variables";
import { addDays } from 'date-fns';
import {formatDataDate, formatDateTime} from "@/lib/utils";

interface ScheduleSelectionProps {
    handleSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection") => void,
    checkoutData: CheckoutData,
    updateCheckoutData: () => void,
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    >;
}

// Create the functional component
export const TimeSelection: React.FC<ScheduleSelectionProps> = ({availability, handleSchedulerView, checkoutData, updateCheckoutData }) => {
    const [date, setDate] = useState<Date>(new Date(checkoutData.selectedTime?.date as string) || addDays(new Date(), 1));

    const handleSetDate = (date: Date) => {
        setDate(date);
        localStorage.setItem("selectedTime", "");
        updateCheckoutData();
    }

    return (
        <div className={"grid w-full max-w-lg gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
            <div
                className={`flex flex-row justify-between items-center`}>
                <Button
                    className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                    onClick={() => handleSchedulerView("scheduler")}
                >
                    <IconArrow className={"w-8 h-8 cursor-pointer"}/>
                </Button>
                <p className={"text-xl"}>Time Selection</p>
                <div className="w-8 h-8 flex"></div>
            </div>
            <hr className={"my-1"}></hr>
            <CarouselDate
                availability={availability}
                setDate={handleSetDate}
                date={date}
            />
            { availability[formatDataDate(date)] ? (
                    <TimePickerScrollArea
                        fromTime={availability[formatDataDate(date)].from as string}
                        toTime={availability[formatDataDate(date)].to as string}
                        date={date}
                        updateCheckoutData={updateCheckoutData}
                        checkoutKey={checkoutData.selectedTime?.time as string}
                        handleSchedulerView={handleSchedulerView}
                    />
                ) : (
                    <p className={"ml-1 font-medium"}>No availability for {date.toDateString()}</p>
                )
            }
        </div>
    );
};


interface TimePickerScrollAreaProps {
    fromTime: string;
    toTime: string;
    date: Date;
    updateCheckoutData: () => void;
    checkoutKey: string | undefined;
    handleSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection") => void,
}

const TimePickerScrollArea: React.FC<TimePickerScrollAreaProps> = ({
                                                                       fromTime,
                                                                       toTime,
                                                                       date,
                                                                       updateCheckoutData,
                                                                       checkoutKey,
                                                                       handleSchedulerView
                                                                   }) => {
    const fromIndex = sortedTimeKeys.indexOf(fromTime);
    const toIndex = sortedTimeKeys.indexOf(toTime);

    // **Unconditional Hook Call**
    const [selectedKey, setSelectedKey] = useState<string | undefined>(checkoutKey);

    // **Conditional Early Return After Hooks**
    if (fromIndex === -1 || toIndex === -1 || fromIndex > toIndex) {
        return (
            <div className={"font-medium"}>
                Invalid time range selected. Contact support at support@thebakerz.com
            </div>
        );
    }

    const selectedKeys = sortedTimeKeys.slice(fromIndex, toIndex);


    const handleSelect = (key: string) => {
        setSelectedKey(key);
        localStorage.setItem("selectedTime", JSON.stringify({ date: formatDataDate(date), time: key }));
        updateCheckoutData();
        handleSchedulerView("scheduler");
    };

    return (
        <>
            <h3 className={"font-medium"}>Select a time for {date.toDateString()}</h3>
            <ScrollArea className="h-72">
                {selectedKeys.map((key) => (
                    <React.Fragment key={key}>
                        <div
                            className="flex items-center justify-between text-base font-medium my-2 cursor-pointer hover:bg-gray-200 mr-4 p-2 rounded"
                            onClick={() => handleSelect(key)}
                        >
                            <div className="ml-2">
                                {`${formatDateTime(timeMap[key].from)} - ${formatDateTime(timeMap[key].to)}`}
                            </div>
                            <Radio
                                checked={selectedKey === key}
                                onChange={() => handleSelect(key)}
                            />
                        </div>
                        <hr/>
                    </React.Fragment>
                ))}
            </ScrollArea>
        </>
    );
};