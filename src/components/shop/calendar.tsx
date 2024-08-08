import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IconChevronDown } from "@/components/ui/icons";
import React from "react";

export function MiniCalendar() {
    return (
        <div className="absolute top-2 right-2 w-full h-12 cm:h-16 flex flex-row-reverse">
            <div className="rounded-2xl bg-white px-1.5 opacity-80 h-12 w-full cm:w-128 cm:h-16 flex items-center justify-between ml-4">
                <TooltipProvider>
                    <Date day="MON" date={11} status="Free" bgColor="bg-greenBakerz" />
                    <Date day="TUE" date={12} status="Busy" bgColor="bg-orangeBakerz" />
                    <Date day="WED" date={13} status="Closed" bgColor="bg-redBakerz" />
                    <Date day="THU" date={14} status="Free" bgColor="bg-greenBakerz" />
                    <Date day="FRI" date={15} status="Busy" bgColor="bg-orangeBakerz" />
                </TooltipProvider>
                <div className="rounded-xl w-auto h-10 cm:h-14 items-center transition duration-300 hover:bg-gray-200 cursor-default">
                    <p className="text-sm cm:text-base pl-2 text-black">Delivery now</p>
                    <div className="flex pl-2">
                        <p className="text-sm cm:text-base text-black font-bold">Maastricht</p>
                        <IconChevronDown />
                    </div>
                </div>
            </div>
        </div>
    );
}

const Date = ({ day, date, status, bgColor }: { day: string, date: number, status: string, bgColor: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <div className={`rounded-xl w-9 h-9 cm:w-12 cm:h-12 ${bgColor} -space-y-1 flex flex-col items-center justify-center hover:scale-110 transition duration-300 cursor-default`}>
                <p className="text-white text-xs cm:text-sm">{day}</p>
                <p className="text-white text-base cm:text-xl">{date}</p>
            </div>
        </TooltipTrigger>
        <TooltipContent>
            <p>{status}</p>
        </TooltipContent>
    </Tooltip>
);