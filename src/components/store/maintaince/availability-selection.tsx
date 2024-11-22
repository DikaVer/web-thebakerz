import React, {useEffect, useState} from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {cn, formatDataDate, formatDateTime} from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { eachDayOfInterval, format, getDay } from 'date-fns';
import {Separator} from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {timeMap} from "@/lib/local-variables";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {FormError} from "@/components/authentication/form-error";
import {FormSuccess} from "@/components/authentication/form-success";

export function AvailabilitySelection(
    {
        setAvailabilityData,
        availabilityData
    }:
        {
            setAvailabilityData: (value: Record<
                string,
                {
                    from: keyof typeof timeMap;
                    to: keyof typeof timeMap;
                    availability: "Free" | "Busy";
                }
            >) => void;
            availabilityData: Record<
                string,
                {
                    from: keyof typeof timeMap;
                    to: keyof typeof timeMap;
                    availability: "Free" | "Busy";
                }
            >;
        }) {
    const today = new Date();
    today.setDate(today.getDate() + 1);

    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();

    const [fromPopoverOpen, setFromPopoverOpen] = useState(false);
    const [toPopoverOpen, setToPopoverOpen] = useState(false);

    const [times, setTimes] = useState<Record<string, { fromTime: string | undefined; toTime: string | undefined; availability: "Free" | "Busy" | "Closed" }>>({
        Monday: { fromTime: undefined, toTime: undefined, availability: "Free" },
        Tuesday: { fromTime: undefined, toTime: undefined, availability: "Free" },
        Wednesday: { fromTime: undefined, toTime: undefined, availability: "Free" },
        Thursday: { fromTime: undefined, toTime: undefined, availability: "Free" },
        Friday: { fromTime: undefined, toTime: undefined, availability: "Free" },
        Saturday: { fromTime: undefined, toTime: undefined, availability: "Free" },
        Sunday: { fromTime: undefined, toTime: undefined, availability: "Free" },
    });

    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

    const setFromTime = (day: string, value: string | undefined) => {
        setTimes(prev => ({ ...prev, [day]: { ...prev[day], fromTime: value } }));
    };

    const setToTime = (day: string, value: string | undefined) => {
        setTimes(prev => ({ ...prev, [day]: { ...prev[day], toTime: value } }));
    };

    const setAvailability = (day: string, value: "Free" | "Busy" | "Closed") => {
        setTimes(prev => ({ ...prev, [day]: { ...prev[day], availability: value } }));
    };

    useEffect(() => {
        setFromPopoverOpen(false);
        if (fromDate && toDate && fromDate > toDate) {
            setToDate(undefined);
        }
    }, [fromDate]);

    useEffect(() => {
        setToPopoverOpen(false);
    }, [toDate]);

    const getWeekDaysInRange = (startDate: Date, endDate: Date) => {
        const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
        const weekDays = new Set<string>();

        daysInRange.forEach(date => {
            const dayOfWeek = format(date, 'EEEE'); // Get the day of the week (e.g., Monday)
            weekDays.add(dayOfWeek);
        });

        const weekDaysArray = Array.from(weekDays);
        const orderedWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        // Sort the weekDaysArray based on the order in orderedWeekDays
        weekDaysArray.sort((a, b) => orderedWeekDays.indexOf(a) - orderedWeekDays.indexOf(b));

        return weekDaysArray;
    };


    const weekDaysInRange = fromDate && toDate ? getWeekDaysInRange(fromDate, toDate) : [];

    const handleApply = () => {
        if (!fromDate || !toDate){
            setSuccess(undefined);
            setError("Please select both from and to dates");
            return;
        }

        const updatedAvailabilityData = { ...availabilityData };
        const daysInRange = eachDayOfInterval({ start: fromDate, end: toDate });
        let flag = false;
        daysInRange.forEach(date => {
            const dayOfWeek = format(date, 'EEEE'); // Get the day of the week (e.g., Monday)
            if (times[dayOfWeek]) {
                const { fromTime, toTime, availability } = times[dayOfWeek];
                if (fromTime && toTime && availability !== "Closed") {
                    updatedAvailabilityData[formatDataDate(date)] = {
                        from: fromTime,
                        to: toTime,
                        availability: availability,
                    };
                } else if (availability !== "Closed" && (!fromTime || !toTime)) {
                    flag = true;
                    return;
                }
            }
        });
        if (flag) {
            setSuccess(undefined);
            setError("Please select both from and to times for the days you are available");
            return;
        }
        setError(undefined);
        setSuccess("Availability updated successfully, check your calendar above");
        setAvailabilityData(updatedAvailabilityData);
        setIsAlertDialogOpen(false);
    };

    return (
        <>
            <div className={"flex flex-row gap-x-2 items-center text-sm"}>
                <span className={'w-fit'}>From Date:</span>
                <Popover open={fromPopoverOpen} onOpenChange={setFromPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !fromDate && "text-muted-foreground"
                            )}
                        >
                            {fromDate ? (
                                format(fromDate, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            onSelect={setFromDate}
                            fromDate={today}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className={"flex flex-row gap-x-7 items-center text-sm mt-4"}>
                <span className={'w-fit'}>To Date:</span>
                <Popover open={toPopoverOpen} onOpenChange={setToPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !toDate && "text-muted-foreground"
                            )}
                        >
                            {toDate ? (
                                format(toDate, "PPP")
                            ) : (
                                "Pick a date"
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            onSelect={setToDate}
                            fromDate={fromDate || today}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <Separator className={"my-4"}/>
            <div className="flex flex-col items-center gap-y-4 text-sm">
                {weekDaysInRange.map(day => (
                    <React.Fragment key={day}>
                        <DaySelection
                            day={day}
                            fromTime={times[day].fromTime}
                            toTime={times[day].toTime}
                            setFromTime={value => setFromTime(day, value)}
                            setToTime={value => setToTime(day, value)}
                            availability={times[day].availability}
                            setAvailability={value => setAvailability(day, value)}
                        />
                        <Separator/>
                    </React.Fragment>
                ))}
            </div>
            <FormError message={error}/>
            <FormSuccess message={success}/>
            <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                <AlertDialogTrigger asChild>
                    {weekDaysInRange.length > 0 && (
                        <Button
                            variant={"secondary"}
                            className={"w-full mt-4"}
                            onClick={(event) => {
                                event.preventDefault();
                                setIsAlertDialogOpen(true);
                            }}
                        >
                            Adjust Availability
                        </Button>
                    )}
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={"text-center"}>Availability Details</AlertDialogTitle>
                        <AlertDialogDescription className={"hidden"}>
                            Update your availability details below
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                        <div className={"space-y-2 text-sm text-muted-foreground"}>
                                <p><strong>From Date:</strong> {fromDate ? format(fromDate, "PPP") : "Not selected"}</p>
                                <p><strong>To Date:</strong> {toDate ? format(toDate, "PPP") : "Not selected"}</p>
                                <p><strong>Times:</strong></p>
                                <Separator />
                                <ul className={'space-y-2'}>
                                    {Object.keys(times).map(day => (
                                        <li key={day} className={'space-y-2'}>
                                            {(times[day].fromTime || times[day].toTime) && (
                                                <>
                                                    <strong>{day}: </strong>
                                                    {times[day].availability === "Closed" ? "" :
                                                        `${times[day].fromTime && times[day].toTime ?
                                                            `${formatDateTime(timeMap[times[day].fromTime].from)} - ${formatDateTime(timeMap[times[day].toTime].from)}`
                                                            : ""}`
                                                    } ({times[day].availability})
                                                    <Separator />
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                        </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsAlertDialogOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApply}>Apply</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

interface DaySelectionProps {
    day: string;
    fromTime: string | undefined;
    toTime: string | undefined;
    setFromTime: (value: string | undefined) => void;
    setToTime: (value: string | undefined) => void;
    availability: string;
    setAvailability: (value: "Free" | "Busy") => void;
}

export const DaySelection: React.FC<DaySelectionProps> = ({ day, fromTime, toTime, setFromTime, setToTime, availability, setAvailability }) => {


    useEffect(() => {
        const validateTime = () => {
            if (fromTime && toTime) {
                if (timeMap[fromTime].from > timeMap[toTime].from) {
                    setToTime(undefined);
                }
            }
        };
        validateTime();
    }, [fromTime, toTime]);

    return (
        <div className={"flex flex-row justify-between items-center w-full"}>
            <p className={"w-20"}>{day}</p>
            <Select key={fromTime} value={fromTime} onValueChange={setFromTime} disabled={availability === "Closed"}>
                <SelectTrigger className="w-28 px-2">
                    <SelectValue placeholder="From" />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(timeMap).map(key => (
                        <SelectItem key={key} value={key}>
                            {formatDateTime(timeMap[key].from)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select key={toTime} value={toTime} onValueChange={setToTime} disabled={availability === "Closed"}>
                <SelectTrigger className="w-28 px-2">
                    <SelectValue placeholder="To" />
                </SelectTrigger>
                <SelectContent>
                    {Object.keys(timeMap)
                        .filter(key => (fromTime ? timeMap[key].from > timeMap[fromTime].from : true))
                        .map(key => (
                            <SelectItem key={key} value={key}>
                                {formatDateTime(timeMap[key].from)}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
            <RadioGroup value={availability} onValueChange={setAvailability}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Free" id={`${day}-r1`} />
                    <Label htmlFor={`${day}-r1`}>Free</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Busy" id={`${day}-r2`} />
                    <Label htmlFor={`${day}-r2`}>Busy</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Closed" id={`${day}-r3`} />
                    <Label htmlFor={`${day}-r3`}>Closed</Label>
                </div>
            </RadioGroup>
        </div>
    );
};