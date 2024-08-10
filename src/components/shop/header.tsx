import Image from "next/image";
import { Label } from "@/components/ui/label";
import { IconLocation, IconStar, IconThreeDots } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MiniCalendar } from "@/components/shop/calendar";
import React from "react";

export function ProfileHeader() {
    return (
        <div className="content-container h-60 relative cm:h-72 rounded-lg overflow-hidden flex flex-col justify-center">
            <Background />
            <Avatar />
            <ProfileInfo />
            <MiniCalendar />
        </div>
    );
}

const Background = () => (
    <Image
        src="/background_test.jpg"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        alt="Background"
        className="opacity-30"
    />
);

const Avatar = () => (
    <div className="ml-2 mt-8 cm:ml-4 cm:mt-8 absolute hover:scale-105 transition duration-500 cursor-default avatar">
        <div className="relative h-28 w-28 cm:h-32 cm:w-32">
            <Image
                src="/avatar_test.jpg"
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                alt="Avatar"
                className="rounded-full"
            />
        </div>
        <p className="text-sm cm:text-base mt-2 underline font-light text-gray-600 text-center">about me</p>
    </div>
);

const ProfileInfo = () => (
    <div className="ml-36 mt-14 cm:ml-40 cm:mt-12 absolute space-y-2">
        <Label className="text-xl cm:text-2xl font-bold text-black">Mrs. Bombochka</Label>
        <Label className="flex items-center space-x-2 hover:scale-102 transition duration-300">
            <IconStar />
            <p className="text-lg cm:text-xl text-black">5.0</p>
            <p className="text-sm cm:text-base underline font-light text-gray-600">260 reviews</p>
        </Label>
        <Label className="flex items-center space-x-2 hover:scale-102 transition duration-300">
            <IconLocation />
            <p className="text-lg cm:text-xl text-black">Maastricht</p>
        </Label>
        <div className="flex pt-2 space-x-2 cm:space-x-3 left-0">
            <Button className="cm:text-lg w-dynamic-button h-10 cm:w-auto cm:h-auto">Build your own cake</Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-white px-1 cm:px-1.5 opacity-80" variant="outline">
                        <IconThreeDots />
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
);