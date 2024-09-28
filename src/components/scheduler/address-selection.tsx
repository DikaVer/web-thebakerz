import React, {useEffect, useRef, useState} from "react";
import {Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {IconArrow, IconLocation, IconSuccess} from "@/components/ui/icons";
import {AddressDataStoreField, AddressDataStorageField} from "@/lib/definitions";
import {toast} from "sonner";
import {FormError} from "@/components/authentication/form-error";
import {useJsApiLoader} from "@react-google-maps/api";
// @ts-ignore
import {Library} from "@googlemaps/js-api-loader";

interface AddressSelectionProps {
    checkoutData: AddressDataStorageField,
    updateCheckoutData: () => void;
    initialInput: AddressDataStoreField | null;
    setInputAddress: (input: AddressDataStoreField | null) => void;
    handleSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection") => void;
    isEditing: boolean;
}

const libraries: Library[] = ["places", "maps", "marker"];

export const AddressSelection: React.FC<AddressSelectionProps> = ({initialInput, setInputAddress, handleSchedulerView, checkoutData, updateCheckoutData, isEditing}) => {
    const [error, setError] = useState<string | undefined>();
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
        if (initialInput) {
            const mapInstance = new google.maps.Map(mapRef.current as HTMLDivElement, {
                center: {lat: initialInput.latitude, lng: initialInput.longitude},
                zoom: 16,
                mapId: '4504f8b37365c3d0',
                disableDefaultUI: true,  // Disables all default UI controls like zoom buttons
                zoomControl: false,      // Disable zoom control buttons
                streetViewControl: false, // Disable Street View (person drop/pegman)
                mapTypeControl: false,   // Disable map type (e.g., Satellite) control
                fullscreenControl: false, // Disable fullscreen control
                gestureHandling: "none",  // Disable zoom and pan gestures (scroll/drag)

                // styles: [
                //     {
                //         featureType: "poi", // Points of Interest
                //         elementType: "labels", // Hide labels for POIs
                //         stylers: [{visibility: "off"}] // Disable POI visibility
                //     },
                //     {
                //         featureType: "poi.business", // Specifically hide business-related POIs
                //         elementType: "all",
                //         stylers: [{visibility: "off"}]
                //     }
                // ]

            });

            const draggableMarker = new google.maps.marker.AdvancedMarkerElement({
                map: mapInstance,
                position: {lat: initialInput.latitude, lng: initialInput.longitude},
                gmpDraggable: isDraggable,
                title: "This marker is draggable.",
            });


            setMap(mapInstance);
            setMarker(draggableMarker);
        }
    }, []);


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

    }, [isLoaded, loadError]);


    const handlePlaceChanged = async ({ address }: { address: any }) => {
        if (!isLoaded || !address) return;

        const place = address.getPlace();
        if (!place || !place.geometry) {
            setInputAddress(null);
            return;
        }

        // Update the form data with the selected place
        formData(place);


        if (map && marker && initialInput) {
            map.setCenter(place.geometry.location);
            marker.position = place.geometry.location;
            marker.gmpDraggable = false;
            setIsDraggable(false);

        } else {
            handleSchedulerView("addressSelection");
        }
    };

    const toggleDraggable = () => {
        if (marker && map && !isDraggable && initialInput) {
            google.maps.event.clearInstanceListeners(marker);
            marker.gmpDraggable = true;
            setIsDraggable(true);

            const initialPosition = map.getCenter();

            map.setCenter({lat: marker.position?.lat, lng: marker.position?.lng} as google.maps.LatLngLiteral);

            setupMarkerListener(
                marker,
                initialPosition,
                setErrorMap,
                initialInput
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

        const formattedAddress = [
            componentMap.route,
            componentMap.street_number,
            componentMap.premise,
            componentMap.subpremise,
            componentMap.administrative_area_level_2
        ].filter(Boolean).join(' ').trim().replace(/\s+/g, ', ');

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
        } as AddressDataStoreField);
    };


    const [isLoading, setIsLoading] = useState(false);

    // State to store the textarea input
    const [deliveryNotes, setDeliveryNotes] = useState(initialInput?.deliveryNotes || '');

    // Function to handle changes in the textarea
    const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDeliveryNotes(event.target.value);
    };

    const SaveAddress = async () => {
        setIsLoading(true);
        const addressData = {
            ...initialInput,
            deliveryNotes: deliveryNotes,
        } as AddressDataStoreField;

        try {


            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/session/saveAddress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ addressData, checkoutData }),
            });

            const result = await response.json();

            if (response.ok) {
                // Update checkoutData on success
                checkoutData.shippingAddress = addressData;
                checkoutData.savedAddresses = {
                    ...checkoutData.savedAddresses,
                    [addressData.id]: addressData,
                };

                localStorage.setItem('shippingAddress', JSON.stringify(addressData));
                localStorage.setItem('savedAddresses', JSON.stringify({
                    ...checkoutData.savedAddresses,
                    [addressData.id]: addressData,
                }));
                updateCheckoutData();

                handleSchedulerView('scheduler');

                toast.success(
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconSuccess color={"primary"} className={"w-10 h-10"}/>

                        <div className={"flex flex-col"}>
                            <p className={"text-base font-bold"}>
                                {initialInput?.streetAddress}
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

                console.error('Failed to save address:', result.message);
                setError(`${result.message[0].message}`);
            }
        } catch (error) {
            console.error('Error saving address:', error);
            setError(`Error saving address`);
        } finally {
            setIsLoading(false);
        }
    };


    return !initialInput ? (
        <div className="flex flex-row w-full justify-center">
            <style>{`
        /* Hide the icon next to the autocomplete suggestions */
        .pac-icon { display: none !important; }
        
        /* Style the container to always stay on top */
        .pac-container {
            z-index: 9999 !important; /* Ensure it's on top of other elements */
            padding-top: 4px; /* Add some space at the top */
            padding-bottom: 4px; /* Add some space at the bottom */
        }

        /* Increase font size of the suggestions */
        .pac-item-query {
            font-size: 16px !important; /* Adjust to your preferred size */
        }

        /* Add some hover effect for a better user experience */
        .pac-item:hover {
            background-color: #f0f0f0; /* Optional: highlight item on hover */
        }

        /* You can also style the selected item */
        .pac-item-selected {
            background-color: #e0e0e0 !important;
        }
    `}</style>
            <div className="flex flex-row items-center w-80 border-b border-1 px-3 rounded-lg">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 relative"/>
                <input
                    type="text"
                    name="streetAddress"
                    ref={inputRef}
                    className={"h-10 w-full focus:outline-none"}
                    placeholder="Enter Street Address"
                    autoComplete={"off"}
                    required
                />
            </div>
        </div>
    ) : (
        <div className={"grid gap-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-[5%] p-6"}>
            <div className={`flex flex-row justify-between items-center`}>
                <Button
                    className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                    onClick={() => handleSchedulerView("scheduler")}
                >
                    <IconArrow className={"w-8 h-8 cursor-pointer"}/>
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
                        required
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
                        {label: 'Street Name', value: initialInput.route},
                        {label: 'House Number', value: initialInput.street_number},
                        {
                            label: 'Apt, Suite, etc',
                            value: `${initialInput.sub_premise} ${initialInput.premise}`.trim(),
                        },
                        {label: 'City', value: initialInput.city},
                        {label: 'State/Province', value: initialInput.state},
                        {label: 'Zip/Postal code', value: initialInput.zip_code},
                        {label: 'Country', value: initialInput.country},
                    ].map((item, index) => (
                        <div key={index}>
                            <p>{item.label}</p>
                            <p className="font-medium">{item.value || 'unknown'}</p>
                            <hr className="border-1 border-gray-300 mr-6"/>
                        </div>
                    ))}
                </div>
                <p>Additional Delivery Notes</p>
                <textarea
                    placeholder="Write additional information here (max 200 characters)"
                    className="h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    maxLength={200}
                    style={{resize: "none"}}
                    value={deliveryNotes}
                    onChange={handleNotesChange} // Update state on change
                ></textarea>
            </div>
            <FormError message={error}/>
            <Button
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
                             initialInput: AddressDataStoreField) => {
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
