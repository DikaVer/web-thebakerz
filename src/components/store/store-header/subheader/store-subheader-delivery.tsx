"use client";

import React, { useEffect, useState } from "react";
import {
    Button,
    ButtonGroup,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    useDisclosure,
    Spacer,
    Card,
    CardBody,
    Spinner,
    Skeleton,
    Alert
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { CalendarDateTime, CalendarDate, now } from "@internationalized/date";
import { useStore } from "@/components/providers/store-provider";
import { IconLocation } from "@/components/ui/icons";
import { useTheme } from "next-themes";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";
import { useTranslations } from "next-intl";
import { useDelivery } from "@/components/providers/delivery-provider";
import DeliveryInfo from "@/components/store/store-header/subheader/delivery-info";
import { AddressForm } from "@/components/store/store-header/subheader/address-form";

interface StoreSubHeaderDeliveryProps {
}

export function StoreSubHeaderDelivery({ }: StoreSubHeaderDeliveryProps) {
    const { store } = useStore();
    const { isOpen, onOpen, onOpenChange: originalOnOpenChange } = useDisclosure();
    const { theme } = useTheme();
    const t = useTranslations("app/(store)/components/store-subheader");
    
    const [isAutocompleteFocused, setIsAutocompleteFocused] = useState(false);
    
    const { 
        // Date selection
        selectedDate,
        isLoadingDate,
        isDateUpdating,
        isSubheaderLoaded,
        handleDateChange,
        
        // Address management
        showDeliveryInfo,
        modalSubmissionStatus,
        resetModalStatus,
        
        // Address validation
        validationResult,
        isValidating,
        
        // Set subheader loaded state
        setSubheaderLoaded
    } = useDelivery();
    
    // Helper function to get icon colors based on conditions
    const getIconColors = () => {
        const isActive = showDeliveryInfo && validationResult.isInRange;
        
        if (theme === 'light') {
            return {
                primary: isActive ? '#000' : '#fff',
                secondary: isActive ? '#000' : '#fff'
            };
        } else {
            return {
                primary: isActive ? '#ffffff' : '#ffffff',
                secondary: isActive ? '#ffffff' : '#ffffff'
            };
        }
    };

    // Notify parent when loading is complete
    useEffect(() => {

        // Use a slight delay to ensure UI stability
        const timer = setTimeout(() => {
            setSubheaderLoaded(!isDateUpdating || !isLoadingDate);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [isDateUpdating, isLoadingDate, setSubheaderLoaded]);

    // Determine if we're submitting the address
    const isSubmittingAddress = modalSubmissionStatus === 'validating' || modalSubmissionStatus === 'saving';
    
    // Get the current delivery region's schedule for the SmartDatetimeInput
    const getDeliverySchedule = () => {
        if (validationResult.isInRange && validationResult.deliveryRegion?.deliverySchedule) {
            // Use the delivery region's schedule
            return validationResult.deliveryRegion.deliverySchedule;
        }
        // Fall back to store schedule
        return store.schedule;
    };

    // Handle autocomplete focus/blur events
    const handleAutocompleteFocus = () => {
        setIsAutocompleteFocused(true);
        if(process.env.NODE_ENV === 'development') console.log('Address autocomplete focused');
    };
    
    const handleAutocompleteBlur = () => {
        // Small delay to prevent closing modal when clicking a suggestion
        setTimeout(() => {
            if (!document.querySelector('.pac-container:hover')) {
                setIsAutocompleteFocused(false);
                if(process.env.NODE_ENV === 'development') console.log('Address autocomplete blurred');
            }
        }, 200);
    };

    // --- Custom onOpenChange Handler ---
    const handleModalOpenChange = (open: boolean) => {
        if(process.env.NODE_ENV === 'development')  console.log(`Modal handleModalOpenChange called with open: ${open}, isSubmitting: ${isSubmittingAddress}, isAutocompleteFocused: ${isAutocompleteFocused}`);
        
        // Prevent closing if submitting or if autocomplete dropdown is focused
        if (!open && (isSubmittingAddress || isAutocompleteFocused)) {
            if(process.env.NODE_ENV === 'development') console.log('Preventing modal close due to submission or autocomplete focus.');
            return; // Prevent closing
        }

        // If closing is allowed, reset the autocomplete focus state
        if (!open) {
            setIsAutocompleteFocused(false); // Reset focus state on allowed close
            if(process.env.NODE_ENV === 'development') console.log('Resetting isAutocompleteFocused state as modal closes.');
        }

        // Call original handlers
        originalOnOpenChange(); // originalOnOpenChange doesn't take arguments
        resetModalStatus(open); // Reset delivery provider status
    };

    return (
        <div className="flex flex-col w-full h-full justify-between max-w-[440px]">
            
            <Button
                className={`w-full justify-between ${showDeliveryInfo && validationResult.isInRange ? "bg-transparent text-text" : "bg-gradient-primary text-white"}`}
                variant="solid"
                onPress={onOpen}
                startContent={
                    !isSubheaderLoaded ? (
                        <Spinner size="sm" color="current" />
                    ) : (
                        <IconLocation
                            size={24}
                            primaryColor={getIconColors().primary}
                            secondaryColor={getIconColors().secondary}
                            className="flex-shrink-0"
                        />
                    )
                }
                endContent={
                    <Icon 
                        icon={showDeliveryInfo ? "solar:pen-linear" : "solar:add-square-linear"} 
                        width={24} 
                        className={showDeliveryInfo && validationResult.isInRange ? "text-text" : "text-white"}
                    />
                }
            >
                <div className="flex flex-col items-start min-w-0 flex-1">
                    {showDeliveryInfo && validationResult.isInRange && validationResult.validatedAddress ? (
                        <>
                            <p className="text-sm truncate w-full text-left">
                                {`${validationResult?.validatedAddress?.street}, ${validationResult?.validatedAddress?.houseNumber}, ${validationResult?.validatedAddress?.zipCode}`}
                            </p>
                            {validationResult?.validatedAddress?.additionalInfo && (
                                <p className="text-xs truncate w-full text-left">
                                    {validationResult?.validatedAddress?.additionalInfo}
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm truncate w-full text-left">
                            {!isSubheaderLoaded ? t("loadingAddress") : t("enterDeliveryAddressPrompt")}
                        </p>
                    )}
                </div>
            </Button>

            <Spacer y={4} />

            {showDeliveryInfo && validationResult.isInRange && validationResult.validatedAddress && validationResult.deliveryRegion ? (
                <DeliveryInfo
                    deliveryRegion={validationResult.deliveryRegion}
                />
            ) : (
                <div onClick={onOpen}>
                    <Card className="w-full overflow-hidden border border-border cursor-pointer max-w-[440px]" shadow="none">
                        <CardBody className="p-6 flex flex-col items-center justify-center gap-3 w-[440px] max-w-[100%]">
                            {!isSubheaderLoaded ? (
                                <>
                                    <Spinner color="primary" size="lg" />
                                    <p className="text-sm text-default-500">{t("loadingDeliveryOptions")}</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-default-100 flex items-center justify-center">
                                        <Icon icon="solar:map-point-search-bold" width={24} className="text-default-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-default-700">{t("noDeliveryAddressYet")}</p>
                                        <p className="text-xs mt-1 text-default-500 max-w-64 mx-auto">{t("enterAddressToSeeDeliveryOptions")}</p>
                                    </div>
                                </>
                            )}
                        </CardBody>
                    </Card>
                </div>
            )}
            {(showDeliveryInfo && validationResult.isInRange && validationResult.validatedAddress && validationResult.deliveryRegion && !validationResult.deliveryRegion.isPostDelivery) ? (
                <>
                    <ButtonGroup
                        fullWidth
                        size="sm"
                        radius="md"
                        className="text-grayText mt-4"
                    >
                        <SmartDatetimeInput
                            schedule={getDeliverySchedule()}
                            minValue={(() => {
                                return now("Europe/Amsterdam").add({ minutes: validationResult.deliveryRegion.minOrderTime || 2880});
                            })()}
                            value={selectedDate}
                            onValueChange={(newDate) => handleDateChange(newDate)}
                            placeholder={t("scheduleDeliveryTime")}
                        >
                            <Button
                                startContent={
                                    isDateUpdating || isLoadingDate ? 
                                    <Spinner size="sm" color="current" /> : 
                                    <Icon icon="solar:scooter-linear" width={24} />
                                }
                                variant={selectedDate instanceof CalendarDateTime ? "bordered" : "solid"}
                                className={`${
                                    selectedDate instanceof CalendarDateTime ? "text-default-600" : "text-white bg-gradient-primary"
                                } text-sm transition-all duration-300`}
                                onPress={() => {}}
                                isDisabled={!showDeliveryInfo || isDateUpdating || isLoadingDate}
                            >
                                {isLoadingDate ? (
                                    <Skeleton className="h-4 w-32 rounded-lg" /> 
                                ) : selectedDate instanceof CalendarDateTime ? (
                                    `${t("deliverAt")} ${formatDate(selectedDate)}`
                                ) : (
                                    t("selectDeliveryTime")
                                )}
                            </Button>
                        </SmartDatetimeInput>
                    </ButtonGroup>
                </>
            ) : (
                <Alert
                    key={"Delivery Options Alert"}
                    className={'bg-primary-400 mt-4'}
                    classNames={{
                        description: 'text-white dark:text-default-500',
                        title: 'text-md'
                    }}
                    title={t("deliveryOptionsAlertTitle")}
                    description={t("deliveryOptionsAlertDescription", {store: store.ownerName})}
                    variant={"solid"}
                />
            )}
            
            {/* Address Modal */}
            <Modal 
                isOpen={isOpen} 
                onOpenChange={handleModalOpenChange}
                placement="center"
                backdrop="blur"
                scrollBehavior="inside"
                size="lg"
                classNames={{
                    base: "max-w-xl",
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-semibold">
                                        {validationResult?.validatedAddress?.formattedAddress ? t("editDeliveryAddress") : t("enterDeliveryAddress")}
                                    </h3>
                                </div>
                            </ModalHeader>
                            <ModalBody className="px-6 pb-6">
                                <AddressForm 
                                    initialAddress={validationResult?.validatedAddress}
                                    isValidating={isValidating || isSubmittingAddress}
                                    validationError={validationResult.message}
                                    onAutocompleteFocus={handleAutocompleteFocus}
                                    onAutocompleteBlur={handleAutocompleteBlur}
                                    onClose={onClose}
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}