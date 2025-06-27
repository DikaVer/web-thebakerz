"use client";
import { Icon } from "@iconify/react";
import React, {useEffect, useState, useMemo} from "react";
import {
    Button,
    Divider,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    Spacer,
    useDisclosure,
    ScrollShadow,
    cn,
} from "@heroui/react";
import { useMediaQuery } from "usehooks-ts";
import { useProductDialog } from "@/components/providers/product-provider";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/components/providers/store-provider";
import { CartItemRow } from "@/components/cart/cart-item";
import { useCart } from "@/components/providers/cart-provider";
import { useDelivery } from "@/components/providers/delivery-provider";
import { useTranslations } from "next-intl";
import {motion, useAnimation} from "framer-motion";
import { convertMinutesToTimeComponents, formatCurrency } from "@/lib/utils";
import clarity from "@microsoft/clarity";
import {exampleStore, MIN_ORDER_PRICE_IN_CENTS} from "@/lib/local-variables";
interface CartButtonProps {
    isMobileNavbar?: boolean;
}

const CartButton: React.FC<CartButtonProps> = ({
    isMobileNavbar = false
}) => {
    const {
        getProductDataById,
        handleOpen
    } = useProductDialog();

    const {
        isOpen,
        onOpen,
        onOpenChange,
        cart,
        updateItem,
        removeItem,
        validateRescueDealsQuantity,
        rescueDeals,
    } = useCart();

    
    const { isDelivery, validationResult, minLeadTimeProduct, isRescueDeal } = useDelivery();
    
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useStore();
    const router = useRouter();
    const t = useTranslations("app/(store)/components/cart");
    const storeUrl = store?.storeName ? store?.storeName : store?.id;
    const pathname = usePathname();

    // Auto-remove invalid rescue deal items
    useEffect(() => {
        if (isRescueDeal && rescueDeals) {
            const itemsArray = Object.values(cart).flatMap(
                (storeCart) => Object.values(storeCart)
            );

            itemsArray.forEach(async (item) => {
                const rescueDealProduct = rescueDeals.products?.find((p: any) => p.id === item.product_id);
                
                // Remove item if it's part of rescue deal but not selected or out of stock
                if (rescueDealProduct && (!rescueDealProduct.isSelected || rescueDealProduct.quantity === 0)) {
                    await removeItem(item);
                }
            });
        }
    }, [isRescueDeal, rescueDeals, cart, removeItem]);

    // Validate rescue deal quantities
    const rescueDealValidation = validateRescueDealsQuantity();

    const handleOpenDrawer = () => {
        clarity.upgrade("cart");
        clarity.event("cart_open");
        onOpen();
    }

    useEffect(() => {
        if (isOpen && pathname.includes("/checkout")) {
            onOpenChange();
        }
    }, [ pathname]);

    const renderCartItems = (isLoading: boolean, setIsLoading: (value: boolean) => void) => {
        const itemsArray = Object.values(cart).flatMap(
            (storeCart) => Object.values(storeCart)
        );

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

    // Calculate total price of all items in the cart
    const calculateTotalPrice = (): number => {
        let total = 0;
        Object.values(cart).forEach(storeCart => {
            Object.values(storeCart).forEach(item => {
                const productData = getProductDataById(item.product_id);
                
                if (productData) {
                    // Base price of product
                    if (isDelivery && !productData.isPostDelivery && validationResult?.deliveryRegion?.isPostDelivery) {
                        return;
                    }

                    // Skip items that are part of rescue deal but not selected or out of stock
                    if (isRescueDeal && rescueDeals) {
                        const rescueDealProduct = rescueDeals.products?.find((p: any) => p.id === item.product_id);
                        if (rescueDealProduct && (!rescueDealProduct.isSelected || rescueDealProduct.quantity === 0)) {
                            return; // Don't include in total
                        }
                    }

                    let itemPrice = productData.price;

                    // Check if this item is part of a rescue deal and apply discount
                    if (isRescueDeal && rescueDeals) {
                        const rescueDealProduct = rescueDeals.products?.find((p: any) => p.id === item.product_id);
                        if (rescueDealProduct && rescueDealProduct.isSelected) {
                            // Apply rescue deal discount
                            itemPrice = productData.price * (1 - rescueDealProduct.promotionPercent / 100);
                        }
                    }
                    
                    // Add variant costs if any
                    if (item.variants) {
                        item.variants.forEach(variant => {
                            if (variant.selectedItems) {
                                variant.selectedItems.forEach(option => {
                                    itemPrice += option.price || 0;
                                });
                            }
                        });
                    }
                    
                    // Multiply by quantity
                    total += itemPrice * item.quantity;
                }
            });
        });
        return total;
    };

    const totalPrice = calculateTotalPrice();
    const formattedTotalPrice = formatCurrency(totalPrice);
    
    const preOrderTime = useMemo(() => {
        if(isDelivery && validationResult.deliveryRegion?.minOrderTime) {
            const minLeadTime = minLeadTimeProduct || 0;
            const final = validationResult.deliveryRegion?.minOrderTime > minLeadTime ? validationResult.deliveryRegion?.minOrderTime : minLeadTime;
            return convertMinutesToTimeComponents(final);
        } else {
            const minLeadTime = minLeadTimeProduct || 0;
            const final = store.minTimeOrder > minLeadTime ? store.minTimeOrder : minLeadTime;
            return convertMinutesToTimeComponents(final);
        }
    }, [totalPrice, isDelivery, validationResult, minLeadTimeProduct, store]);

    // Calculate minimum order amount based on delivery region if applicable
    const minimumOrderAmount = useMemo(() => {
        if (isDelivery && validationResult.deliveryRegion?.ranges?.[0]?.minOrderPriceInCents) {
            return validationResult.deliveryRegion.ranges[0].minOrderPriceInCents;
        }
        return MIN_ORDER_PRICE_IN_CENTS; // Default minimum 10€ (in cents)
    }, [isDelivery, validationResult]);
    
    // Check if we can proceed to checkout
    const canProceedToCheckout = useMemo(() => {
        if (totalPrice < minimumOrderAmount) {
            return false;
        }

        if (isRescueDeal && !rescueDealValidation.isValid) {
            return false;
        }

        if (isDelivery) {
            return validationResult.isValid && validationResult.isInRange;
        } else {
            return true;
        }
    }, [totalPrice, minimumOrderAmount, isDelivery, validationResult, isRescueDeal, rescueDealValidation]);

    const controls = useAnimation();

    useEffect(() => {
        // Animate when totalPrice changes
        controls.start({
            scale: [1, 1.15, 1],
            transition: {
                duration: 0.5,
                times: [0, 0.2, 1],
                ease: "easeInOut"
            }
        });
    }, [totalPrice, controls]);

    return (totalPrice > 0 && ((!exampleStore.includes(store.id) && store.isStripeValid) || process.env.NODE_ENV === "development")) ? (
        <div className="flex flex-col w-full">
            <motion.div animate={controls} className="flex items-center w-full">
                <Button
                    aria-label="Open cart"
                    className={cn("bg-gradient-primary text-white flex items-center justify-between gap-2 px-3 py-2 rounded-full", isMobileNavbar && "w-full")}
                    onPress={handleOpenDrawer}
                    endContent={
                        isMobileNavbar && (
                            <Icon
                                icon={"solar:arrow-right-linear"}
                                height={24}
                                width={24}
                                className={cn("text-white")}
                            />
                        )
                    }   
                >
                <>
                    <Icon
                        icon={"solar:cart-linear"}
                        height={24}
                        width={24}
                        className={cn("text-white")}
                    />
                   
                    <span className="text-base font-medium">
                         {isMobileNavbar && "Next • "}{formattedTotalPrice}
                    </span>
                </>
               
                </Button>
            </motion.div>
            <Drawer
                isOpen={isOpen}
                placement={isMobile ? "bottom" : "right"}
                onOpenChange={onOpenChange}
                isDismissable={!isLoading}
                backdrop="blur"
                hideCloseButton={isLoading}
            >
                <DrawerContent>
                    {(onClose) => (
                        <>
                            {totalPrice > 0 ? (
                                <>
                                    <DrawerHeader className="flex flex-col">
                                        {!isMobile && <Spacer y={16} />}
                                        <p className="text-default-500 text-xs font-medium">
                                            {t("yourCartFrom")}
                                        </p>
                                        <p className="text-xl">{store.ownerName}</p>
                                        <Spacer y={4} />
                                        {totalPrice < minimumOrderAmount && (
                                            <div className="mb-2 text-danger text-sm">
                                                {t("minimumOrderForDelivery", { amount: formatCurrency(minimumOrderAmount) })}
                                            </div>
                                        )}
                                        {/* Rescue Deal Validation Warning */}
                                        {isRescueDeal && !rescueDealValidation.isValid && (
                                            <div className="mb-2 text-warning text-sm">
                                                Some items exceed rescue deal stock. Please reduce quantities.
                                            </div>
                                        )}

                                        {/* Pre-order time */}
                                        {!isRescueDeal && (
                                            <p className="mb-2 text-warning text-sm">
                                                {t("preOrderTime", { time: preOrderTime.formatted })}
                                            </p>
                                        )}
                                        <Button
                                            aria-label="Continue to checkout"
                                            isLoading={isLoading}
                                            isDisabled={!canProceedToCheckout}
                                            className="w-full bg-gradient-primary text-2xl rounded-full text-white"
                                            onPress={() => {
                                                setIsLoading(true);
                                                clarity.event("cart_checkout");
                                                const searchParams = new URLSearchParams();
                                                if (isRescueDeal) {
                                                    searchParams.set('rescue-deal', 'true');
                                                }
                                                if (isDelivery) {
                                                    searchParams.set('mode', 'delivery');
                                                } else {
                                                    searchParams.set('mode', 'pickup');
                                                }
                                                const checkoutUrl = `/${storeUrl}/checkout${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
                                                router.push(checkoutUrl);
                                                router.refresh();
                                            }}
                                        >
                                            {t("continue")}
                                        </Button>
                                    </DrawerHeader>
                                    <DrawerBody>
                                        <ScrollShadow className="max-h-full" hideScrollBar>
                                            <Divider />
                                            {renderCartItems(isLoading, setIsLoading)}
                                        </ScrollShadow>
                                    </DrawerBody>
                                </>
                            ) : (
                                <DrawerHeader className="flex flex-col text-xs font-medium items-center">
                                    {!isMobile && <Spacer y={16} />}
                                    <p>{t("cartEmpty")}</p>
                                    <p>{t("addItemsToStart")}</p>
                                    <Spacer y={48} />
                                </DrawerHeader>
                            )}
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    ) : (
        null
    );
};

export default CartButton;