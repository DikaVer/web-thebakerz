"use client";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import {
    Button,
    Divider,
    Spacer,
    useDisclosure,
} from "@heroui/react";
import { useMediaQuery } from "usehooks-ts";
import { useProductDialog } from "@/components/providers/product-provider";
import { formatCurrency } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/components/providers/store-provider";
import {CartItemRow} from "@/components/cart/cart-item";
import {useCart} from "@/components/providers/cart-provider";


const CartCheckout: React.FC<{ handleNext: () => void }> = ({ handleNext }) => {
    const {
        getProductDataById,
        handleOpen,
    } = useProductDialog();

    const {
        itemCount,
        cart,
        updateItem,
        removeItem,
    } = useCart();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isLoading, setIsLoading] = useState(false);
    const { store } = useStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryString = searchParams ? `?${searchParams.toString()}` : "";

    const handleOpenDrawer = () => onOpen();

    // Compute totals
    const itemsArray = Object.values(cart).flatMap(
        (storeCart) => Object.values(storeCart)
    );
    const subtotal = itemsArray.reduce((sum, item) => {
        const productData = getProductDataById(item.product_id);
        return productData ? sum + productData.price * item.quantity : sum;
    }, 0);
    const serviceFee = subtotal * 0.05; // 5% service fee
    const total = subtotal + serviceFee;

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
                    <div className={'flex w-full justify-end'}>
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
                                router.push(`/${store.storeName}${queryString}`);
                                router.refresh();
                                setIsLoading(true);
                            }}
                        >
                            Add Item
                        </Button>
                    </div>
                    <Spacer y={2} />
                    <Divider />
                    {renderCartItems(isLoading, setIsLoading)}
                    <div className="py-4">
                        <div className="flex justify-between">
                            <span className="text-sm font-medium">Subtotal</span>
                            <span className="text-sm">{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span className="text-sm font-medium">Service Fee (5%)</span>
                            <span className="text-sm">{formatCurrency(serviceFee)}</span>
                        </div>
                        <Spacer y={2} />
                        <Divider className="my-2" />
                        <Spacer y={4} />
                        <div className="flex justify-between">
                            <span className="text-base font-bold">Total</span>
                            <span className="text-base font-bold">{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <Button
                        isLoading={isLoading}
                        className="w-full bg-gradient-primary text-2xl rounded-full text-white"
                        onPress={() => {
                            setIsLoading(true);
                            router.push(`/${store.storeName}/pay`);
                            router.refresh();
                            handleNext();
                        }}
                    >
                        Pay
                    </Button>
                </>
            ) : (
                <div className="flex flex-col text-xs font-medium items-center my-2">
                    <p>Your cart is empty</p>
                    <p>Add items to get started</p>
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
                            router.push(`/${store.storeName}${queryString}`);
                            router.refresh();
                            setIsLoading(true);
                        }}
                    >
                        Add Item
                    </Button>
                </div>
            )}
        </>
    );
};

export default CartCheckout;
