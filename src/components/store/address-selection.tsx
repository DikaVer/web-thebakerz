import React, {useEffect, useRef, useState} from "react";
import {Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {IconCross, IconLocation, IconSuccess} from "@/components/ui/icons";
import {AddressDataField} from "@/lib/definitions";
import {formatAddress} from "@/lib/utils";
import {toast} from "sonner";
import {FormError} from "@/components/authentication/form-error";
import {useJsApiLoader} from "@react-google-maps/api";
// @ts-ignore
import {Library} from "@googlemaps/js-api-loader";
import {AddressDataFieldSchema} from "@/lib/schemas";

interface AddressSelectionProps {
    initialInput: AddressDataField | null;
    setAddress: (input: AddressDataField | null) => void;
    setAddressDialogOpen: (input: boolean) => void;
    isEditing: boolean;
}

const libraries: Library[] = ["places", "maps", "marker"];

export const AddressSelection: React.FC<AddressSelectionProps> = ({initialInput, setAddress, setAddressDialogOpen,  isEditing}) => {
    const [error, setError] = useState<string | undefined>();

    const [inputAddress, setInputAddress] = useState<AddressDataField | null>(initialInput);

    const [errorMap, setErrorMap] = useState<string | undefined>();

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string,
        libraries: libraries,
    });

    const inputRef = useRef<HTMLInputElement>(null);

    // map
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [isDraggable, setIsDraggable] = useState(false); // Control for marker draggability
    const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);


    useEffect(() => {
        if (!isLoaded || loadError) return;

        const token = new google.maps.places.AutocompleteSessionToken();

        const options = {
            token: token,
            componentRestrictions: { country: "nl" },
            fields: ["address_components", "geometry"],
        };

        const autocomplete = new google.maps.places.Autocomplete(
            inputRef.current as HTMLInputElement,
            options
        );
        autocomplete.addListener("place_changed", () => handlePlaceChanged({address: autocomplete}));

        if (!map || !marker) {
            const mapInstance = new google.maps.Map(mapRef.current as HTMLDivElement, {
                center: {
                    lat: inputAddress ? inputAddress.latitude : 50.85,
                    lng: inputAddress ? inputAddress.longitude : 5.6833
                },
                zoom: 16,
                mapId: '4504f8b37365c3d0',
                disableDefaultUI: true,  // Disables all default UI controls like zoom buttons
                zoomControl: false,      // Disable zoom control buttons
                streetViewControl: false, // Disable Street View (person drop/pegman)
                mapTypeControl: false,   // Disable map type (e.g., Satellite) control
                fullscreenControl: false, // Disable fullscreen control
                gestureHandling: "none",  // Disable zoom and pan gestures (scroll/drag)
            });

            const draggableMarker = new google.maps.marker.AdvancedMarkerElement({
                map: mapInstance,
                position: {
                    lat: inputAddress ? inputAddress.latitude : 50.85,
                    lng: inputAddress ? inputAddress.longitude : 5.6833
                },
                gmpDraggable: isDraggable,
                title: "This marker is draggable.",
            });


            setMap(() => mapInstance);
            setMarker(() => draggableMarker);
        }

    }, [isLoaded, loadError, map, marker]);



    const handlePlaceChanged = async ({ address }: { address: any }) => {
        if (!isLoaded || !address) return;

        const place = address.getPlace();
        if (!place || !place.geometry) {
            setInputAddress(null);
            return;
        }

        // Update the form data with the selected place
        formData(place);

        if (map && marker) {
            map.setCenter(place.geometry.location);
            marker.position = place.geometry.location;
            marker.gmpDraggable = false;
            setIsDraggable(false);

        }
    };

    const toggleDraggable = () => {
        if (marker && map && !isDraggable && inputAddress) {
            google.maps.event.clearInstanceListeners(marker);
            marker.gmpDraggable = true;
            setIsDraggable(true);

            const initialPosition = map.getCenter();

            map.setCenter({lat: marker.position?.lat, lng: marker.position?.lng} as google.maps.LatLngLiteral);

            setupMarkerListener(
                marker,
                initialPosition,
                setErrorMap,
                inputAddress
            );
        } else if (marker && map && isDraggable) {
            map.setCenter({lat: marker.position?.lat, lng: marker.position?.lng} as google.maps.LatLngLiteral);
        }
    };


    // @ts-ignore
    const formData = (data) => {
        const addressComponents = data?.address_components;

        const componentMap = {
            subpremise: "",
            premise: "",
            street_number: "",
            route: "",
            country: "",
            postal_code: "",
            administrative_area_level_2: "",
            administrative_area_level_1: "",
        };

        for (const component of addressComponents) {
            const componentType = component.types[0];
            if (componentMap.hasOwnProperty(componentType)) {
                // @ts-ignore
                componentMap[componentType] = component.long_name;
            }
        }

        const latitude = data?.geometry?.location?.lat();
        const longitude = data?.geometry?.location?.lng();


        setInputAddress({
            route: componentMap.route,
            street_number: componentMap.street_number,
            sub_premise: componentMap.subpremise,
            premise: componentMap.premise,
            country: componentMap.country,
            zip_code: componentMap.postal_code,
            city: componentMap.administrative_area_level_2,
            state: componentMap.administrative_area_level_1,
            latitude: latitude,
            longitude: longitude,
        } as AddressDataField);
    };


    const [isLoading, setIsLoading] = useState(false);



    const SaveAddress = async () => {
        setIsLoading(true);
        if (inputAddress) {

            const response = AddressDataFieldSchema.safeParse(inputAddress);

            if (!response.success) {
                setError(response.error.errors[0].message);
                setIsLoading(false);
                return;
            }


            setAddress(inputAddress);
            setAddressDialogOpen(false);

            toast.success(
                <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                    <IconSuccess color={"primary"} className={"w-10 h-10"}/>

                    <div className={"flex flex-col"}>
                        <p className={"text-base font-bold"}>
                            {formatAddress(inputAddress)}
                        </p>
                        {isEditing ? (
                            <p className={"text-sm font-light"}>
                                Address was updated successfully
                            </p>
                        ) : (
                            <p className={"text-sm font-light"}>
                                Address was added successfully
                            </p>
                        )}
                    </div>
                </div>
            );
        } else {
            setError("Please enter a valid address.");
        }


        setIsLoading(false);
    };


    return (
        <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
            <div className={`flex flex-row justify-between items-center`}>
                <Button
                    className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                    onClick={() => setAddressDialogOpen(false)}
                >
                    <IconCross className={"w-8 h-8 cursor-pointer"}/>
                </Button>
                <p className={"text-xl"}>Address Selection</p>
                <div className="w-8 h-8 flex"></div>
            </div>
            <div className="flex flex-row w-full justify-center">
                <div className="flex flex-row items-center w-80 border-b border-1 px-3 rounded-lg">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 relative"/>
                    <input
                        type="text"
                        name="streetAddress"
                        ref={inputRef}
                        className={"h-10 w-80 select-none focus:outline-none"}
                        placeholder="Enter Street Address"
                        autoComplete={"off"}
                    />
                </div>
            </div>
            <FormError message={errorMap}/>
            <div ref={mapRef} style={{height: "200px", width: "100%"}} className={"rounded-lg"}/>

            <div className={" flex flex-row-reverse"}>
                <Button onClick={toggleDraggable} variant={"secondary"} className={"rounded-3xl w-28 px-0 items-center font-medium"}>
                    <IconLocation className={"w-6 h-6"}/>
                    Adjust Pin
                </Button>
            </div>

            <div className="grid font-light gap-4">
                <div className="grid grid-cols-2 gap-4">
                    {[
                        {label: 'Street Name', value: inputAddress?.route},
                        {label: 'House Number', value: inputAddress?.street_number},
                        {
                            label: 'Apt, Suite, etc',
                            value: `${inputAddress?.subPremise} ${inputAddress?.premise}`.trim(),
                        },
                        {label: 'City', value: inputAddress?.city},
                        {label: 'State/Province', value: inputAddress?.state},
                        {label: 'Zip/Postal code', value: inputAddress?.zipCode},
                        {label: 'Country', value: inputAddress?.country},
                    ].map((item, index) => (
                        <div key={index}>
                            <p>{item.label}</p>
                            <p className="font-medium">{item.value || 'unknown'}</p>
                            <hr className="border-1 border-gray-300 mr-6"/>
                        </div>
                    ))}
                </div>
            </div>
            <FormError message={error}/>
            <Button
                type={"button"}
                onClick={SaveAddress}
                className="rounded-lg h-14 text-lg"
                disabled={isLoading || !!loadError}
            >
                {isEditing ? "Update Address" : "Save Address"}
            </Button>
        </div>
    );
};

