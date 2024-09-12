import React, {useEffect, useRef, useState} from "react";
import {Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {IconArrow, IconLocation, IconSuccess} from "@/components/ui/icons";
import {useDebouncedCallback} from "use-debounce";
import {AddressDataField, CheckoutDataField} from "@/lib/definitions";
import {createNanoid} from "@/lib/utils";
import {toast} from "sonner";
import {FormError} from "@/components/authentication/form-error";
import {useJsApiLoader} from "@react-google-maps/api";
import {Library} from "@googlemaps/js-api-loader";

interface AddressSelectionProps {
    checkoutData: CheckoutDataField,
    setCheckoutData: (input: CheckoutDataField) => void,
    initialInput: AddressDataField | null;
    setInputAddress: (input: AddressDataField | null) => void;
    handleSchedulerView: (view: "scheduler" | "timeSelection" | "addressSelection") => void;
}

const libraries: Library[] = ["places", "maps", "marker"];

export const AddressSelection: React.FC<AddressSelectionProps> = ({initialInput, setInputAddress, handleSchedulerView, setCheckoutData, checkoutData}) => {
    const [error, setError] = useState<string | undefined>();

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


            const initialPosition = {lat: initialInput.latitude, lng: initialInput.longitude};

            // Define the allowed boundary in terms of latitude and longitude difference (e.g., max 0.01 degrees)
            const maxLatDifference = 0.01;
            const maxLngDifference = 0.01;

            // Add an event listener to check marker's position after drag
            draggableMarker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
                const position = draggableMarker.position as google.maps.LatLng; // Get the marker's new position after drag
                const newLat = Number(position.lat);
                const newLng = Number(position.lng);

                // Check if the marker has moved too far from its initial position
                const latDiff = Math.abs(newLat - initialPosition.lat);
                const lngDiff = Math.abs(newLng - initialPosition.lng);
                console.log(latDiff)
                console.log(lngDiff)
                if (latDiff > maxLatDifference || lngDiff > maxLngDifference) {
                    // If marker moved too far, set it back to the initial position or within the allowed range
                    console.log("Marker moved too far. Resetting to initial position.");
                    draggableMarker.position = {
                        lat: initialInput.latitude,
                        lng: initialInput.longitude,
                    }
                } else {
                    initialInput.latitude = Number(position.lat);
                    initialInput.longitude = Number(position.lng);
                    console.log(position.lat)
                    console.log(position.lng)
                }
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

    }, [isLoaded, loadError, initialInput]);


    // @ts-ignore
    const handleChange = useDebouncedCallback((event) => {
        const {name, value} = event.target;
        // @ts-ignore
        setInputAddress((values) => {
            return ({...values, [name]: value});
        });

    }, 500);


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
        } else {
            handleSchedulerView("addressSelection");
        }
    };

    const toggleDraggable = () => {
        if (marker) {
            marker.gmpDraggable = true;
            setIsDraggable(true);
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
            streetAddress: formattedAddress,
            route: componentMap.route,
            street_number: componentMap.street_number,
            subPremise: componentMap.subpremise,
            premise: componentMap.premise,
            country: componentMap.country,
            zipCode: componentMap.postal_code,
            city: componentMap.administrative_area_level_2,
            state: componentMap.administrative_area_level_1,
            latitude: latitude,
            longitude: longitude,
        } as AddressDataField);
    };


    const [isLoading, setIsLoading] = useState(false);

    // State to store the textarea input
    const [deliveryNotes, setDeliveryNotes] = useState("");

    // Function to handle changes in the textarea
    const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDeliveryNotes(event.target.value);
    };

    const SaveAddress = async () => {
        setIsLoading(true);
        const addressData = {
            id: createNanoid(10),
            ...initialInput,
            deliveryNotes: deliveryNotes,
        } as AddressDataField;

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
                setCheckoutData(checkoutData);

                handleSchedulerView('scheduler');

                toast.success(
                            <div className={"flex flex-row gap-x-7 justify-between items-center"}>
                                <IconSuccess  color={"primary"} className={"w-10 h-10"}/>
                                <p className={"text-base font-bold"}>
                                    {initialInput?.streetAddress}
                                </p>
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
                    onChange={handleChange}
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
                        onChange={handleChange}
                        className={"h-10 w-80 select-none focus:outline-none"}
                        placeholder="Enter Street Address"
                        autoComplete={"off"}
                        required
                    />
                </div>
            </div>
            <div ref={mapRef} style={{height: "200px", width: "100%"}} className={"rounded-lg"}/>

            <div className={" flex flex-row-reverse"}>
                <Button onClick={toggleDraggable} variant={"secondary"} className={"rounded-3xl w-28 px-0 items-center font-medium"}>
                    <IconLocation className={"w-6 h-6"}/>
                    Adjust Pin
                </Button>
            </div>

            <div className={"grid font-light gap-4"}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p>Street Name</p>
                        <p className={'font-medium'}>{initialInput.route || "unknown"}</p>
                        <hr className={"border-1 border-gray-300 mr-6"}/>
                    </div>
                    <div>
                        <p>House Number</p>
                        <p className={'font-medium'}>{initialInput.street_number || "unknown"}</p>
                        <hr className={"border-1 border-gray-300 mr-6"}/>
                    </div>
                    <div>
                        <p>Apt, Suite, etc</p>
                        <p className={'font-medium'}>{`${initialInput.subPremise} ${initialInput.premise}`.trim() || "unknown"}</p>
                        <hr className={"border-1 border-gray-300 mr-6"}/>
                    </div>
                    <div>
                        <p>City</p>
                        <p className={'font-medium'}>{initialInput.city || "unknown"}</p>
                        <hr className={"border-1 border-gray-300 mr-6"}/>
                    </div>
                    <div>
                        <p>State/Province</p>
                        <p className={'font-medium'}>{initialInput.state || "unknown"}</p>
                        <hr className={"border-1 border-gray-300 mr-6"}/>
                    </div>
                    <div>
                        <p>Zip/Postal code</p>
                        <p className={'font-medium'}>{initialInput.zipCode || "unknown"}</p>
                        <hr className={"border-1 border-gray-300 mr-6"}/>
                    </div>
                    <div>
                        <p>Country</p>
                        <p className={'font-medium'}>{initialInput.country || "unknown"}</p>
                        <hr className={"border-1 border-gray-300 mr-6"}/>
                    </div>
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
                Save Address
            </Button>
        </div>
);
};
