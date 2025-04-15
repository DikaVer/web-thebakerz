"use client";
import React, { useState } from "react";
import {
    Button,
    Divider,
    Spacer
} from "@heroui/react";
import { useProductDialog } from "@/components/providers/product-provider";
import {formatCurrency} from "@/lib/utils";
import { useStore } from "@/components/providers/store-provider";
import {CartItemRow} from "@/components/cart/cart-item";
import {useCart} from "@/components/providers/cart-provider";
import {useTranslations} from "next-intl";
import {calculateTotals} from "@/lib/price/tax";
import {calculateItemTotalPrice} from "@/lib/helper/calculate-total-price-variants";


const CartOrder: React.FC<{ handleNext: () => void }> = ({ handleNext }) => {
    const t = useTranslations("app/(store)/components/orders/add");

    const {
        getProductDataById,
        handleOpen,
    } = useProductDialog();

    const { store } = useStore();

    const {
        itemCount,
        cart,
        updateItem,
        removeItem,
    } = useCart();
    const [isLoading, setIsLoading] = useState(false);

    // Compute totals
    const itemsArray = Object.values(cart).flatMap(
        (storeCart) => Object.values(storeCart)
    );
    const amount = itemsArray.reduce((sum, item) => {
        const productData = getProductDataById(item.product_id);
        return productData ? sum + calculateItemTotalPrice(item.variants, productData.price, item.quantity) : sum;
    }, 0);

    const { 
        itemExclVat,
        itemVat,
        totalInclVat 
    } = calculateTotals(amount, !store.kor, 0, false);


    const renderCartItems = (isLoading: boolean, setIsLoading: (value: boolean) => void) => {
        return itemsArray.map((item) => {
            const productData = getProductDataById(item.product_id);
            if (!productData) return null;
            return (
                <CartItemRow
                    key={item.id}
                    item={item}
                    productData={productData}
                    updateItem={updateItem}
                    removeItem={removeItem}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    handleOpen={handleOpen}
                    isBakerzOrder={true}
                />
            );
        });
    };

    return (
        <>
            {itemCount !== 0 ? (
                <>
                    <Spacer y={2} />
                    <Divider />
                    {renderCartItems(isLoading, setIsLoading)}
                    <div className="py-4">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">{t("subtotal")}</span>
                            <span className="text-sm">{formatCurrency(itemExclVat)}</span>
                        </div>
                        {itemVat > 0 &&
                            <div className="flex justify-between mt-2">
                                <span className="text-sm font-medium">{t("vatExclusive")}</span>
                                <span className="text-sm">{formatCurrency(itemVat)}</span>
                            </div>
                        }
                        <Spacer y={2} />
                        <Divider className="my-2" />
                        <Spacer y={4} />
                        <div className="flex justify-between">
                            <span className="text-base font-bold">{t("total")}</span>
                            <span className="text-base font-bold">{formatCurrency(totalInclVat)}</span>
                        </div>
                    </div>
                    <Button
                        isLoading={isLoading}
                        className="w-full bg-gradient-primary text-2xl rounded-full text-white"
                        onPress={() => {
                            setIsLoading(true);
                            handleNext();
                        }}
                    >
                        {t("saveCartDetails")}
                    </Button>
                </>
            ) : (
                <div className="flex flex-col text-xs font-medium items-center my-2">
                    <p>{t("cartEmpty")}</p>
                    <p>{t("addItemsToStart")}</p>
                    <Spacer y={4} />
                </div>
            )}
        </>
    );
};

export default CartOrder;