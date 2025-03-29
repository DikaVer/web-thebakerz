"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Button,
    ButtonGroup,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    useDisclosure,
    Spacer,
    addToast,
    Card,
    CardBody,
    Spinner,
    Tooltip,
    Skeleton
} from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import { Icon } from "@iconify/react";
import { CalendarDateTime, CalendarDate, now } from "@internationalized/date";
import { useStore } from "@/components/providers/store-provider";
import { updateDeliveryTime, getDeliveryTime } from "@/app/(store)/[id]/actions";
import { updateDeliveryAddress, getCurrentDeliveryAddress } from "@/app/(store)/[id]/delivery-actions";
import { parseDateParams, parseDateTime } from "@/components/store/store-header/calendar/calendar-params";
import { IconLocation } from "@/components/ui/icons";
import { useTheme } from "next-themes";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";
import { useTranslations } from "next-intl";
import { useAddressValidation, AddressForm as AddressFormType } from "@/hooks/use-address-validation";
import { AddressForm } from "./address-form";
import { useDebouncedCallback } from "use-debounce";

import { checkDeliveryRange } from "@/lib/maps/google-maps";
import DeliveryInfo from "@/components/store/store-header/subheader/delivery-info";

interface StoreSubHeaderDeliveryProps {
    onLoadingStateChange?: (isLoaded: boolean) => void;
    setSelectedGlobalDate?: (date: CalendarDateTime | CalendarDate | undefined) => void;
}

