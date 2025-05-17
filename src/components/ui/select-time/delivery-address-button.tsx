import React, { useEffect, useRef, useState } from "react";
import { Button, ModalHeader, ModalBody, ModalContent, Modal, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDeliveryAddressModal } from "./use-delivery-address-modal";
import { AddressForm } from "@/components/store/store-header/subheader/address-form";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "usehooks-ts";
import { usePathname } from "next/navigation";
import { ExtendedDeliveryAddressRaw } from "@/app/(store)/[id]/delivery-actions";
import { getAddressFromCoordinates } from "@/lib/actions/delivery-address-actions";


export const DeliveryAddressButton: React.FC = () => {

    // Use media queries for consistent responsive behavior with the rest of the app
    const isSmallMobile = useMediaQuery("(max-width: 460px)");
    const fullMap = useMediaQuery("(max-width: 640px)");

    const t = useTranslations("delivery-button");
    const pathname = usePathname(); 
    const isCheckout = pathname.includes("/checkout");

    const { 
        isValidating,
        address,
        deliveryAddressModal,
        handleAddressSubmit
    } = useDelivery();
    
    // Track if we've already tried geolocation
    const hasTriedGeolocationRef = useRef(false);

    // Ask for user's geolocation when modal opens
    useEffect(() => {
        
        // Only try once per modal open session
        if (!hasTriedGeolocationRef.current && !address) {
            hasTriedGeolocationRef.current = true;
            
            // Request location permission from browser
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            // Get address details from coordinates using reverse geocoding
                            const latitude = position.coords.latitude;
                            const longitude = position.coords.longitude;
                            
                            // If you have a geocoding API service, call it here to convert lat/lng to address
                            // Example with Google Maps Geocoding API:
                            const data = await getAddressFromCoordinates(latitude, longitude);
                                
                            if (data.results && data.results.length > 0) {
                                const result = data.results[0];
                                
                                // Extract address components
                                const addressComponents = result.address_components || [];
                                const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
                                const streetName = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
                                const city = addressComponents.find((c: any) => c.types.includes('locality'))?.long_name || '';
                                const state = addressComponents.find((c: any) => c.types.includes('administrative_area_level_1'))?.short_name || '';
                                const country = addressComponents.find((c: any) => c.types.includes('country'))?.short_name || '';
                                const postalCode = addressComponents.find((c: any) => c.types.includes('postal_code'))?.long_name || '';
                                
                                // Create an address object that matches ExtendedDeliveryAddressRaw structure
                                const addressData: ExtendedDeliveryAddressRaw = {
                                    formattedAddress: result.formatted_address,
                                    street: streetName,
                                    houseNumber: streetNumber,
                                    city: city,
                                    zipCode: postalCode,
                                    country: country,
                                    coordinates: {
                                        lat: latitude,
                                        lng: longitude
                                    },
                                    placeId: result.place_id,
                                    // Optional fields
                                    administrativeAreas: [state].filter(Boolean),
                                    additionalInfo: ''
                                };
                                
                                // Use the handleAddressSubmit function to update the address
                                await handleAddressSubmit(addressData, false);
                                
                            }
                            
                        } catch (error) {
                            console.error("Error getting address from coordinates:", error);
                        }
                    },
                    (error) => {
                        console.error("Geolocation error:", error);
                        // Don't close the modal on error so user can enter address manually
                    }
                );
            }
        }

        // Reset the ref when the modal closes
        return () => {
            if (!deliveryAddressModal.isOpen) {
                hasTriedGeolocationRef.current = false;
            }
        };
    }, [deliveryAddressModal.isOpen, handleAddressSubmit, deliveryAddressModal, address]);

    // Determine display mode based on screen size
    const getButtonProps = () => {
        
        const startIcon = (

            <div className={'flex w-8 h-8 items-center'}>
                <Icon
                    icon="pepicons-print:map"
                    width={24}
                    className={cn(address ? "text-foreground " : "text-white",
                        ""
                    )}
                />
            </div>
        );
        
        const endIcon = (
            <Icon
                icon={address ? "solar:alt-arrow-down-linear" : ""}
                width={16}
                className={address ? "text-text" : "text-white"}
            />
        );
        
        const textContent = (
            <div className="w-full overflow-hidden">
                {address ? (
                    <span className="text-sm text-left overflow-hidden text-ellipsis whitespace-nowrap block">
                        {isCheckout ? `${address.formattedAddress}` : `${address.formattedAddress}`}
                    </span>
                ) : (
                    <span className="text-sm text-left overflow-hidden text-ellipsis whitespace-nowrap block">
                        {t("enterDeliveryAddressPrompt")}
                    </span>
                )}
            </div>
        );
        
        
        // Full button on larger screens
        return {
            content: textContent,
            startContent: startIcon,
            endContent: endIcon,
            isIconOnly: false,
            className: `w-full h-8 px-2 py-0 justify-between h-fit ${address ? "bg-background-secondary text-foreground" : "bg-gradient-primary text-white"}`
        };
        
    };

    const buttonProps = getButtonProps();

    return (
        <>
        <Button
            className={cn(buttonProps.className, "max-w-full")}
            variant="solid"
            isLoading={isValidating}
            startContent={!isValidating && buttonProps.startContent}
            endContent={!isValidating && buttonProps.endContent}
            isIconOnly={buttonProps.isIconOnly}
            onPress={deliveryAddressModal.onOpen}
        >
            <div className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {buttonProps.content}
            </div>
        </Button>

        <Modal 
                    isOpen={deliveryAddressModal.isOpen} 
                    onOpenChange={deliveryAddressModal.handleModalOpenChange}
                    placement={fullMap ? "top" : "center"}
                    backdrop="blur"
                    scrollBehavior="inside"
                    size={fullMap ? "5xl" : "3xl"}
                >
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-semibold">
                                            {t("whereToDeliver")}
                                        </h3>
                                    </div>
                                </ModalHeader>
                                <ModalBody className="p-0 p-2">
                                    <AddressForm 
                                        initialAddress={address ?? undefined}
                                        isValidating={isValidating}
                                        onAutocompleteFocus={deliveryAddressModal.handleAutocompleteFocus}
                                        onAutocompleteBlur={deliveryAddressModal.handleAutocompleteBlur}
                                        onSubmitStart={deliveryAddressModal.handleSubmitStart}
                                        onSubmitEnd={deliveryAddressModal.handleSubmitEnd}
                                        onClose={onClose}
                                    />
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
        </>
    );
}; 
