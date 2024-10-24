// src/components/scheduler/CarouselComponent.tsx

import React, {useState} from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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

export const CarouselDate: React.FC<CarouselComponentProps> = ({date, availability, setDate }) => {
    const [calendarDate, setCalendarDate] = useState<Date>();

    const today = new Date();

    return (
        <Carousel
            opts={{
                align: "start",
            }}
            className="w-auto mx-12 my-1"
        >
            <CarouselContent>
                {Array.from({ length: 3 }).map((_, index) => (
                    <CarouselItem key={index} className="basis-1/2 w-14">
                        <div className="h-18 m-0.5">
                            <Button
                                variant={"outline"}
                                className={cn(
                                    " justify-start text-left font-normal",
                                    addDays(today, index+1).getDate() !== date.getDate() && "text-muted-foreground",
                                    "border-1 border-black h-full w-full rounded-xl p-2"
                                )}
                                onClick={() => setDate(addDays(today, index+1))}
                            >
                                <div className={"flex flex-row justify-between items-end w-full"}>
                                    <div className={"flex flex-col items-baseline"}>
                                        <span className={'font-bold text-lg'}>{format(addDays(today, index+1), "EEE")}</span>
                                        <span>{format(addDays(today, index+1), "dd MMM")}</span>
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </CarouselItem>
                ))}
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
                                            <span className={'font-bold text-lg'}>{calendarDate ? format(calendarDate, "EEE") : "Select"}</span>
                                            <span>{calendarDate ? format(calendarDate, "dd MMM") : "Day"}</span>
                                        </div>
                                        <CalendarIcon className="mr-2 h-5 w-5" />
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
                                onSelect={(date) => {
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