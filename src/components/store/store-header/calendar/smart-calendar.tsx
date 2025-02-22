// smart-calendar.tsx
'use client';

import React from 'react';
import { CalendarDate, CalendarDateTime, today } from "@internationalized/date";
import { cn } from '@/lib/utils';
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Button, Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Icon } from "@iconify/react";
import {WorkHours} from "@/lib/actions/calendar-actions";

// Define props to include schedule and minValue
interface SmartDatetimeInputProps {
    value: CalendarDateTime | CalendarDate | undefined;
    onValueChange: (date: CalendarDate | CalendarDateTime) => void;
    placeholder?: string;
    schedule: WorkHours | undefined;
    minValue: CalendarDate | CalendarDateTime;
    showCalendar?: boolean;
    showTimePicker?: boolean;
    isError?: boolean;
}

interface SmartDatetimeInputContextProps extends SmartDatetimeInputProps {
    Time: string;
    onTimeChange: (time: string) => void;
}

const SmartDatetimeInputContext = React.createContext<SmartDatetimeInputContextProps | null>(null);

const formatDate = (date: CalendarDate | CalendarDateTime) => {
    if (date instanceof CalendarDateTime)
        return `${date.year}-${date.month}-${date.day} ${date.hour}:${date.minute === 0 ? "00" : date.minute}`;
    else
        return `${date.year}-${date.month}-${date.day}`;
}

const useSmartDateInput = () => {
    const context = React.useContext(SmartDatetimeInputContext);
    if (!context) {
        throw new Error("useSmartDateInput must be used within SmartDatetimeInputProvider");
    }
    return context;
};

export const SmartDatetimeInput = React.forwardRef<
    HTMLInputElement,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "ref" | "value" | "defaultValue" | "onBlur"> &
    SmartDatetimeInputProps
>(
    (
        {
            className,
            value,
            onValueChange,
            placeholder,
            schedule,
            minValue,
            isError = false,
        },
        ref
    ) => {
        const [Time, setTime] = React.useState<string>("");

        const onTimeChange = React.useCallback((time: string) => {
            setTime(time);
        }, []);


        const minDate =
            "year" in minValue && "month" in minValue && "day" in minValue
                ? new CalendarDate(minValue.year, minValue.month, minValue.day)
                : minValue;


        return (
            <SmartDatetimeInputContext.Provider
                value={{
                    isError,
                    value,
                    onValueChange,
                    Time,
                    onTimeChange,
                    schedule,
                    minValue: minDate,
                    showTimePicker: true,
                    showCalendar: true,
                }}
            >
                <DateTimeLocalInput placeholder={placeholder} className={className} />
            </SmartDatetimeInputContext.Provider>
        );
    }
);

SmartDatetimeInput.displayName = "SmartDatetimeInput";

// --- Helper: mapping weekdays to your schedule keys ---
const weekdayMapping = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];

// --- Date/Time Input Component ---
type DateTimeLocalInputProps = {
    placeholder?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const DateTimeLocalInput = ({ className, ...props }: DateTimeLocalInputProps) => {
    const { value, onValueChange, schedule, minValue, showCalendar, showTimePicker, isError } =
        useSmartDateInput();

    // Disable dates if the corresponding weekday in the schedule is missing or disabled
    const isDateUnavailable = (date: CalendarDate) => {
        if (!schedule) return true;

        const jsDate = new Date(date.year, date.month - 1, date.day);
        const weekday = jsDate.getDay(); // 0 (Sun) to 6 (Sat)
        const dayKey = weekdayMapping[weekday];
        const workDay = schedule[dayKey as keyof WorkHours];
        return !workDay || !workDay.isEnabled;
    };

    // When a date is selected, preserve the existing time (if any) or default to midnight
    const handleCalendarChange = (selectedDate: CalendarDate) => {
        // If the selected date is the same as the current date, do nothing.
        if (
            value &&
            selectedDate.year === value.year &&
            selectedDate.month === value.month &&
            selectedDate.day === value.day
        ) {
            return;
        }
        let newDateTime: CalendarDate;
        if (showTimePicker && value) {
            newDateTime = new CalendarDate(
                selectedDate.year,
                selectedDate.month,
                selectedDate.day
            );
        } else {
            newDateTime = new CalendarDate(selectedDate.year, selectedDate.month, selectedDate.day);
        }

        onValueChange(newDateTime);
    };


    return (
        <Popover
            placement={'top'}
        >
            <PopoverTrigger>
                <Button
                    color={isError ? "danger" : "default"}
                    variant="bordered"
                    size="lg"
                    endContent={<Icon icon="solar:calendar-broken" width={24} className="text-default-500" />}
                    className={`h-12 ${className || ""} ${value ? "underline underline-offset-2 text-text font-medium text-default-500" : "text-default-500"}`}
                >
                    <span className="sr-only">calendar</span>
                    <p className="">{value ? formatDate(value) : props.placeholder}</p>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background">
                <div className="flex flex-row gap-1">
                    {showCalendar && (
                        <Calendar
                            id="calendar"
                            className={cn("peer flex justify-end", className)}
                            value={value}
                            //@ts-ignore
                            minValue={minValue}
                            //@ts-ignore
                            isDateUnavailable={isDateUnavailable}
                            onChange={(selectedDate) => handleCalendarChange(selectedDate)}
                            initialFocus
                        />
                    )}
                    {(showTimePicker && value) && <TimePicker />}
                </div>
            </PopoverContent>
        </Popover>
    );
};

// --- TimePicker Component ---
const useTimeSlots = (timestamp: number = 15) => {
    return React.useMemo(() => {
        const slots: { hour: number; minutes: number; label: string }[] = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let part = 0; part < 4; part++) {
                const minutes = part === 0 ? 0 : timestamp * part;
                slots.push({
                    hour,
                    minutes,
                    label: `${hour}:${minutes < 10 ? "0" + minutes : minutes}`,
                });
            }
        }
        return slots;
    }, [timestamp]);
};

