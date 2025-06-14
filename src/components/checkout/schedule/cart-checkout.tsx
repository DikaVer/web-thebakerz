"use client";
import React, {useMemo, useState} from "react";
import {Button, Divider, Spacer} from "@heroui/react";
import {useProductDialog} from "@/components/providers/product-provider";
import {formatCurrency} from "@/lib/utils";
import {useRouter, useSearchParams} from "next/navigation";
import {useStore} from "@/components/providers/store-provider";
import {CartItemRow} from "@/components/cart/cart-item";
import {useCart} from "@/components/providers/cart-provider";
import {useTranslations} from "next-intl";
import {Icon} from "@iconify/react";
import {calculateTotals} from "@/lib/utils/price/price-calculations";
import {calculateItemTotalPrice} from "@/lib/utils/helper/calculate-total-price-variants";
import {useDelivery} from "@/components/providers/delivery-provider";
import {MIN_ORDER_PRICE_IN_CENTS} from "@/lib/local-variables";


const CartCheckout: React.FC<{ setTotalAmount: (amount: number) => void, handleNext: () => void }> = ({ setTotalAmount, handleNext }) => {
    const {
        getProductDataById,
        handleOpen,
    } = useProductDialog();

    const { itemCount, cart, updateItem, removeItem, validateRescueDealsQuantity, rescueDeals } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useStore();
    const { isDelivery, validationResult, isRescueDeal } = useDelivery();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryString = searchParams ? `?${searchParams.toString()}` : "";
    const t = useTranslations("app/(store)/components/checkout");

    // Validate rescue deal quantities
    const rescueDealValidation = validateRescueDealsQuantity();

    // Compute totals
    const itemsArray = Object.values(cart).flatMap(
        (storeCart) => Object.values(storeCart)
    );

    const amount = itemsArray.reduce((sum, item) => {
        const productData = getProductDataById(item.product_id);
        if (isDelivery && !productData?.isPostDelivery && validationResult?.deliveryRegion?.isPostDelivery) {
            return sum;
        }
        if (!productData) return sum;

        // Skip items that are part of rescue deal but not selected or out of stock
        if (isRescueDeal && rescueDeals) {
            const rescueDealProduct = rescueDeals.products?.find((p: any) => p.id === item.product_id);
            if (rescueDealProduct && (!rescueDealProduct.isSelected || rescueDealProduct.quantity === 0)) {
                return sum; // Don't include in total
            }
        }

        let itemPrice = productData.price;

        // Apply rescue deal discount if applicable
        if (isRescueDeal && rescueDeals) {
            const rescueDealProduct = rescueDeals.products?.find((p: any) => p.id === item.product_id);
            if (rescueDealProduct && rescueDealProduct.isSelected) {
                // Apply rescue deal discount to base product price
                itemPrice = productData.price * (1 - rescueDealProduct.promotionPercent / 100);
            }
        }

        return sum + calculateItemTotalPrice(item.variants, itemPrice, item.quantity);
    }, 0);

    // Get delivery fee from the selected region if in delivery mode
    const deliveryFee = useMemo(() => {
        if (isDelivery && validationResult.deliveryRegion?.ranges?.[0]?.deliveryPriceInCents) {
            return validationResult.deliveryRegion.ranges[0].deliveryPriceInCents;
        }
        return  0;
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
        if (isDelivery && validationResult.deliveryRegion?.ranges?.[0]?.minOrderPriceInCents) {
            return validationResult.deliveryRegion.ranges[0].minOrderPriceInCents;
        }
        return MIN_ORDER_PRICE_IN_CENTS; // Default minimum 10€ (in cents)
    }, [isDelivery, validationResult]);

    // Calculate totals with delivery fee
    const { 
        itemInclVat,
        deliveryFeeInclVat,
        serviceFeeInclVat,
        totalExclVat,
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
        
        if (isRescueDeal && !rescueDealValidation.isValid) {
            return false;
        }
        
        if (isDelivery) {
            return validationResult.isValid && validationResult.isInRange;
        }
        
        return true;
    }, [amount, minimumOrderAmount, isDelivery, validationResult, isRescueDeal, rescueDealValidation]);



    return (
        <>
            {itemCount !== 0 ? (
                <>
                    <div className="flex w-full justify-end">
                        <Button
                            aria-label="Add item"
                            isLoading={isLoading}
                            variant="bordered"
                            className="text-default-600 bg-gradient-card w-full max-w-52 border-small border-default-600"
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

                    {/* Rescue Deal Validation Warning */}
                    {isRescueDeal && !rescueDealValidation.isValid && (
                        <div className="p-3 rounded-lg bg-warning-50 border border-warning-200 mb-4">
                            <div className="flex items-start gap-2">
                                <Icon icon="solar:warning-bold" className="text-warning-500 mt-0.5" width={20} />
                                <div>
                                    <p className="text-sm font-medium text-warning-700">
                                        Rescue Deal Quantity Exceeded
                                    </p>
                                    <p className="text-xs text-warning-600 mt-1">
                                        The following items exceed available rescue deal stock:
                                    </p>
                                    <ul className="text-xs text-warning-600 mt-1 list-disc list-inside">
                                        {rescueDealValidation.exceedsQuantity.map((item) => {
                                            const productData = getProductDataById(item.product_id);
                                            return (
                                                <li key={item.id}>
                                                    {productData?.name} - In cart: {item.quantity}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="py-4">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">{t("subtotal")}</span>
                            <span className="text-sm">{formatCurrency(itemInclVat)}</span>
                        </div>
                        {/* {itemVat > 0 &&
                            <div className="flex justify-between mt-2">
                                <span className="text-sm font-medium">{t("vatExclusive")}</span>
                                <span className="text-sm">{formatCurrency(itemVat)}</span>
                            </div>
                        } */}
                        {isDelivery && deliveryFeeInclVat > 0 &&
                            <>    
                                <div className="flex justify-between mt-2">
                                    <span className="text-sm font-medium">{t("deliveryFee")}</span>
                                    <span className="text-sm">{formatCurrency(deliveryFeeInclVat)}</span>
                                </div>
                                {/* {deliveryVat > 0 &&
                                    <div className="flex justify-between mt-2">
                                        <span className="text-sm font-medium">{t("deliveryVat")}</span>
                                        <span className="text-sm">{formatCurrency(deliveryVat)}</span>
                                    </div>
                                } */}
                            </>
                        }
                        {serviceFeeInclVat > 0 &&
                            <>
                                <div className="flex justify-between mt-2">
                                    <span className="text-sm font-medium">{t("serviceFee")}</span>
                                    <span className="text-sm">{formatCurrency(serviceFeeInclVat)}</span>
                                </div>
                                {/* {serviceVat > 0 &&
                                    <div className="flex justify-between mt-2">
                                        <span className="text-sm font-medium">{t("vat21")}</span>
                                        <span className="text-sm">{formatCurrency(serviceVat)}</span>
                                    </div>
                                } */}
                            </>
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
                        aria-label="Save Cart Details"
                        isLoading={isLoading}
                        isDisabled={!canProceedToPayment}
                        className={`${
                            (!canProceedToPayment)
                                ? "bg-transparent text-default-600 "
                                : "bg-gradient-primary text-white border-none"
                        }  w-full`}
                        onPress={() => {
                            if (canProceedToPayment) {
                                setTotalAmount(totalInclVat);
                                handleNext();
                            } 
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
                    <Button
                        aria-label="Add item"
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