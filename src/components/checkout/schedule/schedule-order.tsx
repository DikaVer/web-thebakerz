/**
 * @fileoverview Order scheduling step of the store checkout flow.
 *
 * Lets the customer pick a delivery or pickup date and time, enter a delivery
 * address when in delivery mode, and add an order note that is persisted to
 * localStorage via a modal. Enables the continue button only when a valid
 * time is selected (and, for delivery, the address is in range).
 */
"use client";

import React, { useEffect, useState } from "react";
import {
    Button,
    cn,
    Spacer,
    Modal,
    ModalContent,
    ModalBody,
    ModalFooter,
    Textarea,
    useDisclosure,
} from "@heroui/react";

import { Icon, IconProps } from "@iconify/react";
import { CalendarDateTime } from "@internationalized/date";
import { DeliverySubheader } from "@/components/store/store-header/delivery-subheader";
import { useTranslations } from "next-intl";
import {useDelivery} from "@/components/providers/delivery-provider";
import { SelectTime } from "@/components/ui/select-time";
import { DeliveryAddressButton } from "@/components/ui/select-time/delivery-address-button";

interface StoreSubHeaderProps {
    handleNext: () => void;
}


export function ScheduleOrder({
                                  handleNext,
                              }: StoreSubHeaderProps) {
    const t = useTranslations("app/(store)/components/checkout");
    const {
        isDelivery,
        selectedDate,
        validationResult,
        isRescueDeal
    } = useDelivery();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [note, setNote] = useState<string>("");
    const [tempNote, setTempNote] = useState<string>("");

    useEffect(() => {
        const savedNote = localStorage.getItem("orderNote");
        if (savedNote) {
            setNote(savedNote);
        }
    }, []);

    const handleSaveNote = () => {
        localStorage.setItem("orderNote", tempNote);
        setNote(tempNote);
        onClose();
    };

    const isNext = isDelivery ? (selectedDate instanceof CalendarDateTime && validationResult?.isInRange) : (isRescueDeal || (selectedDate instanceof CalendarDateTime))

    return (
        <div className={'w-full flex flex-col items-center'}>
            <div className="flex flex-col w-full h-full justify-start">   
            {/* Enter Delivery Address Button */}
            {isDelivery && (
                    <DeliveryAddressButton/>
                )}
            </div>

            <div className={'flex flex-col w-full justify-center '}>
                <DeliverySubheader/>
            </div>
            <Spacer y={4} />
            {!isRescueDeal && <SelectTime />}
            <Spacer y={4} />
            {/* Note Section */}
            <div className="flex flex-col w-full mx-auto">
                <p className="font-medium">Notes</p>
                <div 
                    onClick={onOpen}
                    className={cn("cursor-pointer text-gray-500 font-light hover:underline", {
                        "text-gray-500": !note,
                        "text-gray-700": note,
                    })}
                >
                    {note ? note : "Leave instructions"}
                </div>
            </div>
            
            <Spacer y={4} />
            <div className={'flex flex-row w-full justify-center'}>
                <Button
                    aria-label="Save order details"
                    variant={'bordered'}
                    isDisabled={!isNext}
                    className={`${
                        (!isNext)
                            ? ""
                            : "bg-gradient-primary text-white border-none"
                    }  w-full`}
                    endContent={
                        <Icon icon={'solar:alt-arrow-right-linear'} width={24} />
                    }
                    onPress={() => {
                        if (isNext) {
                            handleNext();
                        }
                    }}
                >
                    {isDelivery ? t("saveDeliveryDetails") : t("savePickUpDetails")}
                </Button>
            </div>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalBody>
                        <Textarea
                            label="Special instructions"
                            placeholder="Enter any special instructions for your order"
                            value={tempNote}
                            variant="underlined"
                            onChange={(e) => setTempNote(e.target.value)}
                            minRows={4}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button aria-label="Cancel" variant="flat" onPress={onClose}>Cancel</Button>
                        <Button aria-label="Save order details" color="primary" onPress={handleSaveNote}>Save</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}