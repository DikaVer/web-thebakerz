// Define the interface for the props
import React from "react";
import {IconArrow} from "@/components/ui/icons";
import {Button} from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface ScheduleSelectionProps {
    handleScheduler: () => void;
}

// Create the functional component
export const ScheduleSelection: React.FC<ScheduleSelectionProps> = ({ handleScheduler }) => {
    const [date, setDate] = React.useState<Date>()

    return (
        <div className={"grid w-full max-w-lg gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%]"}>
            <div
                className={`flex flex-row justify-between items-center`}>
                <Button
                    className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                    onClick={handleScheduler}>
                    <IconArrow className={"w-8 h-8 cursor-pointer"}/>
                </Button>
                <p className={"text-xl"}>Schedule Delivery</p>
                <div className="w-8 h-8 flex"></div>
            </div>
            <hr className={"my-1"}></hr>
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-auto mx-12 my-2"
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
                                                <span
                                                    className={'font-bold text-lg'}>{date ? format(date, "EEE") : "Select"}</span>
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
                                                <span
                                                    className={'font-bold text-lg'}>{date ? format(date, "EEE") : "Select"}</span>
                                                <span>{date ? format(date, "dd MMM") : "Day"}</span>
                                            </div>
                                            <CalendarIcon className="mr-2 h-5 w-5"/>
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
                <CarouselPrevious/>
                <CarouselNext/>
            </Carousel>

            <div className={"flex flex-col justify-between items-center"}>
                <Button
                    className={"w-64 h-12 rounded-xl bg-black text-white font-bold text-lg"}
                    onClick={handleScheduler}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};