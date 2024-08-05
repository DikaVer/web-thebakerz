'use client'
import React from "react";
import Image from 'next/image';
import {
    IconStar,
    IconLocation,
    IconThreeDots,
    IconChevronDown,
} from '@/components/ui/icons';
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

interface ICommandProps {
    commands: { value: string; label: string }[];
}
export default function Page({ commands }: ICommandProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const handleValueChange = (value: string) => {
        setInputValue(value);
        setOpen(!!value);
    };

    const filteredCommands = Array.isArray(commands)
        ? commands.filter((command) =>
            command.label.toLowerCase().includes(inputValue.toLowerCase())
        )
        : [];
    console.log("filteredCommands", filteredCommands);
    return (
        <div>
            <div className="relative h-72 rounded-2xl overflow-hidden flex flex-col justify-center">
                <Image
                    src="/background_test.jpg" // Adjust this path to your actual image location
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center"
                    alt="Background"
                    className="opacity-30"
                />
                    <div className="ml-4 mt-8 absolute hover:scale-110 transition duration-300 cursor-pointer">
                        <div className="relative h-32 w-32">
                            <Image
                                src="/avatar_test.jpg"
                                layout="fill"
                                objectFit="cover"
                                objectPosition="center"
                                alt="Avatar"
                                className="rounded-full"
                            />
                        </div>
                        <p className="mt-2 underline font-light text-gray-600 text-center">about me</p>
                    </div>
                    <div className="ml-40 mt-12 absolute space-y-2">

                        <Label className="text-2xl font-bold text-black">Mrs. Bombochka</Label>

                        <Label className="flex items-center space-x-2 hover:scale-110 transition duration-300">
                            <IconStar/>
                            <p className="text-xl text-black">5.0</p>
                            <p className="underline font-light text-gray-600">260 reviews</p>
                        </Label>

                        <Label className={"flex items-center space-x-2 hover:scale-110 transition duration-300"}>

                            <IconLocation/>
                            <p className="text-xl text-black">Maastricht</p>
                        </Label>

                        <div className="flex pt-2 space-x-3">
                            <Button className={"text-xl"}>Build your own cake</Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className={"bg-white px-1.5 opacity-80"} variant="outline">
                                        <IconThreeDots/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Billing</DropdownMenuItem>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                <div
                    className="absolute top-2 right-2 rounded-2xl bg-white px-1.5 opacity-80 w-128 h-16 flex items-center justify-between">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="rounded-xl w-12 h-12 bg-greenBakerz -space-y-1 flex flex-col items-center justify-center hover:scale-110 transition duration-300 cursor-pointer">
                                    <p className="text-white text-sm">MON</p>
                                    <p className="text-white text-xl">11</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Free</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="rounded-xl w-12 h-12 bg-orangeBakerz -space-y-1 flex flex-col items-center justify-center hover:scale-110 transition duration-300 cursor-pointer">
                                    <p className="text-white text-sm">TUE</p>
                                    <p className="text-white text-xl">12</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Busy</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="rounded-xl w-12 h-12 bg-redBakerz -space-y-1 flex flex-col items-center justify-center hover:scale-110 transition duration-300 cursor-pointer">
                                    <p className="text-white text-sm">WED</p>
                                    <p className="text-white text-xl">13</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Closed</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="rounded-xl w-12 h-12 bg-greenBakerz -space-y-1 flex flex-col items-center justify-center hover:scale-110 transition duration-300 cursor-pointer">
                                    <p className="text-white text-sm">THU</p>
                                    <p className="text-white text-xl">14</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Free</p>
                            </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="rounded-xl w-12 h-12 bg-orangeBakerz -space-y-1 flex flex-col items-center justify-center hover:scale-110 transition duration-300 cursor-pointer">
                                    <p className="text-white text-sm">FRI</p>
                                    <p className="text-white text-xl">15</p>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Busy</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <div className="rounded-xl w-auto h-14 items-center transition duration-300 hover:bg-gray-200 cursor-pointer">
                        <p className="pl-2 text-black">Delivery now</p>
                        <div className={"flex pl-2"}>
                            <p className="text-black font-bold">Maastricht</p>
                            <IconChevronDown/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center h-full">
                <Command className="rounded-lg border shadow-sm my-5 w-96">
                    <CommandInput
                        placeholder="Search in Bakery shop..."
                        onValueChange={handleValueChange}
                    />
                    {
                        <CommandList>
                            {open &&
                                filteredCommands.length > 0 &&
                                filteredCommands.map((command) => (
                                    <CommandItem key={command.value} value={command.value}>
                                        {command.label}
                                    </CommandItem>
                                ))}
                        </CommandList>
                    }
                </Command>
            </div>
        </div>
    );
}
