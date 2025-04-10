"use client";
import React, {useMemo, useState} from "react";
import {Button, Divider, Spacer, useDisclosure,} from "@heroui/react";
import {useProductDialog} from "@/components/providers/product-provider";
import {formatCurrency} from "@/lib/utils";
import {useRouter, useSearchParams} from "next/navigation";
import {useStore} from "@/components/providers/store-provider";
import {CartItemRow} from "@/components/cart/cart-item";
import {useCart} from "@/components/providers/cart-provider";
import {useTranslations} from "next-intl";
import {Icon} from "@iconify/react";
import showErrorMessage from "@/components/toast/toast-error";
import {calculateTotals} from "@/lib/price/tax";
import {calculateItemTotalPrice} from "@/lib/helper/calculate-total-price-variants";
import {useDelivery} from "@/components/providers/delivery-provider";

const CartCheckout: React.FC<{ handleNext: () => void }> = ({ handleNext }) => {
    const {
        getProductDataById,
        handleOpen,
    } = useProductDialog();

    const { itemCount, cart, updateItem, removeItem } = useCart();
    const { onOpen} = useDisclosure();
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useStore();
    const { isDelivery, validationResult } = useDelivery();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryString = searchParams ? `?${searchParams.toString()}` : "";
    const t = useTranslations("app/(store)/components/checkout");

    // Compute totals
    const itemsArray = Object.values(cart).flatMap(
        (storeCart) => Object.values(storeCart)
    );

    const amount = itemsArray.reduce((sum, item) => {
        const productData = getProductDataById(item.product_id);
        return productData ? sum + calculateItemTotalPrice(item.variants, productData.price, item.quantity) : sum;
    }, 0);

    // Get delivery fee from the selected region if in delivery mode
    const deliveryFee = useMemo(() => {
        if (isDelivery && validationResult.deliveryRegion?.priceInCents) {
            return validationResult.deliveryRegion.priceInCents;
        }
        return 0;
    }, [isDelivery, validationResult]);

    // Get delivery fee from the selected region if in delivery mode
    const isStoreDelivery = useMemo(() => {
        if (isDelivery && validationResult.deliveryRegion?.isStoreDelivery) {
            return validationResult.deliveryRegion.isStoreDelivery;
        }
        return false;
    }, [isDelivery, validationResult]);

    // Calculate minimum order amount based on delivery region if applicable
    const minimumOrderAmount = useMemo(() => {
        if (isDelivery && validationResult.deliveryRegion?.minOrderPriceInCents) {
            return validationResult.deliveryRegion.minOrderPriceInCents;
        }
        return 1000; // Default minimum 10€ (in cents)
    }, [isDelivery, validationResult]);

    // Calculate totals with delivery fee
    const { 
        itemExclVat,
        deliveryFeeExclVat,
        serviceFeeExclVat,
        totalVat,
        totalInclVat 
    } = useMemo(() => {
        return calculateTotals(amount, !store.kor, deliveryFee, isStoreDelivery);
    }, [amount, store.kor, isDelivery, deliveryFee]);

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

    // Check if we can proceed with payment
    const canProceedToPayment = useMemo(() => {
        if (amount < minimumOrderAmount) {
            return false;
        }
        
        if (isDelivery) {
            return validationResult.isValid && validationResult.isInRange;
        }
        
        return true;
    }, [amount, minimumOrderAmount, isDelivery, validationResult]);

    // Message to show when user can't proceed
    const paymentBlockedMessage = useMemo(() => {
        if (amount < minimumOrderAmount) {
            return t("minimumAmount", { minOrder: formatCurrency(minimumOrderAmount) });
        }
        
        if (isDelivery && (!validationResult.isValid || !validationResult.isInRange)) {
            return t("invalidDeliveryAddress");
        }
        
        return "";
    }, [amount, minimumOrderAmount, isDelivery, validationResult, t]);

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
                            {t("addItem")}
                        </Button>
                    </div>
                    <Spacer y={2} />
                    <Divider />
                    {renderCartItems(isLoading, setIsLoading)}
                    <div className="py-4">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">{t("subtotal")}</span>
                            <span className="text-sm">{formatCurrency(itemExclVat)}</span>
                        </div>
                        {isDelivery && deliveryFeeExclVat > 0 &&
                            <div className="flex justify-between mt-2">
                                <span className="text-sm font-medium">{t("deliveryFee")}</span>
                                <span className="text-sm">{formatCurrency(deliveryFeeExclVat)}</span>
                            </div>
                        }
                        {serviceFeeExclVat > 0 &&
                            <div className="flex justify-between mt-2">
                                <span className="text-sm font-medium">{t("serviceFee")}</span>
                                <span className="text-sm">{formatCurrency(serviceFeeExclVat)}</span>
                            </div>
                        }
                        {totalVat > 0 &&
                            <div className="flex justify-between mt-2">
                                <span className="text-sm font-medium">{t("vatExclusive")}</span>
                                <span className="text-sm">{formatCurrency(totalVat)}</span>
                            </div>
                        }
                        <Spacer y={2} />
                        <Divider className="my-2" />
                        <Spacer y={4} />
                        <div className="flex justify-between">
                            <span className="text-base font-bold">{t("total")}</span>
                            <span className="text-base font-bold">{formatCurrency(totalInclVat)}</span>
                        </div>
                        {isDelivery && !validationResult.isInRange && (
                            <div className="mt-2 text-danger text-sm">
                                {validationResult.message || t("addressOutOfRange")}
                            </div>
                        )}
                        {isDelivery && !validationResult.isValid && (
                            <div className="mt-2 text-danger text-sm">
                                {t("invalidDeliveryAddress")}
                            </div>
                        )}
                        {isDelivery && minimumOrderAmount > 0 && amount < minimumOrderAmount && (
                            <div className="mt-2 text-danger text-sm">
                                {t("minimumOrderForDelivery", { amount: formatCurrency(minimumOrderAmount) })}
                            </div>
                        )}
                    </div>
                    <Button
                        isLoading={isLoading}
                        isDisabled={!canProceedToPayment}
                        className="w-full bg-gradient-primary text-2xl rounded-full text-white"
                        onPress={() => {
                            if (canProceedToPayment) {
                                setIsLoading(true);
                                router.push(`/${storeUrl}/pay`);
                                router.refresh();
                                handleNext();
                            } else {
                                showErrorMessage({error: paymentBlockedMessage});
                            }
                        }}
                    >
                        {t("pay")}
                    </Button>
                </>
            ) : (
                <div className="flex flex-col text-xs font-medium items-center my-2">
                    <p>{t("cartEmpty")}</p>
                    <p>{t("addItemsToStart")}</p>
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
                        {t("addItem")}
                    </Button>
                </div>
            )}
        </>
    );
};

export default CartCheckout;