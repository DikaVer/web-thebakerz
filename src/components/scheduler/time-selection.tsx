// Define the interface for the props
import React from "react";
import {IconArrow} from "@/components/ui/icons";
import {Button} from "@/components/ui/button";
import { ScrollArea } from '@/components/ui/scroll-area';
import {CarouselDate} from "@/components/scheduler/carousel-date";
import {AddressDataStorageField} from "@/lib/definitions";

interface ScheduleSelectionProps {
    handleSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection") => void,
    checkoutData: AddressDataStorageField,
    updateCheckoutData: () => void
}

// Create the functional component
export const TimeSelection: React.FC<ScheduleSelectionProps> = ({ handleSchedulerView, checkoutData, updateCheckoutData }) => {
    const [date, setDate] = React.useState<Date>()

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
            <CarouselDate date={date} setDate={setDate}/>
            <TimePickerScrollArea fromTime="08:00" toTime="20:00" stepInterval={15}/>
            <Button className="rounded-lg h-14 text-lg">Schedule</Button>
        </div>
    );
};

interface TimePickerScrollAreaProps {
    fromTime?: string;
    toTime?: string;
    stepInterval?: number;
}

function convertTo24Hour(time: string): number {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
        hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
        hours = 0;
    }

    return hours * 60 + minutes;
}

function formatToAmPm(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
}

const defaultStart = 0; // Start of the day in minutes (0:00)
const defaultEnd = 1440; // End of the day in minutes (24:00)

const generateTimeSlots = (start = defaultStart, end = defaultEnd, stepInterval = 15) => {
    const slots = [];
    for (let minute = start; minute < end; minute += stepInterval) {
        const endMinute = minute + 30; // 30-minute range
        if (endMinute <= end) {
            slots.push(`${formatToAmPm(minute)} - ${formatToAmPm(endMinute)}`);
        }
    }
    return slots;
};

export function TimePickerScrollArea({ fromTime, toTime, stepInterval } : TimePickerScrollAreaProps) {
    const startTime = fromTime ? convertTo24Hour(fromTime) : defaultStart;
    const endTime = toTime ? convertTo24Hour(toTime) : defaultEnd;
    const timeSlots = generateTimeSlots(startTime, endTime);

    return (
        <ScrollArea className="h-72">
            {timeSlots.map((time, index) => (
                <React.Fragment key={index}>
                    <div className="text-base my-4">{time}</div>
                    <hr className="my-2" />
                </React.Fragment>
            ))}
        </ScrollArea>
    );
}