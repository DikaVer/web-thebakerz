// src/components/scheduler/CarouselComponent.tsx

import React, {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Calendar as CalendarIcon } from "lucide-react";
import {cn, formatDataDate} from "@/lib/utils";
import { addDays } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {timeMap} from "@/lib/local-variables";

interface CarouselComponentProps {
    date: Date;
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    >;
    setDate: (date: Date) => void;
}

const getAvailabilityClassNames = (date: Date, availability: Record<string, any>) => {
    const formattedDate = formatDataDate(date);
    const availabilityStatus = availability[formattedDate]?.availability;


    switch (availabilityStatus) {
        case "Free":
            return {
                bgClass: "bg-greenBakerz/40",
                textClass: "text-greenBakerz",
                status: "Open"
            };
        case "Busy":
            return {
                bgClass: "bg-orangeBakerz/40",
                textClass: "text-orangeBakerz",
                status: "Limited"
            };
        default:
            return {
                bgClass: "bg-redBakerz/40",
                textClass: "text-redBakerz",
                status: "Closed"
            };
    }
};

export const CarouselDate: React.FC<CarouselComponentProps> = ({date, availability, setDate }) => {
    const [calendarDate, setCalendarDate] = useState<Date>();

    let { bgClass, textClass, status } = getAvailabilityClassNames(date, availability);

    useEffect(() => {
        const { bgClass: newBgClass, textClass: newTextClass, status: newStatus } = getAvailabilityClassNames(date, availability);
        bgClass = newBgClass;
        textClass = newTextClass;
        status = newStatus;
    }, [calendarDate]);



    const today = new Date();

    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-auto mx-12 my-1"
        >
            <CarouselContent>
                {Array.from({ length: 3 }).map((_, index) => {
                    const currentDate = addDays(today, index + 1);
                    const { bgClass, textClass, status } = getAvailabilityClassNames(currentDate, availability);

                    return (
                        <CarouselItem key={index} className="basis-1/2 w-10 tm:w-14-5">
                            <div className="h-18 m-0.5">
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "justify-start text-left font-normal",
                                        currentDate.getDate() !== date.getDate() && "text-muted-foreground",
                                        "border-1 border-black h-full w-full rounded-xl p-2"
                                    )}
                                    onClick={() => setDate(currentDate)}
                                >
                                    <div className={"flex flex-row justify-between items-end w-full"}>
                                        <div className={"flex flex-col items-baseline"}>
                                            <div className={"flex flex-col items-start tm:flex-row tm:items-center space-x-1.5"}>
                                                <span className={'font-bold text-lg'}>{format(currentDate, "EEE")}</span>
                                                <div className={`flex items-center h-5 w-full rounded-3xl p-2 ${bgClass}`}>
                                                    <p className={`font-medium ${textClass}`}>
                                                        {status}
                                                    </p>
                                                </div>
                                            </div>
                                            <span>{format(currentDate, "dd MMM")}</span>
                                        </div>
                                    </div>
                                </Button>
                            </div>
                        </CarouselItem>
                    );
                })}
                <CarouselItem className="basis-1/2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="h-18 m-0.5">
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        " justify-start text-left font-normal",
                                        calendarDate?.getDate() !== date.getDate() && "text-muted-foreground",
                                        "border-1 border-black w-full h-full rounded-xl p-2"
                                    )}
                                >
                                    <div className={"flex flex-row justify-between items-end w-full"}>
                                        <div className={"flex flex-col items-baseline"}>
                                            <div
                                                className={"flex flex-col items-start tm:flex-row tm:items-center space-x-1.5"}>
                                                <span
                                                    className={'font-bold text-lg'}>{calendarDate ? format(calendarDate, "EEE") : "Select"}</span>

                                                {calendarDate &&
                                                    <div
                                                        className={`flex items-center h-5 w-full rounded-3xl p-2 ${bgClass}`}>
                                                        <p className={`font-medium ${textClass}`}>
                                                            {status}
                                                        </p>
                                                    </div>
                                                }
                                            </div>
                                            <span>{calendarDate ? format(calendarDate, "dd MMM") : "Day"}</span>
                                        </div>
                                        <CalendarIcon className="mr-2 h-5 w-5"/>
                                    </div>
                                </Button>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                addDaysParam={3}
                                availabilityData={availability}
                                mode="single"
                                className={"border-1 rounded-lg"}
                                userView={true}
                                onSelectCustom={(date) => {
                                    setCalendarDate(date);
                                    date && setDate(date);
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
};