const setupMarkerListener = (marker: google.maps.marker.AdvancedMarkerElement,
                             initialPosition: google.maps.LatLng | undefined,
                             setErrorMap: (input: (string | undefined)) => void,
                             initialInput: AddressDataField) => {
    const maxLatDifference = 0.002;
    const maxLngDifference = 0.003;

    marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        const position = marker.position as google.maps.LatLng; // Get the marker's new position after drag
        const newLat = Number(position.lat);
        const newLng = Number(position.lng);

        // Check if the marker has moved too far from its initial position
        if (initialPosition) {
            const lat = Number(initialPosition.lat());
            const lng = Number(initialPosition.lng());
            const latDiff = Math.abs(newLat - lat);
            const lngDiff = Math.abs(newLng - lng);
            console.log(latDiff);
            console.log(lngDiff);
            if (latDiff > maxLatDifference || lngDiff > maxLngDifference) {
                // If marker moved too far, set it back to the initial position or within the allowed range
                setErrorMap("Marker cannot be moved too far from the initial position.");
                marker.position = {
                    lat: lat,
                    lng: lng,
                };
            } else {
                initialInput.latitude = Number(position.lat);
                initialInput.longitude = Number(position.lng);
                setErrorMap(undefined);
            }
        } else {
            setErrorMap("Something went wrong. Please reload the page.");
        }
    });
};
