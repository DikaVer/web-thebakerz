"use client";

import React, { FC, useState } from "react";
import Image from "next/image";
import {
    IconAvatar, IconCalendar, IconCopy,
    IconLocation,
    IconStar,
    IconStore,
    IconThreeDots,
    IconTruck,
    MoonIcon,
    SunIcon
} from "@/components/ui/icons";
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
import {cn, formatAddress} from "@/lib/utils";
import { ProfileDescription } from "@/components/store/profile-description";
import Skeleton from "react-loading-skeleton";
import {pacifico} from "@/components/fonts";
import {Accordion, AccordionItem, Avatar, AvatarIcon, Card, CardBody, Switch} from "@nextui-org/react";

import {AnchorIcon} from "@nextui-org/shared-icons";


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

    const [isPickUp, setIsPickUp] = useState(true);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);


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
            <div
                className={`h-64 cm:h-[272px] rounded-lg overflow-hidden flex flex-col justify-center bg-gradient-to-tr from-secondary to-primary-foreground mb-4`}>
                <div className={"w-full px-5"}>
                    <Card
                        isBlurred
                        className="w-full border-none bg-background/20 border-1 h-60 cm:h-[252px]"
                        shadow="sm"
                    >
                        <ProfileInfo
                            name={name}
                            location={location}
                            deliveryOptions={deliveryOptions}
                            toggleDialog={openDialog}
                            avatar_url={image}
                        />
                    </Card>
                </div>
            </div>
            <div className="flex flex-row justify-end space-x-4 mb-4">
                <Button
                    isIconOnly
                    className=" px-1 cm:px-1.5 opacity-80"
                    variant="outline">
                    <IconThreeDots className="w-7-5 h-7-5 text-background"/>
                </Button>
                <Button
                    variant={'secondary'}
                    className="cm:text-lg w-dynamic-button h-10 cm:w-auto cm:h-auto">
                    Message Me
                </Button>
                <Button
                    variant={'default'}
                    className="cm:text-lg w-dynamic-button h-10 cm:w-auto cm:h-auto">
                    Sweet Builder
                </Button>

            </div>
            <div>
                <div className={"flex flex-col space-y-4"}>
                    <Accordion
                        variant={"splitted"}
                        selectionMode="single"
                        selectedKeys={[`${isPickUp ? "" : "Delivery"}`]}
                    >
                        <AccordionItem
                            key={"Delivery"}
                            aria-label={"Delivery"}
                            disableIndicatorAnimation
                            title={
                                <div className={"flex flex-col"}>
                                    <span className="text-lg cm:text-xl font-bold">Delivery Mode</span>
                                    <span
                                        className="text-medium cm:text-lg text-grayText">{isPickUp ? "Pick Up" : "Delivery"}</span>

                                </div>
                            }
                            indicator={
                                <Switch
                                    isSelected={isPickUp}
                                    size="lg"
                                    color="secondary"
                                    startContent={<IconStore className={"text-text"}/>}
                                    endContent={<IconTruck className={"text-text"}/>}
                                    onClick={() => setIsPickUp(!isPickUp)}
                                >
                                </Switch>
                            }
                            className={"shadow-md"}
                            onPress={() => setIsPickUp(!isPickUp)}

                        >
                            <Card>
                                <CardBody>
                                    <div
                                        className={"flex justify-between mr-2 items-center cursor-pointer"}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <IconLocation className={"w-6 h-6 cm:w-8 cm:h-8 text-primary"}/>
                                            <p className="text-lg cm:text-xl clamp-title">Select your Address</p>
                                        </div>
                                        <Button
                                            variant={'default'}
                                        >
                                            Select
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </AccordionItem>
                    </Accordion>
                    <Accordion
                        variant={"splitted"}
                        selectionMode="single"
                        selectedKeys={[`${isCalendarOpen ? "Calendar" : ""}`]}
                    >
                        <AccordionItem
                            key="Calendar"
                            aria-label="Moon"
                            indicator={
                                <Button
                                    isIconOnly
                                    className={"w-10 h-10 cm:w-12 cm:h-12"}
                                    variant={"secondary"}
                                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                >
                                    <IconCalendar className={"w-6 h-6 cm:w-8 cm:h-8 text-gray-800 rotate-45"}/>
                                </Button>
                            }
                            title={
                                <div className={"flex flex-col"}>
                                    <span
                                        className="text-lg cm:text-xl font-bold mb-4">Schedule {isPickUp ? "Pick Up" : "Delivery"}</span>
                                    {renderCalendar()}
                                </div>
                            } className={"shadow-md"}>
                            Here Should Be Easy way to select the day
                        </AccordionItem>
                    </Accordion>
                </div>

            </div>
        </>
    );
}


interface ProfileInfoProps {
    name: string | null;
    location: AddressDataStoreField;
    deliveryOptions: Record<keyof typeof cityLatLngMap, DeliveryOption> | null;
    toggleDialog: (id: "profile-section" | "review-section" | "location-section") => void;
    avatar_url?: string | null;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({name, location, deliveryOptions, toggleDialog, avatar_url}) => (
    <div
        className={`cursor-pointer p-4`}
        onClick={() => toggleDialog("profile-section")}
    >
        <div className={`flex flex-row justify-between mb-2`}>
            <Avatar
                showFallback
                //@ts-ignore
                src={avatar_url}
                icon={<AvatarIcon/>}
                className={"w-32 h-32 items-center"}
                //@ts-ignore
                width={128}
                height={128}
                classNames={{
                    base: "bg-gradient-to-br from-primary to-secondary",
                    icon: "text-black/80",
                }}
            />
            <span className={`text-2xl  cm:text-3xl font-bold clamp-title ${pacifico.className} hover:scale-102 transition duration-300`}>
                    {name ?? "Empty name"}
            </span>
        </div>
        <div className="cursor-pointer space-y-2 font-medium">
            <div
                className="flex items-center space-x-2 hover:scale-102 transition duration-300"
                onClick={() => toggleDialog("review-section")}
            >
                <IconStar className="w-[24px] cm:w-[28px] text-primary"/>
                <p className="text-lg cm:text-xl">5.0</p>
                <p className="text-sm cm:text-base underline font-light text-grayText clamp-title">260 reviews</p>
            </div>
            <div
                className="flex flex-row items-center justify-start space-x-2 hover:scale-102 transition duration-300"
                onClick={() => toggleDialog("location-section")}
            >
                <div className={"w-[24px] cm:w-[28px] flex-grow-0"}>
                    <IconLocation className="w-[24px] cm:w-[28px] text-primary"/>
                </div>
                <div className="-space-y-1">
                    <p className="text-lg cm:text-xl clamp-title">{formatAddress(location)}</p>
                    {deliveryOptions && (
                        <p className="text-sm cm:text-md text-grayText underline underline-offset-2 clamp-title">
                            Store has delivery locations
                        </p>
                    )}
                </div>
            </div>
        </div>

    </div>
);
