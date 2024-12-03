"use client";

import React, { useState } from "react";
import {
     IconCalendar,
    IconLocation,
    IconStar,
    IconStore,
    IconTruck,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { MiniCalendar, MiniCalendarBakerz } from "@/components/scheduler/calendar";
import { AddressDataStoreField, AddressDataUserField } from "@/lib/definitions";
import {cityLatLngMap, timeMap} from "@/lib/local-variables";
import {formatAddress} from "@/lib/utils";
import { ProfileDescription } from "@/components/store/store-header/profile-description";
import {pacifico} from "@/components/fonts";
import {Accordion, AccordionItem, Avatar, AvatarIcon, Card, CardBody, Switch} from "@nextui-org/react";
import {HeaderButtons} from "@/components/store/store-header/header-buttons";


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
    userId?: string;
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
                                  variant = "default",
                                  userId,
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
            <Card
                className={`h-64 cm:h-[272px] p-3 rounded-lg overflow-hidden flex flex-col justify-center bg-gradient-to-tr from-secondary to-primary-foreground mb-4`}>
                    <Card
                        isBlurred
                        className="w-full h-full border-none bg-background/60 border-1"
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
            </Card>
            <HeaderButtons
                userId={userId}
            />
            <div className={"flex flex-row justify-between"}>
                <div className={"flex flex-col space-y-4 w-full max-w-2xl justify-center items-center"}>
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
                            <p>
                                Here Should Be an Easy way to select the day for customer
                            </p>
                            <p>
                                Previous idea did not align with TheBakerz principles
                            </p>
                        </AccordionItem>
                    </Accordion>
                </div>
                {/*<div className={"w-full justify-center hidden store-image:block"}>*/}
                {/*    <div className={"flex flex-col items-center"}>*/}
                {/*        <Image*/}
                {/*            isBlurred*/}
                {/*            src={"/images/Alone_Time.svg"}*/}
                {/*            alt={"Customer at home choose the dessert from Bakerz ml-10"}*/}
                {/*            width={450}*/}
                {/*        />*/}
                {/*        <p className={`text-4xl w-fit ${pacifico.className}`}>Sweet dreams come true!</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
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
