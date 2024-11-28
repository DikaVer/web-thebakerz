'use client';

import 'react-image-crop/dist/ReactCrop.css';
import React, {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {
    IconArrow,
    IconAvatar,
    IconChevronDown,
    IconCopy,
    IconCross,
    IconLocation,
    IconStar
} from "@/components/ui/icons";
import {AddressDataStoreField} from "@/lib/definitions";
import {cityLatLngMap, timeMap} from "@/lib/local-variables";
import Image from "next/image";
import {ScrollArea} from "@/components/ui/scroll-area";
import {formatAddress} from "@/lib/utils";
import {Label} from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {Calendar} from "@/components/ui/calendar";
import {ExternalLink} from "@/components/external-link";


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
    sectionId: "profile-section" | "review-section" | "location-section";
}

export function ProfileDescription({isDialogOpen, setDialogOpen, description, background_url, deliveryOptions, location, avatar_url, name, availability, sectionId } : ProfileDescriptionProps) {

    const [isOpen, setIsOpen] = useState<boolean>(isDialogOpen);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (isDialogOpen) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        };
    }, [isDialogOpen]);

    const profileSectionRef = useRef<HTMLDivElement>(null);
    const reviewSectionRef = useRef<HTMLDivElement>(null);
    const locationSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isDialogOpen) {
            const sectionRef = {
                "profile-section": profileSectionRef,
                "review-section": reviewSectionRef,
                "location-section": locationSectionRef
            }[sectionId];

            if (sectionRef && sectionRef.current) {
                sectionRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [isDialogOpen, sectionId]);

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

                        <div className={"grid gap-4 slide-in-from-top-[5%]"} id="profile-section" ref={profileSectionRef}>
                            <div className="relative h-40">
                                <Image
                                    src={background_url ? background_url : "/images/background_default.jpg"}
                                    alt="Background"
                                    quality={75} // Reduced quality for optimization
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    style={{
                                        objectFit: 'cover',
                                    }}
                                    className="opacity-30 rounded-lg"
                                />
                                <div className="absolute ml-2 mt-4 flex flex-row items-center justify-start avatar">
                                    <div className="relative w-32 h-32">
                                        {!isLoaded && !hasError && (
                                            <IconAvatar
                                                className="w-32 h-32 absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full"/>
                                        )}
                                        {avatar_url && !hasError && (
                                            <Image
                                                src={avatar_url}
                                                alt="Avatar"
                                                fill
                                                sizes="25vw"
                                                style={{objectFit: 'cover'}}
                                                className={`rounded-full transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                                                onLoad={() => setIsLoaded(true)}
                                                onError={() => setHasError(true)}
                                            />
                                        )}
                                        {(hasError || !avatar_url) && (
                                            <IconAvatar
                                                className="w-32 h-32 inset-0 flex items-center justify-center bg-gray-100 rounded-full"/>
                                        )}
                                    </div>
                                    <span className="ml-4 text-2xl font-bold clamp-title">
                                        {name ? name : "Empty name"}
                                    </span>
                                    </div>
                                </div>
                                <span className={"font-medium text-grayText"}>
                                {description}
                            </span>
                        </div>
                        <hr/>
                        {availability && (
                            <>
                                <div className={"flex flex-col justify-center bg-grayBg rounded-lg"}>
                                    <div className={"flex flex-col items-start pl-4 p-4"}>
                                        <Label className={"text-xl"}>
                                            Calendar Availability
                                        </Label>
                                        <ExternalLink href="/faq">
                                            Availability explanation
                                        </ExternalLink>
                                    </div>
                                    <div className={"flex justify-center"}>
                                        <Calendar
                                            panelClassName={{
                                                width: "w-full",
                                                mx: "mx-4",
                                                justifyContent: "justify-between",
                                            }}
                                            availabilityData={availability}
                                            mode="single"
                                            className={"border-1 rounded-lg mb-4 bg-grayCompFa"}
                                            userView={true}
                                            initialFocus
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <hr/>
                        <div className={"grid gap-4  slide-in-from-top-[5%]"} id="location-section"
                             ref={locationSectionRef}>
                            <Label className={"text-xl"}>
                                Store Location
                            </Label>
                            <LocationComponent location={location}/>
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
                        <div
                            className={"flex flex-row justify-between items-center cursor-pointer hover:scale-102 hover:bg-grayBg transition duration-300 rounded-lg py-3"}
                            id={"review-section"} ref={reviewSectionRef}
                        >
                            <div>
                                <Label className={"text-xl cursor-pointer"}>
                                    Customer Reviews
                                </Label>
                                <div className={"flex flex-row items-center"}>
                                    <IconStar className={"w-6"} color={"primary"}/>
                                    <IconStar className={"w-6"} color={"primary"}/>
                                    <IconStar className={"w-6"} color={"primary"}/>
                                    <IconStar className={"w-6"} color={"primary"} state={"half"}/>
                                    <IconStar className={"w-6"} color={"primary"} state={"empty"}/>
                                    <p className="ml-2 font-medium text-grayText">5.0 (260 reviews)</p>
                                </div>
                            </div>
                            <IconChevronDown className={"w-12 transform -rotate-90"}/>
                        </div>


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
                <div key={city}>
                    <div key={city} className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium text-gray-900">{city}</span>
                        <Dialog open={isOpen && selectedCity === city} onOpenChange={(open) => setIsOpen(open)}>
                            <DialogTrigger asChild>
                                <Button onClick={() => {
                                    setSelectedCity(city);
                                    setIsOpen(true);
                                }}>Preview</Button>
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
                    <hr/>
                </div>
            ))}
        </>
    );
};

const LocationComponent: React.FC<{ location: AddressDataStoreField }> = ({ location }) => {
    const [hoveringCopy, setHoveringCopy] = useState(false);

    const handleMouseEnter = () => {
        setHoveringCopy(true);
    };

    const handleMouseLeave = () => {
        setHoveringCopy(false);
    };

    return (
        <div
            className={"flex justify-between mr-2 items-center cursor-pointer"}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex items-center space-x-2">
                <IconLocation className={"w-5 h-5 cm:w-6 cm:h-6"} color={"primary"} />
                <p className="text-lg cm:text-xl clamp-title">{formatAddress(location)}</p>
            </div>
            <IconCopy
                className={`w-6 h-6 cursor-pointer transition-transform duration-300 ${hoveringCopy ? 'scale-115' : ''}`}
                color={"primary"}
            />
        </div>
    );
};
