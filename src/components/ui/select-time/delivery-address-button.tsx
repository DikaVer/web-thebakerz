import React from "react";
import { Button, ModalHeader, ModalBody, ModalContent, Modal, cn } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDeliveryAddressModal } from "./use-delivery-address-modal";
import { AddressForm } from "@/components/store/store-header/subheader/address-form";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "usehooks-ts";
import { usePathname } from "next/navigation";


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
        deliveryAddressModal
    } = useDelivery();

    
 

    // Determine display mode based on screen size
    const getButtonProps = () => {
        
        const startIcon = (

            <div className={'flex w-10 h-10 items-center'}>
                <Icon
                    icon="pepicons-print:map"
                    width={32}
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
            <div className="flex flex-col items-start min-w-0 flex-1">
                {address ? (
                    <>
                        <p className="text-sm truncate w-full text-left">
                            {isCheckout ? `${address.formattedAddress}` : `${address.formattedAddress}`}
                        </p>
                    </>
                ) : (
                    <p className="text-sm truncate w-full text-left">
                        {t("enterDeliveryAddressPrompt")}
                    </p>
                )}
            </div>
        );
        
        
        // Full button on larger screens
        return {
            content: textContent,
            startContent: startIcon,
            endContent: endIcon,
            isIconOnly: false,
            className: `w-full px-2 justify-between ${address ? "bg-background-secondary text-foreground" : "bg-gradient-primary text-white"}`
        };
        
    };

    const buttonProps = getButtonProps();

    return (
        <>
        <Button
            className={buttonProps.className}
            variant="solid"
            startContent={buttonProps.startContent}
            endContent={buttonProps.endContent}
            isIconOnly={buttonProps.isIconOnly}
            onPress={deliveryAddressModal.onOpen}
        >
            <div className="flex flex-col items-center justify-center break-words">
                {buttonProps.content}
            </div>
        </Button>

        <Modal 
                    isOpen={deliveryAddressModal.isOpen} 
                    onOpenChange={deliveryAddressModal.handleModalOpenChange}
                    placement={fullMap ? "bottom" : "center"}
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