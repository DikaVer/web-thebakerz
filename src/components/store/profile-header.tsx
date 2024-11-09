"use client";

import React, { FC, useState } from "react";
import Image from "next/image";
import { IconAvatar, IconLocation, IconStar, IconThreeDots } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MiniCalendar, MiniCalendarBakerz } from "@/components/scheduler/calendar";
import { AddressDataStoreField, AddressDataUserField } from "@/lib/definitions";
import { cityLatLngMap, timeMap } from "@/lib/local-variables";
import { formatAddress } from "@/lib/utils";
import { ProfileDescription } from "@/components/store/profile-description";
import Skeleton from "react-loading-skeleton";
import {pacifico} from "@/components/fonts";

interface Availability {
    from: keyof typeof timeMap;
    to: keyof typeof timeMap;
    availability: "Free" | "Busy";
}

interface DeliveryOption {
    range: number;
}

interface BaseProfileHeaderProps {
    name: string | null;
    description: string | null;
    location: AddressDataStoreField;
    image: string | null;
    background_url: string | null;
    deliveryOptions: Record<keyof typeof cityLatLngMap, DeliveryOption> | null;
    availability: Record<string, Availability> | null;
}

interface ProfileHeaderProps extends BaseProfileHeaderProps {
    userLocation: AddressDataUserField[] | null;
    variant?: "default" | "bakerz";
}

export function ProfileHeader({
                                  name,
                                  availability,
                                  deliveryOptions,
                                  location,
                                  image,
                                  description,
                                  background_url,
                                  userLocation,
                                  variant = "default"
                              }: ProfileHeaderProps) {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [sectionId, setSectionId] = useState<"profile-section" | "review-section" | "location-section">("profile-section");

    const openDialog = (id: "profile-section" | "review-section" | "location-section") => {
        setSectionId(id);
        setDialogOpen(true);
    };

    const renderCalendar = () => {
        if (variant === "bakerz") {
            return <MiniCalendarBakerz availability={availability} />;
        }
        return (
            <MiniCalendar
                location={location}
                deliveryOptions={deliveryOptions}
                availability={availability}
                userLocation={userLocation}
            />
        );
    };

    return (
        <>
            {isDialogOpen && (
                <ProfileDescription
                    isDialogOpen={isDialogOpen}
                    setDialogOpen={setDialogOpen}
                    description={description}
                    background_url={background_url}
                    deliveryOptions={deliveryOptions}
                    location={location}
                    avatar_url={image}
                    name={name}
                    availability={availability}
                    sectionId={sectionId}
                />
            )}
            <div className={`h-60 relative cm:h-[272px] rounded-lg overflow-hidden flex flex-col justify-center`}>
                <Background background_url={background_url} />
                <Avatar avatar_url={image} toggleDialog={openDialog} />
                <ProfileInfo
                    name={name}
                    location={location}
                    deliveryOptions={deliveryOptions}
                    toggleDialog={openDialog}
                />
                {renderCalendar()}
            </div>
        </>
    );
}

interface BackgroundProps {
    background_url?: string | null;
}

const Background: FC<BackgroundProps> = ({ background_url }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className="relative w-full h-screen">
            {!isLoaded && <Skeleton height={"100%"} />}
            {/* Main Background Image */}
            {background_url && !hasError ? (
                <Image
                    src={background_url}
                    alt="Background"
                    fill
                    sizes="75vw"
                    style={{ objectFit: 'cover' }}
                    className={`absolute inset-0 transition-opacity duration-700 ${isLoaded ? 'opacity-30' : 'opacity-0'}`}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    priority
                    placeholder="blur"
                    blurDataURL="/blur_images/blur_product.jpg" // Ensure this data is provided
                />
            ) : (
                // Default Background Image
                <Image
                    src="/background_default.jpg" // Ensure this image exists in your public folder
                    alt="Default Background"
                    fill
                    sizes="75vw"
                    style={{ objectFit: 'cover' }}
                    className="absolute inset-0 opacity-30"
                    priority
                />
            )}
        </div>
    );
};

interface AvatarComponentProps {
    avatar_url?: string | null;
    toggleDialog: (section: "profile-section" | "review-section" | "location-section") => void;
}

const Avatar: FC<AvatarComponentProps> = ({ avatar_url, toggleDialog }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div
            className="ml-2 mt-10 cm:ml-4 cm:mt-14 absolute hover:scale-105 transition duration-500 cursor-pointer avatar"
            onClick={() => toggleDialog("profile-section")}
        >
            <div className="relative w-32 h-32">
                {!isLoaded && !hasError && (
                    <IconAvatar className="w-32 h-32 absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full" />
                )}
                {avatar_url && !hasError && (
                    <Image
                        src={avatar_url}
                        alt="Avatar"
                        fill
                        sizes="25vw"
                        style={{ objectFit: 'cover' }}
                        className={`rounded-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setHasError(true)}
                        loading="lazy"
                        // priority // Add this if the avatar is above the fold and critical for LCP
                    />
                )}
                {(hasError || !avatar_url) && (
                    <IconAvatar className="w-32 h-32 absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full" />
                )}
            </div>
            <p className="text-sm cm:text-base mt-2 underline font-light text-gray-600 text-center">
                about me
            </p>
        </div>
    );
};

interface ProfileInfoProps {
    name: string | null;
    location: AddressDataStoreField;
    deliveryOptions: Record<keyof typeof cityLatLngMap, DeliveryOption> | null;
    toggleDialog: (id: "profile-section" | "review-section" | "location-section") => void;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ name, location, deliveryOptions, toggleDialog }) => (
    <div className="ml-36 mt-14 cm:ml-40 cm:mt-16 absolute space-y-2">
        <div className="cursor-pointer space-y-2 font-medium">
            <div
                className="flex items-center space-x-2 hover:scale-102 transition duration-300"
                onClick={() => toggleDialog("profile-section")}
            >
                <span className={`text-2xl cm:text-3xl font-bold text-black clamp-title ${pacifico.className}`}>
                    {name ?? "Empty name"}
                </span>
            </div>
            <div
                className="flex items-center space-x-2 hover:scale-102 transition duration-300"
                onClick={() => toggleDialog("review-section")}
            >
                <IconStar className="w-[24px] cm:w-[28px]" color="primary" />
                <p className="text-lg cm:text-xl text-black">5.0</p>
                <p className="text-sm cm:text-base underline font-light text-gray-600 clamp-title">260 reviews</p>
            </div>
            <div
                className="flex flex-row items-center space-x-2 hover:scale-102 transition duration-300"
                onClick={() => toggleDialog("location-section")}
            >
                <IconLocation className="w-[24px] cm:w-[28px]" color="primary" />
                <div className="-space-y-1">
                    <p className="text-lg cm:text-xl text-black clamp-title">{formatAddress(location)}</p>
                    {deliveryOptions && (
                        <p className="text-sm cm:text-md text-grayText underline underline-offset-2 clamp-title">
                            Store has delivery locations
                        </p>
                    )}
                </div>
            </div>
        </div>
        <div className="flex pt-2 space-x-2 cm:space-x-3 left-0">
            <Button className="cm:text-lg w-dynamic-button h-10 cm:w-auto cm:h-auto">Build your own cake</Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="bg-white px-1 cm:px-1.5 opacity-80" variant="outline">
                        <IconThreeDots className="w-7-5 h-7-5" />
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
