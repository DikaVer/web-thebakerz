'use client';

import 'react-image-crop/dist/ReactCrop.css';
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import React, {useEffect, useRef, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardBody, Image} from "@nextui-org/react";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";
import {
    IconArrow,
    IconChevronDown,
    IconCopy,
    IconCross,
    IconLocation,
    IconStar
} from "@/components/ui/icons";
import {AddressDataStoreField} from "@/lib/definitions";
import {backdropEffect, cityLatLngMap, timeMap} from "@/lib/local-variables";
import {formatAddress} from "@/lib/utils";
import {Avatar, AvatarIcon} from "@nextui-org/react";
import {Label} from "@/components/ui/label";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {Calendar} from "@/components/ui/calendar";
import {ExternalLink} from "@/components/external-link";
import {CardHeader} from "@nextui-org/card";
import {pacifico} from "@/components/fonts";


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
            <Modal
                backdrop={backdropEffect}
                isOpen={isOpen}
                onClose={toggleClose}
                size={'xl'}
                shadow={"lg"}
                className={"bg-background"}
            >
                <ModalContent>
                    {(onClose) => (
                        <ModalBody className={'mt-5'}>
                            <ScrollShadow hideScrollBar size={50} className={"max-h-[75vh]"}>
                                <div className={"grid gap-4  slide-in-from-top-[5%]"}>

                                        <div className={"grid gap-4 slide-in-from-top-[5%]"} id="profile-section"
                                             ref={profileSectionRef}>
                                            <div className={"w-full h-40 bg-gradient-to-tr from-primary to-secondary rounded-xl"}>
                                                <Card
                                                    isBlurred
                                                    className="border-none bg-background/60 dark:bg-default-100/50 max-w-[610px] m-3"
                                                    shadow="sm"
                                                >

                                                    <div className={`flex flex-row items-end justify-between h-[136px] p-1 px-4`}>
                                                        <Avatar
                                                            showFallback
                                                            //@ts-ignore
                                                            src={avatar_url}
                                                            icon={<AvatarIcon/>}
                                                            className={"w-32 h-32 items-center"}
                                                            width={128}
                                                            height={128}
                                                            classNames={{
                                                                base: "bg-gradient-to-br from-primary to-secondary",
                                                                icon: "text-black/80",
                                                            }}
                                                        />
                                                        <span className={`text-2xl font-bold clamp-title ${pacifico.className}`}>
                                                        {name ? name : "Empty name"}
                                                     </span>
                                                    </div>
                                                    </Card>
                                            </div>
                                            <span className={"font-medium text-grayText"}>
                                            {description}
                                            </span>
                                        </div>
                                    <hr/>
                                    {availability && (
                                        <Card
                                            className={"shadow-md border-1"}
                                        >
                                            <CardBody>
                                                    <div className={"flex flex-col items-start pl-4 pb-4"}>
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
                                                            className={"border-1 rounded-lg mb-4 bg-grayBgComp backdrop-blur-xl"}
                                                            userView={true}
                                                            initialFocus
                                                        />
                                                    </div>
                                            </CardBody>
                                        </Card>
                                    )}
                                    <hr/>

                                    <div className={"grid gap-4  slide-in-from-top-[5%]"} id="location-section"
                                         ref={locationSectionRef}>
                                        <Label className={"text-xl"}>
                                            Store Location
                                        </Label>
                                        <Card className={`shadow-md border-1`}>
                                            <CardBody className={"w-full"}>
                                                <LocationComponent location={location}/>
                                            </CardBody>
                                            <CardBody>
                                                <div className="flex justify-center">
                                                    <Image
                                                        src={generateMapUrl(location.latitude, location.longitude)}
                                                        alt="Map showing the location"
                                                        width={400}
                                                        height={300}
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <hr/>
                                        {deliveryOptions && (
                                            <DeliveryLocationsTable
                                                deliveryOptions={deliveryOptions}
                                            />
                                        )}
                                    </div>
                                    {/*<div*/}
                                    {/*    className={"flex flex-row justify-between items-center cursor-pointer hover:scale-102 hover:bg-grayBg transition duration-300 p-3 py-3 rounded"}*/}
                                    {/*    id={"review-section"} ref={reviewSectionRef}*/}
                                    {/*>*/}
                                    {/*    <div>*/}
                                    {/*        <Label className={"text-xl cursor-pointer"}>*/}
                                    {/*            Customer Reviews*/}
                                    {/*        </Label>*/}
                                    {/*        <div className={"flex flex-row items-center"}>*/}
                                    {/*            <IconStar className={"w-6 text-primary"}/>*/}
                                    {/*            <IconStar className={"w-6 text-primary"}/>*/}
                                    {/*            <IconStar className={"w-6 text-primary"}/>*/}
                                    {/*            <IconStar className={"w-6 text-primary"} state={"half"}/>*/}
                                    {/*            <IconStar className={"w-6 text-primary"} state={"empty"}/>*/}
                                    {/*            <p className="font-medium text-grayText">5.0 (260 reviews)</p>*/}
                                    {/*        </div>*/}
                                    {/*    </div>*/}
                                    {/*    <IconChevronDown className={"w-12 transform -rotate-90 text-text"}/>*/}
                                    {/*</div>*/}
                                </div>
                            </ScrollShadow>
                        </ModalBody>
                    )}
                    </ModalContent>
            </Modal>
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
                <div key={city} >
                    <Card className={"mb-4 shadow-md border-1"}>
                        <CardBody>
                            <div key={city} className="flex justify-between items-center">
                                <span className="text-lg font-medium justify-end text-text">{city}</span>

                                <Button
                                    variant={"secondary"}
                                    onClick={() => {
                                        setSelectedCity(city);
                                        setIsOpen(true);
                                    }}>
                                    Preview
                                </Button>
                                <Modal
                                    backdrop={backdropEffect}
                                    isOpen={isOpen}
                                    onClose={() => setIsOpen(false)}
                                    size={'md'}
                                    shadow={"lg"}
                                    placement={"center"}
                                    className={"bg-background"}
                                >
                                    <ModalContent>
                                        {(onClose) => (
                                            <>
                                                <ModalHeader>
                                                    Map Preview
                                                </ModalHeader>
                                                <ModalBody>
                                                    <Image
                                                        src={generateMapUrl(cityLatLngMap[city].lat, cityLatLngMap[city].lng, deliveryOptions[city].range)}
                                                        alt="Map showing the location"
                                                        width={400}
                                                        height={300}
                                                        className="rounded-lg"
                                                    />
                                                </ModalBody>
                                            </>
                                        )}
                                    </ModalContent>
                                </Modal>
                            </div>
                        </CardBody>
                    </Card>
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
                <IconLocation className={"w-6 h-6 cm:w-8 cm:h-8 text-primary"} />
                <p className="text-lg cm:text-xl clamp-title">{formatAddress(location)}</p>
            </div>
            <IconCopy
                className={`w-8 h-8 text-primary cursor-pointer transition-transform duration-300 ${hoveringCopy ? 'scale-115' : ''}`}
            />
        </div>
    );
};
