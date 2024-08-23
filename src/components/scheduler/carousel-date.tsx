// src/components/scheduler/CarouselComponent.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface CarouselComponentProps {
    date: Date | undefined;
    setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

export const CarouselDate: React.FC<CarouselComponentProps> = ({ date, setDate }) => {
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
                                    !date && "text-muted-foreground",
                                    "border-1 border-black h-full w-full rounded-xl p-2"
                                )}
                            >
                                <div className={"flex flex-row justify-between items-end w-full"}>
                                    <div className={"flex flex-col items-baseline"}>
                                        <span className={'font-bold text-lg'}>{date ? format(date, "EEE") : "Select"}</span>
                                        <span>{date ? format(date, "dd MMM") : "Day"}</span>
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
                                        !date && "text-muted-foreground",
                                        "border-1 border-black w-full h-full rounded-xl p-2"
                                    )}
                                >
                                    <div className={"flex flex-row justify-between items-end w-full"}>
                                        <div className={"flex flex-col items-baseline"}>
                                            <span className={'font-bold text-lg'}>{date ? format(date, "EEE") : "Select"}</span>
                                            <span>{date ? format(date, "dd MMM") : "Day"}</span>
                                        </div>
                                        <CalendarIcon className="mr-2 h-5 w-5" />
                                    </div>
                                </Button>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
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