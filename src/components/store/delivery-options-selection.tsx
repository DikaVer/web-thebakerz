import React, { useEffect, useState } from 'react';
import { cityLatLngMap } from "@/lib/local-variables";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconCross } from "@/components/ui/icons";
import Image from "next/image";

interface DeliveryLocationFormProps {
    locationMap: string;
    rangeMap: number;
    removeLocation: (location: string) => void;
    deliveryLocations: Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    >;
    setDeliveryLocations: React.Dispatch<React.SetStateAction<Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    >>>;
}

const DeliveryLocationForm: React.FC<DeliveryLocationFormProps> = ({ locationMap, rangeMap, removeLocation, deliveryLocations, setDeliveryLocations }) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const [location, setLocation] = React.useState<string>(locationMap);
    const [range, setRange] = React.useState<string>(rangeMap.toString());
    const [isOpen, setIsOpen] = useState<boolean>(false);

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

    const handleLocationChange = (currentValue: string) => {
        if (currentValue === location) {
            // City hasn't changed
            setOpen(false);
            return;
        }
        removeLocation(location);
        setLocation(currentValue);
        setOpen(false);
        updateDeliveryLocation(currentValue, range);
    };

    const handleRangeChange = (currentValue: string) => {
        setRange(currentValue);
        updateDeliveryLocation(location, currentValue);
    };

    const updateDeliveryLocation = (location: string, stringRange: string) => {
        const range = parseInt(stringRange);
        setDeliveryLocations((prevDeliveryLocations) => {
            const updatedLocations = { ...prevDeliveryLocations };
            updatedLocations[location] = { range: range };
            return updatedLocations;
        });
    };

    return (
        <div className="flex items-center justify-between">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[150px] justify-between truncate"
                    >
                        {location
                            ? Object.keys(cityLatLngMap).find((city) => city === location)
                            : "Select city..."}
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[150px] p-0">
                    <Command>
                        <CommandInput placeholder={"Search city..."} className="h-9" />
                        <CommandList>
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup>
                                {Object.keys(cityLatLngMap).map((city) => (
                                    <CommandItem
                                        key={city}
                                        value={city}
                                        onSelect={handleLocationChange}
                                    >
                                        {city}
                                        <CheckIcon
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                location === city ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Select onValueChange={handleRangeChange}>
                <SelectTrigger className="w-[70px] p-1">
                    <SelectValue placeholder={range !== "0" ? `${range} km` : "Select range"} />
                </SelectTrigger>
                <SelectContent className="w-[70px] p-1">
                    <SelectGroup>
                        <SelectLabel>Range</SelectLabel>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(range => (
                            <SelectItem key={range} value={range.toString()}>
                                {range} km
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            {location && range && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsOpen(true)}>Preview</Button>
                    </DialogTrigger>
                    <DialogContent className={"w-fit"} handleClose={() => setIsOpen(false)}>
                        <DialogHeader>
                            <DialogTitle>Map Preview</DialogTitle>
                        </DialogHeader>
                        <DialogDescription>
                        </DialogDescription>
                        <Image
                            src={generateMapUrl(cityLatLngMap[location].lat, cityLatLngMap[location].lng, parseInt(range))}
                            alt="Map showing the location"
                            width={400}
                            height={300}
                            className="rounded-lg"
                        />
                        <DialogFooter>
                            <Button onClick={() => setIsOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            <Button
                type="button"
                onClick={() => removeLocation(location)}
                variant={"outline"}
                className={"px-2"}
            >
                <IconCross className={"w-5"} />
            </Button>
        </div>
    );
};

interface DeliveryOptionsProps {
    deliveryLocations: Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    >;
    setDeliveryLocations: React.Dispatch<React.SetStateAction<Record<
        keyof typeof cityLatLngMap,
        {
            range: number;
        }
    >>>;
}

const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ deliveryLocations, setDeliveryLocations }) => {
    const addDeliveryLocation = () => {
        setDeliveryLocations({
            ...deliveryLocations,
            "" : { range: 0 }
        });
    };

    const removeDeliveryLocation = (location: string) => {
        setDeliveryLocations((prevLocations) => {
            const updatedLocations = { ...prevLocations };
            delete updatedLocations[location];
            return updatedLocations;
        });
    };

    return (
        <div className={"flex flex-col gap-y-4"}>
            {Object.keys(deliveryLocations).map((location, index) => (
                <DeliveryLocationForm
                    key={location || index}
                    locationMap={location}
                    rangeMap={deliveryLocations[location].range}
                    removeLocation={removeDeliveryLocation}
                    deliveryLocations={deliveryLocations}
                    setDeliveryLocations={setDeliveryLocations}
                />
            ))}
            <Button
                type="button"
                onClick={addDeliveryLocation}
                variant={"secondary"}
                className={"w-full"}
            >
                Add Delivery City
            </Button>
        </div>
    );
};

export default DeliveryOptions;