export function StoreSubHeaderDelivery({ onLoadingStateChange, setSelectedGlobalDate }: StoreSubHeaderDeliveryProps) {
    const { store } = useStore();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { theme } = useTheme();
    const t = useTranslations("app/(store)/components/store-subheader");
    
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(undefined);
    const [isLoadingDate, setIsLoadingDate] = useState(true);

    const [address, setAddress] = useState<AddressFormType>({
        street: "",
        houseNumber: "",
        city: "",
        zipCode: "",
        additionalInfo: ""
    });

    const [isAddressLoading, setIsAddressLoading] = useState(false);
    const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
    const [isDateUpdating, setIsDateUpdating] = useState(false);

    // Use the address validation hook
    const {
        isValidating,
        validationResult,
        validateAddress
    } = useAddressValidation();

    const [modalSubmissionStatus, setModalSubmissionStatus] = useState<'idle' | 'validating' | 'saving' | 'success' | 'error'>('idle');

    // Load saved delivery date and time
    useEffect(() => {
        const loadSavedDateTime = async () => {
            try {
                setIsLoadingDate(true);
                
                // Only retrieve saved delivery time if we have a selected delivery region
                if (validationResult.isInRange && validationResult.deliveryRegion?.name) {
                    const { date, time } = await getDeliveryTime(store.id, validationResult.deliveryRegion.name);
                    
                    if (date && time) {
                        const parsedDate = parseDateParams(`${date} ${time}`);
                        setSelectedDate(parsedDate);
                        setSelectedGlobalDate?.(parsedDate);
                    }
                }
            } catch (error) {
                console.error('Error loading saved delivery time:', error);
            } finally {
                setIsLoadingDate(false);
            }
        };
        
        if (validationResult.isInRange && validationResult.deliveryRegion) {
            loadSavedDateTime();
        } else {
            setIsLoadingDate(false);
        }
    }, [store.id, validationResult.isInRange, validationResult.deliveryRegion]);

    // Load saved delivery address
    const loadSavedAddress = async () => {
        try {
            setIsAddressLoading(true);
            const savedAddress = await getCurrentDeliveryAddress(store.id);
            
            if (savedAddress) {
                setAddress({
                    street: savedAddress.street,
                    houseNumber: savedAddress.houseNumber,
                    city: savedAddress.city,
                    zipCode: savedAddress.zipCode,
                    additionalInfo: savedAddress.additionalInfo || "",
                });
                
                // If we have coordinates, we can assume this address was already validated
                if (savedAddress.coordinates && savedAddress.formattedAddress) {
                    setShowDeliveryInfo(true);
                    
                    // Find the delivery region for this address
                    const { lat, lng } = savedAddress.coordinates;
                    const { inRange, closestRegion } = checkDeliveryRange(
                        { lat, lng },
                        {
                            latitude: store.location.latitude,
                            longitude: store.location.longitude
                        },
                        store.deliveryRegions
                    );
                    
                    if (inRange && closestRegion) {
                        await validateAddress(
                            {
                                street: savedAddress.street,
                                houseNumber: savedAddress.houseNumber,
                                city: savedAddress.city,
                                zipCode: savedAddress.zipCode,
                                additionalInfo: savedAddress.additionalInfo || "",
                            },
                            {
                                latitude: store.location.latitude,
                                longitude: store.location.longitude
                            },
                            store.deliveryRegions
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error loading saved delivery address:', error);
        } finally {
            setIsAddressLoading(false);
        }
    };
    
    // Load saved address on component mount
    useEffect(() => {
        loadSavedAddress();
    }, [store.id]);

    // Notify parent when loading is complete
    useEffect(() => {
        if (onLoadingStateChange) {
            // Consider subheader loaded when address is loaded and date is loaded
            const isLoaded = !isAddressLoading && !isLoadingDate;
            
            // Use a slight delay to ensure UI stability
            const timer = setTimeout(() => {
                onLoadingStateChange(isLoaded);
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [isAddressLoading, isLoadingDate, onLoadingStateChange]);

    // Debounced function to save delivery address
    const debouncedSaveAddress = useDebouncedCallback(
      async (
        storeId: string, 
        addressData: AddressFormType,
        coordinates: { lat: number; lng: number } | undefined,
        formattedAddress: string | undefined,
        closeModal: () => void
      ): Promise<boolean> => {
        try {
            setModalSubmissionStatus('saving');
            
            const result = await updateDeliveryAddress(storeId, {
                formattedAddress: formattedAddress || "",
                street: addressData.street,
                houseNumber: addressData.houseNumber,
                city: addressData.city,
                zipCode: addressData.zipCode,
                additionalInfo: addressData.additionalInfo,
                coordinates: coordinates
            });
            
            if (result.error) {
                addToast({
                    description: result.error || t("errorSavingAddress"),
                    color: "danger",
                    shouldShowTimeoutProgress: true,
                    timeout: 3000,
                });
                setModalSubmissionStatus('error');
                return false;
            }
            
            addToast({
                description: t("addressInRange"),
                color: "success",
                shouldShowTimeoutProgress: true,
                timeout: 3000,
            });
            
            setModalSubmissionStatus('success');
            closeModal();
            return true;
        } catch (error) {
            console.error('Error saving delivery address:', error);
            addToast({
                description: t("errorSavingAddress"),
                color: "danger",
                shouldShowTimeoutProgress: true,
                timeout: 3000,
            });
            setModalSubmissionStatus('error');
            return false;
        }
    }, 500);

    // Handle address submission - keep the modal open until submission is successful
    const handleAddressSubmit = async (addressData: AddressFormType, modalCloseCallback: () => void): Promise<void> => {
        setAddress(addressData);
        setModalSubmissionStatus('validating');

        try {
            // Validate the address with Google Maps API
            const result = await validateAddress(
                addressData,
                {
                    latitude: store.location.latitude,
                    longitude: store.location.longitude
                },
                store.deliveryRegions
            );

            // Update UI based on validation result
            if (result.isValid && result.isInRange && result.deliveryRegion) {
                setShowDeliveryInfo(true);

                // Save the delivery address with debounce
                const saveSuccess = await debouncedSaveAddress(
                    store.id,
                    addressData,
                    result.validatedAddress?.coordinates,
                    result.formattedAddress,
                    modalCloseCallback
                );

                // Modal will be closed by debouncedSaveAddress if successful
                if (!saveSuccess) {
                    setModalSubmissionStatus('idle');
                }
            } else if (result.isValid && !result.isInRange) {
                addToast({
                    description: t("addressNotInRange"),
                    color: "danger",
                    shouldShowTimeoutProgress: true,
                    timeout: 3000,
                });
                setModalSubmissionStatus('error');
            } else {
                addToast({
                    description: result.error || t("errorCheckingAddress"),
                    color: "danger",
                    shouldShowTimeoutProgress: true,
                    timeout: 3000,
                });
                setModalSubmissionStatus('error');
            }
        } catch (error) {
            console.error('Error during address validation:', error);
            addToast({
                description: t("errorValidatingAddress"),
                color: "danger",
                shouldShowTimeoutProgress: true,
                timeout: 3000,
            });
            setModalSubmissionStatus('error');
        }
    };

    // Reset modal status when it's closed or opened
    const handleModalStateChange = useCallback((open: boolean) => {
        if (!open) {
            // Only reset after modal is fully closed
            setTimeout(() => {
                setModalSubmissionStatus('idle');
            }, 300);
        } else {
            setModalSubmissionStatus('idle');
        }
    }, []);


    const handleDateChange = async (newDate: CalendarDateTime | CalendarDate) => {
        if (newDate instanceof CalendarDate) {
            setSelectedDate(newDate);
            setSelectedGlobalDate?.(newDate);
        } else {
            const { date, time } = parseDateTime(newDate);
            if (date && time && validationResult.deliveryRegion?.name) {
                const parsedDate = parseDateParams(`${date} ${time}`);
                setSelectedDate(parsedDate);
                setSelectedGlobalDate?.(parsedDate);
                setIsDateUpdating(true);
                try {
                    // Update order time with the delivery region name
                    await updateDeliveryTime(store.id, date, time, validationResult.deliveryRegion?.name);
                    
                    addToast({
                        description: t("deliveryTimeSelected"),
                        color: "success",
                        shouldShowTimeoutProgress: true,
                        timeout: 1000,
                    });
                } catch (error) {
                    console.error('Error updating delivery time:', error);
                    addToast({
                        description: t("errorUpdatingOrderTime"),
                        color: "danger",
                        shouldShowTimeoutProgress: true,
                        timeout: 3000,
                    });
                } finally {
                    setIsDateUpdating(false);
                }
            }
            setSelectedGlobalDate?.(newDate);
            setSelectedDate(newDate);
        }
    };

    // Get the current delivery region's schedule for the SmartDatetimeInput
    const getDeliverySchedule = () => {
        if (validationResult.isInRange && validationResult.deliveryRegion?.deliverySchedule) {
            // Use the delivery region's schedule
            return validationResult.deliveryRegion.deliverySchedule;
        }
        // Fall back to store schedule
        return store.schedule;
    };

    // Updated loading state check
    const isLoading = isAddressLoading || isValidating;
    const isSubmittingAddress = modalSubmissionStatus === 'validating' || modalSubmissionStatus === 'saving';

    return (
        <div className="flex flex-col w-full h-full justify-between max-w-[440px]">
            
            <div className="flex flex-row w-full justify-between items-center cursor-pointer"
                onClick={onOpen}
            >
                <div className="flex flex-row gap-x-4 items-center flex-1 min-w-0">
                    {isLoading ? (
                        <Spinner size="sm" color="primary" />
                    ) : (
                        <IconLocation
                            size={24}
                            primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                            secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                            className="flex-shrink-0"
                        />
                    )}

                    {showDeliveryInfo && validationResult.isInRange && validationResult.formattedAddress ? (
                        <div className="flex flex-col gap-y-0 min-w-0 flex-1">
                            <p className="text-sm text-text truncate">
                                {`${address.street}, ${address.houseNumber}, ${address.zipCode}`}
                            </p>
                            {address.additionalInfo && (
                                <p className="text-xs text-default-600 truncate w-full">
                                    {address.additionalInfo}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-y-0 min-w-0">
                            <p className="text-sm text-text truncate">
                                {isLoading ? t("loadingAddress") : t("enterDeliveryAddressPrompt")}
                            </p>
                        </div>
                    )}
                </div>

                <Button
                    size="sm"
                    color={showDeliveryInfo ? "default" : "primary"}
                    variant={showDeliveryInfo ? "light" : "solid"}
                    onPress={onOpen}
                    isIconOnly
                    isLoading={isLoading}
                    className="flex-shrink-0 ml-2"
                >
                    {showDeliveryInfo ? <Icon icon="solar:pen-linear" width={24} /> : <Icon icon="solar:add-square-linear" width={24} />}
                </Button>
            </div>

            <Spacer y={4} />

            {showDeliveryInfo && validationResult.isInRange && validationResult.validatedAddress && validationResult.deliveryRegion ? (
                <DeliveryInfo
                    deliveryRegion={validationResult.deliveryRegion}
                />
            ) : (
                <div onClick={onOpen}>
                    <Card className="w-full overflow-hidden border border-border mb-4 cursor-pointer max-w-[440px]" shadow="none">
                        <CardBody className="p-6 flex flex-col items-center justify-center gap-3 w-[440px] max-w-[100%]">
                            {isLoading ? (
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
            {(showDeliveryInfo && validationResult.isInRange && validationResult.validatedAddress && validationResult.deliveryRegion) && (
                <>
                    <ButtonGroup
                        fullWidth
                        size="sm"
                        radius="md"
                        className="text-grayText"
                    >
                        <SmartDatetimeInput
                            schedule={getDeliverySchedule()}
                            minValue={(() => {
                                return now("Europe/Amsterdam").add({ minutes: store.minTimeOrder || 2880 });
                            })()}
                            value={selectedDate}
                            onValueChange={handleDateChange}
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
                                onPress={() =>
                                    addToast({
                                        description: t("deliveryTimeSelected"),
                                        color: "success",
                                        shouldShowTimeoutProgress: true,
                                        timeout: 1000,
                                    })
                                }
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
            )}

            {/* Address Input Modal */}
            <Modal 
                isOpen={isOpen} 
                onOpenChange={(open) => {
                    // Prevent closing during submission
                    if (!open && isSubmittingAddress) {
                        return;
                    }
                    onOpenChange();
                    handleModalStateChange(open);
                }} 
                placement="center" 
                size="lg" 
                backdrop="blur"
                isDismissable={!isSubmittingAddress}
                hideCloseButton={isSubmittingAddress}
            >
                <ModalContent>
                    {(closeModal) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {t("enterDeliveryAddress")}
                                {isSubmittingAddress && (
                                    <div className="flex items-center text-xs text-default-500 mt-1 gap-4">
                                        <Spinner size="sm" color="primary" className="mr-2" />
                                        {modalSubmissionStatus === 'validating' ? t("validatingAddress") : t("savingAddress")}
                                    </div>
                                )}
                            </ModalHeader>
                            <ModalBody>
                                <AddressForm
                                    initialAddress={address}
                                    onSubmit={(formData) => handleAddressSubmit(formData, closeModal)}
                                    isValidating={isSubmittingAddress}
                                    validationError={validationResult.error}
                                />
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}