const TimePicker = () => {
    const { value, onValueChange, onTimeChange, schedule } = useSmartDateInput();
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const timestamp = 15; // 15-minute intervals

    // Generate candidate time slots (optimized)
    const slots = useTimeSlots(timestamp);

    // Determine allowed time range based on the schedule for the selected day.
    const allowedRange = React.useMemo(() => {
        if (!value) return null;
        if (!schedule) {
            return null;
        }
        const jsDate = new Date(value.year, value.month - 1, value.day);
        const weekday = jsDate.getDay();
        const dayKey = weekdayMapping[weekday];
        const workDay = schedule[dayKey as keyof WorkHours];
        if (workDay && workDay.isEnabled) {
            return {
                startHour: workDay.start.hour,
                startMinute: workDay.start.minute,
                endHour: workDay.end.hour,
                endMinute: workDay.end.minute,
            };
        }
        return null;
    }, [value, schedule]);

    // Helper to check if a slot is within allowed range.
    const isWithinRange = (hour: number, minute: number) => {
        if (!allowedRange) return true;
        const slotTime = hour * 60 + minute;
        const startTime = allowedRange.startHour * 60 + allowedRange.startMinute;
        const endTime = allowedRange.endHour * 60 + allowedRange.endMinute;
        return slotTime >= startTime && slotTime <= endTime;
    };


    // Build a new CalendarDateTime from the current date and selected time.
    const formatSelectedTime = React.useCallback(
        (hour: number, minutes: number) => {
            const currentYear = value?.year || today("Europe/Amsterdam").year;
            const currentMonth = value?.month || today("Europe/Amsterdam").month;
            const currentDay = value?.day || today("Europe/Amsterdam").day;
            const newDateTime = new CalendarDateTime(
                currentYear,
                currentMonth,
                currentDay,
                hour,
                minutes
            );
            onTimeChange(`${hour}:${minutes < 10 ? "0" + minutes : minutes}`);
            onValueChange(newDateTime);
        },
        [value, onValueChange, onTimeChange]
    );

    const handleClick = React.useCallback(
        (hour: number, minutes: number, index: number) => {
            formatSelectedTime(hour, minutes);
            setActiveIndex(index);
        },
        [formatSelectedTime]
    );

    return (
        <div className="space-y-2 pr-3 py-3 relative">
            <h3 className="text-sm text-default-500 font-medium text-center">Time</h3>
            <ScrollShadow size={20} className="h-[90%] w-full">
                <ul className={cn("flex items-center flex-col gap-1 h-full max-h-56 w-28 px-1 py-0.5")}>
                    {slots.map((slot, index) => {
                        if (!isWithinRange(slot.hour, slot.minutes)) return null;
                        // Use formatted candidate time.
                        const candidateTime = slot.label;

                        let isSelected = false;
                        if(value instanceof CalendarDateTime) {
                            isSelected = value && value.hour === slot.hour && value.minute === slot.minutes;
                        }

                        return (
                            <li
                                tabIndex={isSelected ? 0 : -1}
                                id={`time-${index}`}
                                key={`time-${index}`}
                                className={cn(
                                    buttonVariants({
                                        variant: isSelected ? "default" : "outline",
                                    }),
                                    "h-8 px-3 w-full text-sm cursor-default"
                                )}
                                onClick={() => handleClick(slot.hour, slot.minutes, index)}
                            >
                                {candidateTime}
                            </li>
                        );
                    })}
                </ul>
            </ScrollShadow>
        </div>
    );
};


