"use client";
import React, { useState } from "react";
import {
    Button,
    Divider,
    Spacer,
    useDisclosure,
} from "@heroui/react";
import { useProductDialog } from "@/components/providers/product-provider";
import { calculateTax, formatCurrency } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/components/providers/store-provider";
import { CartItemRow } from "@/components/cart/cart-item";
import { useCart } from "@/components/providers/cart-provider";
import { useTranslations } from "next-intl";
import {Icon} from "@iconify/react";
import showErrorMessage from "@/components/toast/toast-error";
import {calculatePlatformFee, calculateTotals} from "@/lib/price/tax";

const CartCheckout: React.FC<{ handleNext: () => void }> = ({ handleNext }) => {
    const {
        getProductDataById,
        handleOpen,
    } = useProductDialog();

    const { itemCount, cart, updateItem, removeItem } = useCart();
    const { onOpen} = useDisclosure();
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryString = searchParams ? `?${searchParams.toString()}` : "";
    const t = useTranslations("TheBakerz");

    // Compute totals
    const itemsArray = Object.values(cart).flatMap(
        (storeCart) => Object.values(storeCart)
    );

    const amount = itemsArray.reduce((sum, item) => {
        const productData = getProductDataById(item.product_id);
        return productData ? sum + productData.price * item.quantity : sum;
    }, 0);


    const { vat, subtotal, total } = calculateTotals(amount, !store.kor);

    const { platform_fee } = calculatePlatformFee(total);


    const storeUrl = store?.storeName ? store?.storeName : store?.id;

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
                />
            );
        });
    };

    return (
        <>
            {itemCount !== 0 ? (
                <>
                    <div className="flex w-full justify-end">
                        <Button
                            isLoading={isLoading}
                            variant="bordered"
                            className="text-default-600 bg-gradient-card w-full max-w-52"
                            startContent={
                                !isLoading && (
                                    <Icon
                                        icon="solar:add-square-broken"
                                        width={24}
                                        className="text-default-500"
                                    />
                                )
                            }
                            onPress={() => {
                                router.push(`/${storeUrl}${queryString}`);
                                router.refresh();
                                setIsLoading(true);
                            }}
                        >
                            {t("Add Item")}
                        </Button>
                    </div>
                    <Spacer y={2} />
                    <Divider />
                    {renderCartItems(isLoading, setIsLoading)}
                    <div className="py-4">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">{t("Subtotal")}</span>
                            <span className="text-sm">{formatCurrency(subtotal)}</span>
                        </div>
                        {vat > 0 &&
                            <div className="flex justify-between mt-2">
                                <span className="text-sm font-medium">{t("VAT Exclusive")}</span>
                                <span className="text-sm">{formatCurrency(vat)}</span>
                            </div>
                        }
                        {/*{platform_fee > 0 &&*/}
                        {/*    <div className="flex justify-between mt-2">*/}
                        {/*        <span className="text-sm font-medium">{t("CustomerFee")}</span>*/}
                        {/*        <span className="text-sm">{formatCurrency(platform_fee)}</span>*/}
                        {/*    </div>*/}
                        {/*}*/}
                        <Spacer y={2} />
                        <Divider className="my-2" />
                        <Spacer y={4} />
                        <div className="flex justify-between">
                            <span className="text-base font-bold">{t("Total")}</span>
                            <span className="text-base font-bold">{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <Button
                        isLoading={isLoading}
                        className="w-full bg-gradient-primary text-2xl rounded-full text-white"
                        onPress={() => {
                            // console.log(total)
                            if (total >= 1000) {
                                setIsLoading(true);
                                router.push(`/${storeUrl}/pay`);
                                router.refresh();
                                handleNext();
                            } else {
                                showErrorMessage({error: t("Minimum Amount")});
                            }
                        }}
                    >
                        {t("Pay")}
                    </Button>
                </>
            ) : (
                <div className="flex flex-col text-xs font-medium items-center my-2">
                    <p>{t("Cart Empty")}</p>
                    <p>{t("Add Items To Start")}</p>
                    <Spacer y={4} />
                    <Button
                        isLoading={isLoading}
                        variant="bordered"
                        className="text-default-600 bg-gradient-card w-full max-w-52"
                        startContent={
                            !isLoading && (
                                <Icon
                                    icon="solar:add-square-broken"
                                    width={24}
                                    className="text-default-500"
                                />
                            )
                        }
                        onPress={() => {
                            router.push(`/${storeUrl}${queryString}`);
                            router.refresh();
                            setIsLoading(true);
                        }}
                    >
                        {t("Add Item")}
                    </Button>
                </div>
            )}
        </>
    );
};

export default CartCheckout;