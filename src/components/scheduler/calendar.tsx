'use client';

import { useState} from "react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { IconChevronDown } from "@/components/ui/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";
import { SchedulerContent } from "@/components/scheduler/scheduler";
import useIsSmallScreen from "@/lib/hooks/use-is-small-screen";

export function MiniCalendar() {
    const isSmallScreen = useIsSmallScreen(460);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="absolute top-2 right-2 w-full h-12 cm:h-16 flex flex-row-reverse">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <div className="rounded-2xl bg-white px-1.5 opacity-80 h-12 w-full cm:w-128 cm:h-16 flex items-center justify-between ml-4">
                        <TooltipProvider>
                            <Date day="MON" date={11} status="Free" bgColor="border-greenBakerz hover:bg-greenBakerz" />
                            <Date day="TUE" date={12} status="Busy" bgColor="border-orangeBakerz hover:bg-orangeBakerz" />
                            <Date day="WED" date={13} status="Closed" bgColor="border-redBakerz hover:bg-redBakerz" />
                            <Date day="THU" date={14} status="Free" bgColor="border-greenBakerz hover:bg-greenBakerz" />
                            {!isSmallScreen && <Date day="FRI" date={15} status="Busy" bgColor="border-orangeBakerz hover:bg-orangeBakerz" />}
                        </TooltipProvider>
                        <div className="rounded-xl w-auto h-10 cm:h-14 items-center transition duration-500 hover:bg-gray-200 cursor-default">
                            <p className="text-sm cm:text-base pl-2 text-black">Delivery now</p>
                            <div className="flex pl-2">
                                <p className="text-sm cm:text-base text-black font-bold">Maastricht</p>
                                <IconChevronDown className={`w-5 h-5 cm:w-6 cm:h-6`} />
                            </div>
                        </div>
                    </div>
                </DialogTrigger>
                <SchedulerContent
                    setIsDialogOpen={setIsDialogOpen}
                />
            </Dialog>
        </div>
    );
}

const Date = ({ day, date, status, bgColor }: { day: string, date: number, status: string, bgColor: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <div
                className={`rounded-xl w-10 h-10 cm:w-12 cm:h-12 border-3 -space-y-1 flex flex-col items-center justify-center ${bgColor} trigger-hover transition duration-700 cursor-default`}>
                <p className="text-black text-on-hover-white text-xs cm:text-sm">{day}</p>
                <p className="text-black text-on-hover-white text-base cm:text-xl">{date}</p>
            </div>
        </TooltipTrigger>
        <TooltipContent>
            <p>{status}</p>
        </TooltipContent>
    </Tooltip>
);