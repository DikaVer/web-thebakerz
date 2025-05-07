"use client";

import React from "react";
import { Alert, Modal, ModalContent, ModalBody, ModalHeader } from "@heroui/react";
import { now } from "@internationalized/date";
import { useTranslations } from "next-intl";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useStore } from "@/components/providers/store-provider";
import { AddressForm } from "../store/store-header/subheader/address-form";
import { useDeliveryAddressModal } from "./select-time/use-delivery-address-modal";
import { DeliveryAddressButton } from "./select-time/delivery-address-button";
import { DeliveryTimeSelection } from "./select-time/delivery-time-selection";
import { PickupTimeSelection } from "./select-time/pickup-time-selection";

export function SelectTime() {
    const t = useTranslations("app/(store)/components/store-subheader");
    const { 
        isDelivery,
        selectedDate,
        minLeadTimeProduct,
        isLoadingDate,
        isDateUpdating,
        isSubheaderLoaded,
        handleDateChange,
        showDeliveryInfo,
        modalSubmissionStatus,
        resetModalStatus,
        validationResult,
        isValidating,
        setSubheaderLoaded
    } = useDelivery();

    const { store } = useStore();

    const getDeliverySchedule = () => {
        if (validationResult.isInRange && validationResult.deliveryRegion?.deliverySchedule) {
            return validationResult.deliveryRegion.deliverySchedule;
        }
        return store.schedule;
    };

    const minValue = () => {
        if (minLeadTimeProduct && minLeadTimeProduct > store.minTimeOrder) {
            return now("Europe/Amsterdam").add({ minutes: minLeadTimeProduct });
        } else {
            return now("Europe/Amsterdam").add({ minutes: store.minTimeOrder || 10080 });
        }
    };

    
    const isSubmittingAddress = modalSubmissionStatus === 'validating' || modalSubmissionStatus === 'saving';
    const { 
        isOpen, 
        onOpen, 
        handleModalOpenChange, 
        handleAutocompleteFocus, 
        handleAutocompleteBlur 
    } = useDeliveryAddressModal(isSubmittingAddress);



    return isDelivery ? (
            <>
                <DeliveryAddressButton
                    showDeliveryInfo={showDeliveryInfo}
                    validationResult={validationResult}
                    isSubheaderLoaded={isSubheaderLoaded}
                    onOpen={onOpen}
                    t={t}
                />
                
                {validationResult?.deliveryRegion?.isPostDelivery && (
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

                <DeliveryTimeSelection
                    schedule={getDeliverySchedule()}
                    minValue={minValue}
                    selectedDate={selectedDate}
                    onValueChange={handleDateChange}
                    isDateUpdating={isDateUpdating}
                    isLoadingDate={isLoadingDate}
                    isPostDelivery={validationResult?.deliveryRegion?.isPostDelivery || false}
                    t={t}
                />

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
                                        validationError={validationResult?.message}
                                        onAutocompleteFocus={handleAutocompleteFocus}
                                        onAutocompleteBlur={handleAutocompleteBlur}
                                        onClose={onClose}
                                    />
                                </ModalBody>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </>
    ) : (
        <PickupTimeSelection
            schedule={store.schedule}
            minValue={minValue}
            selectedDate={selectedDate}
            onValueChange={handleDateChange}
            isDateUpdating={isDateUpdating}
            isLoadingDate={isLoadingDate}
            t={t}
        />
    );
}
