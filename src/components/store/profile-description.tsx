'use client';

import 'react-image-crop/dist/ReactCrop.css';
import React, { useState } from "react";
import {Button} from "@/components/ui/button";
import {IconCopy, IconCross, IconLocation} from "@/components/ui/icons";
import {AddressDataStoreField} from "@/lib/definitions";
import {cityLatLngMap, timeMap} from "@/lib/local-variables";
import Image from "next/image";
import {ScrollArea} from "@/components/ui/scroll-area";
import {formatAddress} from "@/lib/utils";
import {Label} from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';


interface ProfileDescriptionProps {
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    name: string | null;
    description: string | null;
    location: AddressDataStoreField;
    avatar_url: string | null;
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

export function ProfileDescription({isDialogOpen, setDialogOpen, description, background_url, deliveryOptions, location, avatar_url, name, availability } : ProfileDescriptionProps) {

    const [isOpen, setIsOpen] = useState<boolean>(isDialogOpen);

    const toggleClose = () => {
        setIsOpen(false);
        //Artificial delay to allow the animation to finish
        setTimeout(() => {
            setDialogOpen(false);
        }, 400);
    }

    const generateMapUrl = (latitude: number, longitude: number) => {
        return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=14&size=400x300&markers=color:red%7Clabel:A%7C${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;
    };

    return (
        <>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className="fixed inset-0 z-30 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                onClick={(e) => {
                    toggleClose();
                }}/>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className={"fixed left-[50%] top-[50%] z-40 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"}
            >
                <ScrollArea className={"max-h-[75vh]"}>
                    <div className={"grid gap-4  slide-in-from-top-[5%] p-6"}>
                        <div className={`flex flex-row justify-between items-center`}>
                            <Button
                                className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                                onClick={() => toggleClose()}
                            >
                                <IconCross className={"w-8 h-8 cursor-pointer"}/>
                            </Button>
                            <p className={"text-xl font-medium"}>Profile</p>
                            <div className="w-8 h-8 flex "></div>
                        </div>
                        <hr className={"my-1"}/>

                        <div className={"relative h-40"}>
                            <Image
                                src={background_url ? background_url : "/background_default.jpg"}
                                alt="Background"
                                priority={true}
                                quality={100}
                                fill
                                sizes="100vw"
                                style={{
                                    objectFit: 'cover',
                                }}
                                className={"opacity-30 rounded-lg"}
                            />
                            <div
                                className="absolute ml-2 mt-4 flex flex-row items-center justify-start avatar"
                            >
                                <Image
                                    src={avatar_url ? avatar_url : "/avatar_default.jpg"}
                                    alt="Avatar"
                                    width={128}
                                    height={128}
                                    className="rounded-full relative h-32 w-32"
                                    unoptimized={true}
                                    quality={100}
                                    placeholder={"blur"}
                                    blurDataURL={"/avatars/store_1.jpg"}
                                />
                                <span
                                    className="ml-4 text-2xl font-bold text-black clamp-title">{name ? name : "Empty name"}
                                </span>
                            </div>
                        </div>
                        <span className={"font-medium text-grayText"}>
                            {description}
                        </span>
                        <hr/>
                        <Label className={"text-xl"}>
                            Store Location
                        </Label>
                        <div className={"flex justify-between mr-2 items-center"}>
                            <div className="flex items-center space-x-2">
                                <IconLocation className={"w-5 h-5 cm:w-6 cm:h-6"} color={"primary"}/>
                                <p className="text-lg  cm:text-xl text-black clamp-title">{formatAddress(location)}</p>
                            </div>
                            <IconCopy className={"w-6 h-6 cursor-pointer"} color={"primary"}/>
                        </div>
                        <div className="flex justify-center">
                            <Image
                                src={generateMapUrl(location.latitude, location.longitude)}
                                alt="Map showing the location"
                                width={400}
                                height={300}
                                className="rounded-lg"
                            />
                        </div>
                        <hr/>
                        {deliveryOptions && (
                                <DeliveryLocationsTable
                                    deliveryOptions={deliveryOptions}
                                />
                        )}



                    </div>
                </ScrollArea>
            </div>
        </>
    );
}

const DeliveryLocationsTable: React.FC<{ deliveryOptions: Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    > }> = ({ deliveryOptions }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);

    const generateMapUrl = (latitude: number, longitude: number, radius: number): string => {
        const circlePoints: string[] = [];
        const numPoints = 72; // Number of points to create a smooth circle
        const radiusMeters = radius * 1000; // Convert km to meters

        // Earth's radius in meters
        const earthRadius = 6378137;

        for (let i = 0; i <= numPoints; i++) {
            const angle = (i * 360) / numPoints;
            const angleRad = (angle * Math.PI) / 180;

            const deltaLat = (radiusMeters / earthRadius) * Math.cos(angleRad);
            const deltaLng = (radiusMeters / earthRadius) * Math.sin(angleRad) / Math.cos((latitude * Math.PI) / 180);

            const pointLat = latitude + (deltaLat * 180) / Math.PI;
            const pointLng = longitude + (deltaLng * 180) / Math.PI;

            circlePoints.push(`${pointLat},${pointLng}`);
        }

        const path = `&path=color:0xff0000ff|weight:2|fillcolor:0xFFFF0033|${circlePoints.join('|')}`;

        return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=10&size=400x300${path}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;
    };

    return (
        <>
            <Label className={"text-xl"}>Delivery Locations</Label>
            {Object.keys(deliveryOptions).map((city) => (
                <div key={city} className="flex justify-between items-center py-2">
                    <span className="text-lg font-medium text-gray-900">{city}</span>
                    <Dialog open={isOpen && selectedCity === city} onOpenChange={(open) => setIsOpen(open)}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setSelectedCity(city); setIsOpen(true); }}>Preview</Button>
                        </DialogTrigger>
                        <DialogContent className={"w-fit"} handleClose={() => setIsOpen(false)}>
                            <DialogHeader>
                                <DialogTitle>Map Preview</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                <Image
                                    src={generateMapUrl(cityLatLngMap[city].lat, cityLatLngMap[city].lng, deliveryOptions[city].range)}
                                    alt="Map showing the location"
                                    width={400}
                                    height={300}
                                    className="rounded-lg"
                                />
                            </DialogDescription>
                            <DialogFooter>
                                <Button onClick={() => setIsOpen(false)}>Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            ))}
            <hr/>
        </>
    );
};

export default DeliveryLocationsTable;