"use client";
import Image from "next/image";
import {Label} from "@/components/ui/label";
import {IconLocation, IconStar, IconThreeDots} from "@/components/ui/icons";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {MiniCalendar, MiniCalendarBakerz} from "@/components/scheduler/calendar";
import React from "react";
import {AddressDataStoreField} from "@/lib/definitions";
import {cityLatLngMap, timeMap} from "@/lib/local-variables";
import {formatAddress} from "@/lib/utils";

interface ProfileHeaderProps {
    name: string;
    description: string | null;
    location: AddressDataStoreField;
    image: string | null;
    background_url: string | null;
    deliveryOptions: Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    > | null;
    availability: Record<
        string,
        {
            from: keyof typeof timeMap;
            to: keyof typeof timeMap;
            availability: "Free" | "Busy";
        }
    > | null;
}

export function ProfileHeaderBakerz({ name, availability, deliveryOptions, location, image, description, background_url }: ProfileHeaderProps) {
    return (
        <div className="h-60 relative cm:h-72 rounded-lg overflow-hidden flex flex-col justify-center">
            <Background background_url={background_url}/>
            <Avatar avatar_url={image}/>
            <ProfileInfo
                name={name}
                description={description}
                location={location}
            />
            <MiniCalendarBakerz/>
        </div>
    );
}

export function ProfileHeader({ name, availability, deliveryOptions, location, image, description, background_url }: ProfileHeaderProps) {
    return (
        <div className="h-60 relative cm:h-72 rounded-lg overflow-hidden flex flex-col justify-center">
            <Background background_url={background_url}/>
            <Avatar avatar_url={image}/>
            <ProfileInfo
                name={name}
                description={description}
                location={location}
            />
            <MiniCalendar/>
        </div>
    );
}

const Background = ({background_url} : {background_url: string | null}) => (
    <Image
        src={background_url ? background_url : "/background_default.jpg"}
        alt="Background"
        width={1920}
        height={1080}
        priority={true}
        className="opacity-30"
    />
);

const Avatar = ({avatar_url} : {avatar_url: string | null}) => (
    <div className="ml-2 mt-8 cm:ml-4 cm:mt-8 absolute hover:scale-105 transition duration-500 cursor-default avatar">
            <Image
                src={avatar_url ? avatar_url : "/avatar_default.jpg"}
                alt="Avatar"
                width={128}
                height={128}
                className="rounded-full relative h-28 w-28 cm:h-32 cm:w-32"
                unoptimized={true}
                quality={100}
                placeholder={"blur"}
                blurDataURL={"/avatars/store_1.jpg"}
            />

        <p className="text-sm cm:text-base mt-2 underline font-light text-gray-600 text-center">about me</p>
    </div>
);

interface ProfileInfoProps {
        name: string;
        description: string | null;
        location: AddressDataStoreField;
}

const ProfileInfo = ({name, description, location} : ProfileInfoProps) => (
    <div className="ml-36 mt-14 cm:ml-40 cm:mt-12 absolute space-y-2">
        <Label className="text-xl cm:text-2xl font-bold text-black">{name}</Label>
        <Label className="flex items-center space-x-2 hover:scale-102 transition duration-300">
            <IconStar className={"w-5 h-5 cm:w-6 cm:h-6"} color={"primary"}/>
            <p className="text-lg cm:text-xl text-black">5.0</p>
            <p className="text-sm cm:text-base underline font-light text-gray-600">260 reviews</p>
        </Label>
        <Label className="flex items-center space-x-2 hover:scale-102 transition duration-300">
            <IconLocation className={"w-5 h-5 cm:w-6 cm:h-6"} color={"primary"}/>
            <p className="text-lg cm:text-xl text-black">{formatAddress(location)}</p>
        </Label>
        <div className="flex pt-2 space-x-2 cm:space-x-3 left-0">
            <Button className="cm:text-lg w-dynamic-button h-10 cm:w-auto cm:h-auto">Build your own cake</Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-white px-1 cm:px-1.5 opacity-80" variant="outline">
                        <IconThreeDots className={"w-7-5 h-7-5"}/>
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