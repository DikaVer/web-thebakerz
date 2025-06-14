'use client';
import React, { useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { InputStepper } from "@/components/store/product/dialog/button-stepper";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { Variant } from "@/lib/actions/cart";
import { usePathname } from "next/navigation";
import { useDelivery } from "@/components/providers/delivery-provider";

interface ProductActionsProps {
    price: number;
    quantity: number;
    setQuantity: (quantity: number) => void;
    minOrder: number;
    maxOrder?: number;
    isPostDelivery?: boolean;
    isUpdateMode: boolean;
    isBakerzStore?: boolean;
    onUpdate: () => void;
    onEditItem?: () => void;
    isLoading: boolean;
    variants: Variant[];
}

export const ProductActions: React.FC<ProductActionsProps> = ({
    price,
    quantity,
    setQuantity,
    minOrder,
    maxOrder,
    isUpdateMode,
    isBakerzStore = false,
    isPostDelivery = false,
    onUpdate,
    onEditItem,
    isLoading,
    variants
}) => {
    const t = useTranslations("app/(store)/components/product-page");
    const totalPrice = formatCurrency((price + variants.reduce((sum, variant) => sum + (variant.selectedItems ? variant.selectedItems.reduce((itemSum: number, item: {price?: number}) => itemSum + (item.price || 0), 0) : 0), 0)) * quantity);
    const pathname = usePathname();
    const isSearch = pathname.includes("search");
    const { isDelivery, validationResult } = useDelivery();
    const [showDeliveryMismatchModal, setShowDeliveryMismatchModal] = useState(false);

    // Check for postal delivery mismatch constraint
    const hasDeliveryMismatch = isDelivery && !isPostDelivery && validationResult?.deliveryRegion?.isPostDelivery;

    const handleUpdate = () => {
        // Check constraint before proceeding
        if (hasDeliveryMismatch) {
            setShowDeliveryMismatchModal(true);
            return;
        }
        
        // Proceed with normal update
        onUpdate();
    };

    return (
        <>
            <div className="flex items-center gap-4 w-full">
                {!isSearch ? (
                    <>
                        {isBakerzStore ? (
                            <Button
                                aria-label="Edit item"
                                className={"w-full bg-gradient-primary"}
                                color="primary"
                                onPress={onEditItem}
                                isLoading={isLoading}
                        >
                            {!isLoading && t("EditItem")}
                            </Button>
                        ) : (
                            <>
                                <InputStepper
                                    aria-label="Quantity"
                                    min={minOrder || 1}
                                    max={maxOrder || 999}
                                    value={quantity}
                                    onChange={setQuantity}
                                />
                                <Button
                                    aria-label="Add to cart"
                                    className={"w-full bg-gradient-primary"}
                                    color="primary"
                                    onPress={handleUpdate}
                                    isLoading={isLoading}
                                >
                                    {!isLoading ? (`${isUpdateMode ? t("Update") : t("Add")} • ${totalPrice}`) : t("Updating Cart")}
                                </Button>
                            </>
                        )}
                 </>
                ) : (
                    <Button
                        aria-label="View product"
                        className={"w-full bg-gradient-primary"}
                        color="primary"
                        onPress={handleUpdate}
                        isLoading={isLoading}
                    >
                        {!isLoading ? "View Product" : "Loading..."}
                    </Button>
                )}
            </div>

            {/* Postal Delivery Mismatch Modal */}
            <Modal
                isOpen={showDeliveryMismatchModal}
                onClose={() => setShowDeliveryMismatchModal(false)}
                placement="center"
                backdrop="blur"
                size="sm"
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <Icon icon="solar:warning-bold" width={24} className="text-warning" />
                        {t("PostalDeliveryMismatchTitle")}
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-sm">{t("PostalDeliveryMismatchMessage")}</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button 
                            aria-label="Close" 
                            className="bg-gradient-primary" 
                            color="primary" 
                            onPress={() => setShowDeliveryMismatchModal(false)}
                        >
                            {t("Close")}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}; 