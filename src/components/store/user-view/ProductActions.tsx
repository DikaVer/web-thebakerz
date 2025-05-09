'use client';
import React from "react";
import { Button } from "@heroui/react";
import { InputStepper } from "@/components/store/product/dialog/button-stepper";
import { formatCurrency } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";
import { Variant } from "@/lib/actions/cart";

interface ProductActionsProps {
    price: number;
    quantity: number;
    setQuantity: (quantity: number) => void;
    minOrder: number;
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
    isUpdateMode,
    isBakerzStore = false,
    onUpdate,
    onEditItem,
    isLoading,
    variants
}) => {
    const t = useTranslations("app/(store)/components/product-page");
    const totalPrice = formatCurrency((price + variants.reduce((sum, variant) => sum + (variant.selectedItems ? variant.selectedItems.reduce((itemSum: number, item: {price?: number}) => itemSum + (item.price || 0), 0) : 0), 0)) * quantity);

    return (
        <div className="flex items-center gap-4 w-full">
            {isBakerzStore ? (
                <Button
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
                        min={minOrder || 1}
                        max={999}
                        value={quantity}
                        onChange={setQuantity}
                    />
                    <Button
                        className={"w-full bg-gradient-primary"}
                        color="primary"
                        onPress={onUpdate}
                        isLoading={isLoading}
                    >
                        {!isLoading ? (`${isUpdateMode ? t("Update") : t("Add")} • ${totalPrice}`) : t("Updating Cart")}
                    </Button>
                </>
            )}
        </div>
    );
}; 