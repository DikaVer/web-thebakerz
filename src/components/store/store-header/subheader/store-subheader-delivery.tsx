"use client";

import React, { useState, useEffect } from "react";
import {
    Button,
    ButtonGroup,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Input,
    Spacer,
    Textarea,
    addToast,
    Select,
    SelectItem,
    Card,
    CardBody,
    Progress,
    Divider
} from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import { Icon } from "@iconify/react";
import { CalendarDateTime, CalendarDate, now } from "@internationalized/date";
import { useStore } from "@/components/providers/store-provider";
import { updateOrderTime, updateDeliveryAddress } from "@/app/(store)/[id]/actions";
import { parseDateParams, parseDateTime } from "@/components/store/store-header/calendar/calendar-params";
import { IconLocation } from "@/components/ui/icons";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { formatDate, SmartDatetimeInput } from "@/components/store/store-header/calendar/smart-calendar";
import { useTranslations } from "next-intl";

const LocationMap = dynamic(
    () => import("@/components/store/store-header/subheader/location-map"),
    { ssr: false }
);

interface StoreSubHeaderDeliveryProps {
    dateParam: string | null;
    timeParam: string | null;
    setSelectedDateGlobal?: (date: CalendarDateTime | CalendarDate | undefined) => void;
}

export function StoreSubHeaderDelivery({ dateParam, timeParam, setSelectedDateGlobal }: StoreSubHeaderDeliveryProps) {
    const { store } = useStore();
    const { session } = useSession();
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const { theme } = useTheme();
    const t = useTranslations("app/(store)/components/store-subheader");
    
    const [selectedDate, setSelectedDate] = useState<CalendarDateTime | CalendarDate | undefined>(
        parseDateParams(`${dateParam} ${timeParam}`)
    );
    const [address, setAddress] = useState({
        street: "",
        houseNumber: "",
        city: "",
        zipCode: "",
        additionalInfo: ""
    });
    const [deliveryRegion, setDeliveryRegion] = useState<any>(null);
    const [isAddressValid, setIsAddressValid] = useState(false);
    const [isAddressValidating, setIsAddressValidating] = useState(false);
    const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);

    // Validate address form
    const validateAddress = () => {
        if (
            address.street.trim() !== "" &&
            address.houseNumber.trim() !== "" &&
            address.city.trim() !== "" &&
            address.zipCode.trim() !== ""
        ) {
            setIsAddressValid(true);
            return true;
        }
        setIsAddressValid(false);
        return false;
    };

    // Check if entered address is within delivery range
    const checkDeliveryRange = async () => {
        setIsAddressValidating(true);
        try {
            // Simulate API call to check if address is within delivery range
            // In a real implementation, you would make an API call to a geocoding service
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
            
            // Get the closest delivery region or null if not in range
            // This is a simplified example. In a real app, you'd calculate distances
            // between the address and store delivery regions
            const inRange = store.deliveryLocations.length > 0;
            
            if (inRange) {
                // For demo purposes, just take the first delivery region
                setDeliveryRegion(store.deliveryLocations[0]);
                setShowDeliveryInfo(true);
                
                addToast({
                    description: t("addressInRange"),
                    color: "success",
                    shouldShowTimeoutProgress: true,
                    timeout: 3000,
                });
            } else {
                setDeliveryRegion(null);
                addToast({
                    description: t("addressNotInRange"),
                    color: "danger",
                    shouldShowTimeoutProgress: true,
                    timeout: 3000,
                });
            }
        } catch (error) {
            console.error("Error checking delivery range:", error);
            addToast({
                description: t("errorCheckingAddress"),
                color: "danger",
                shouldShowTimeoutProgress: true,
                timeout: 3000,
            });
        } finally {
            setIsAddressValidating(false);
        }
    };

    const handleAddressSubmit = async () => {
        if (validateAddress()) {
            await checkDeliveryRange();
            onClose();
        } else {
            addToast({
                description: t("invalidAddressFields"),
                color: "warning",
                shouldShowTimeoutProgress: true,
                timeout: 3000,
            });
        }
    };

    const handleDateChange = async (newDate: CalendarDateTime | CalendarDate) => {
        if (newDate instanceof CalendarDate) {
            setSelectedDate(newDate);
        } else {
            const { date, time } = parseDateTime(newDate);
            if (date && time) {
                const parsedDate = parseDateParams(`${date} ${time}`);
                setSelectedDate(parsedDate);
                setSelectedDateGlobal && setSelectedDateGlobal(parsedDate);
                await updateOrderTime(store.id, date, time);
            }
            setSelectedDate(newDate);
        }
    };

    const formatFullAddress = () => {
        if (!isAddressValid) return "";
        return `${address.street} ${address.houseNumber}, ${address.zipCode} ${address.city}`;
    };

    return (
        <div className="flex flex-col w-full max-w-[440px]">
            <Spacer y={4} />
            
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row gap-x-4 items-center">
                    <IconLocation 
                        size={24}
                        primaryColor={`${theme === 'light' ? '#730c70' : '#a3a3a3'}`}
                        secondaryColor={`${theme === 'light' ? '#5d5d5b' : '#faf4d1'}`}
                    />
                    
                    {showDeliveryInfo ? (
                        <div className="flex flex-col gap-y-0">
                            <p className="text-sm text-text">
                                {formatFullAddress()}
                            </p>
                            {address.additionalInfo && (
                                <p className="text-xs text-default-600">
                                    {address.additionalInfo}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-y-0">
                            <p className="text-sm text-text">
                                {t("enterDeliveryAddressPrompt")}
                            </p>
                        </div>
                    )}
                </div>
                
                <Button 
                    size="sm"
                    color={showDeliveryInfo ? "default" : "primary"}
                    variant={showDeliveryInfo ? "light" : "solid"}
                    onPress={onOpen}
                >
                    {showDeliveryInfo ? t("changeAddress") : t("enterAddress")}
                </Button>
            </div>

            <Spacer y={4} />

            {showDeliveryInfo && deliveryRegion ? (
                <Card className="w-full">
                    <CardBody className="gap-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{t("deliveryDetails")}</span>
                        </div>
                        
                        <Divider />
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm">{t("deliveryArea")}:</span>
                            <span className="text-sm font-medium">{deliveryRegion.name}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm">{t("deliveryFee")}:</span>
                            <span className="text-sm font-medium">
                                €{(deliveryRegion.priceInCents / 100).toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm">{t("minimumOrder")}:</span>
                            <span className="text-sm font-medium">
                                €{(deliveryRegion.minOrderPriceInCents / 100).toFixed(2)}
                            </span>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div className="h-40 w-full rounded-medium border-1 overflow-hidden flex items-center justify-center bg-default-100">
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                        <Icon icon="solar:delivery-linear" width={32} height={32} className="text-default-400" />
                        <p className="text-sm text-default-600">
                            {t("enterAddressToSeeDeliveryOptions")}
                        </p>
                    </div>
                </div>
            )}

            {(session?.user?.role !== "bakerz" || session.store?.id !== store.id) && (
                <>
                    <Spacer y={4} />
                    <ButtonGroup
                        fullWidth
                        size="sm"
                        radius="md"
                        className="text-grayText"
                    >
                        <SmartDatetimeInput
                            schedule={store.schedule}
                            minValue={(() => {
                                return now("Europe/Amsterdam").add({ minutes: store.minTimeOrder || 2880 });
                            })()}
                            value={selectedDate}
                            onValueChange={handleDateChange}
                            placeholder={t("scheduleDeliveryTime")}
                        >
                            <Button
                                startContent={<Icon icon="solar:delivery-linear" width={24} />}
                                variant={selectedDate instanceof CalendarDateTime ? "bordered" : "solid"}
                                className={`${
                                    selectedDate instanceof CalendarDateTime ? "text-default-600" : "text-white bg-gradient-primary"
                                } text-sm`}
                                onPress={() =>
                                    addToast({
                                        description: t("deliveryTimeSelected"),
                                        color: "success",
                                        shouldShowTimeoutProgress: true,
                                        timeout: 1000,
                                    })
                                }
                                isDisabled={!showDeliveryInfo}
                            >
                                {selectedDate instanceof CalendarDateTime
                                    ? `${t("deliverAt")} ${formatDate(selectedDate)}`
                                    : t("selectDeliveryTime")}
                            </Button>
                        </SmartDatetimeInput>
                    </ButtonGroup>
                </>
            )}

            {/* Address Input Modal */}
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="lg" backdrop="blur">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {t("enterDeliveryAddress")}
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex gap-2">
                                    <Input
                                        label={t("street")}
                                        placeholder={t("enterStreet")}
                                        value={address.street}
                                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                        isRequired
                                        variant="bordered"
                                        className="flex-1"
                                    />
                                    <Input
                                        label={t("houseNumber")}
                                        placeholder={t("enterHouseNumber")}
                                        value={address.houseNumber}
                                        onChange={(e) => setAddress({ ...address, houseNumber: e.target.value })}
                                        isRequired
                                        variant="bordered"
                                        className="w-1/3"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        label={t("zipCode")}
                                        placeholder={t("enterZipCode")}
                                        value={address.zipCode}
                                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                                        isRequired
                                        variant="bordered"
                                        className="w-1/3"
                                    />
                                    <Input
                                        label={t("city")}
                                        placeholder={t("enterCity")}
                                        value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        isRequired
                                        variant="bordered"
                                        className="flex-1"
                                    />
                                </div>

                                <Textarea
                                    label={t("additionalInfo")}
                                    placeholder={t("enterAdditionalInfo")}
                                    value={address.additionalInfo}
                                    onChange={(e) => setAddress({ ...address, additionalInfo: e.target.value })}
                                    variant="bordered"
                                />

                                {isAddressValidating && (
                                    <div className="w-full pt-2">
                                        <Progress
                                            size="sm"
                                            isIndeterminate
                                            aria-label="Loading..."
                                            className="max-w-md"
                                        />
                                        <p className="text-sm text-default-600 mt-2">{t("validatingAddress")}</p>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    {t("cancel")}
                                </Button>
                                <Button color="primary" onPress={handleAddressSubmit} isLoading={isAddressValidating}>
                                    {t("confirm")}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}