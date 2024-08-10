'use client';

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {IconChevronDown, IconClock, IconCross, IconEdit, IconLocation} from "@/components/ui/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";
import {Button} from "@/components/ui/button";
import {Search} from "@/components/shop/search";
import {BailoutToCSR} from "next/dist/shared/lib/lazy-dynamic/dynamic-bailout-to-csr";
const commands = [
    { value: 'a', label: 'a' },
];

export function MiniCalendar() {
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPickup, setIsPickup] = useState(true);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 460); // sm breakpoint
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    const togglePosition = () => {
        setIsPickup(!isPickup);
    };

    const handleAddressClick = (address: string) => {
        setSelectedAddress(address);
    };

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
                                <IconChevronDown />
                            </div>
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <div className={"flex flex-row justify-between items-center"}>
                        <Button
                            className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                            onClick={handleDialogClose}>
                            <IconCross className={"w-8 h-8 cursor-pointer"}/>
                        </Button>
                        <p className={"text-xl"}>Schedule Delivery</p>
                        <div className="w-8 h-8 flex"></div>
                    </div>
                    <hr className={"my-1"}></hr>
                    <div className={"flex flex-col justify-between items-center"}>
                        <div
                            className={"grid grid-cols-2 items-center rounded-full w-80 h-12 bg-grayBg transition duration-500 hover:bg-gray-200 cursor-pointer"}
                            onClick={togglePosition}
                        >
                            <p className="text-black text-center z-10">Pickup</p>
                            <div
                                className={`absolute z-0 grid grid-rows-1 items-center rounded-full h-9 w-39 bg-grayComp transition-transform duration-500  ${isPickup ? "translate-x-2" : "translate-x-full"}`}
                            >
                            </div>
                            <p className="text-black text-center z-10">Delivery</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center h-full">
                        <Search commands={commands} placeholder="Search for bakery items..."/>
                    </div>
                    <div>
                        <p className="text-black text-xl">Saved addresses</p>
                        <ul>
                            {['Maastricht', 'Chisinau', 'Saint-Petersburg'].map((address) => (
                                <li key={address}>
                                    <div
                                        className={`flex flex-row justify-between items-center space-x-2 pr-2 my-1 py-1 transition duration-500 cursor-pointer rounded-lg ${selectedAddress === address ? 'bg-grayBg' : 'hover:bg-grayBg'}`}
                                        onClick={() => handleAddressClick(address)}
                                    >
                                        <IconLocation className={"w-9 h-9 cm:w-9 cm:h-9 fill-secondary"}/>
                                        <div className={"flex w-full"}>
                                            <p className="text-black text-lg">{address}</p>
                                        </div>
                                        <div className={"transition duration-500 hover:scale-115"}>
                                            <IconEdit className={"w-6 h-6"}/>
                                        </div>
                                    </div>
                                    <hr></hr>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-black text-xl">Time Preferences</p>
                        <div>
                            <div
                                className="flex flex-row justify-between items-center space-x-2 my-1 py-1 transition duration-500 cursor-pointer rounded-lg">
                                <IconClock className={"w-16 h-16"}/>
                                <div className={"flex w-full"}>
                                    <p className="text-black text-lg">Schedule delivery</p>
                                </div>
                                <Button className={"text-lg h-9"}>Schedule</Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const Date = ({day, date, status, bgColor}: { day: string, date: number, status: string, bgColor: string }) => (
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