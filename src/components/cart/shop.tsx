import React, { useState, useEffect, useCallback } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import ShopItem from "@/components/cart/shop-item";
import { Button } from '@/components/ui/button';
import { CartItem } from "@/lib/definitions";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Avatar, AvatarIcon } from "@nextui-org/react";

interface ShopProps {
    avatar_url: string;
    shopName: string;
    storeId: string;
    value: string;
    productItems: CartItem[];
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ storeId, avatar_url, shopName, value, productItems, onClose }) => {
    const [total, setTotal] = useState(0);
    const [isHoveringStepper, setIsHoveringStepper] = useState(false);
    const [isItemsUpdating, setIsItemsUpdating] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        router.prefetch(`/${shopName}/checkout?${query.toString()}`);
    }, [router, shopName]); // Added 'router' and 'shopName' as dependencies

    const { removeFromCart, updateProductCart } = useCart();

    // Function to calculate the total sum
    const calculateTotal = useCallback((items: CartItem[] = productItems) => {
        return items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }, [productItems]); // Memoized with 'productItems' as dependency

    useEffect(() => {
        setIsItemsUpdating(true);
        setTotal(calculateTotal(productItems));
        setIsItemsUpdating(false);
    }, [productItems, calculateTotal]); // Added 'calculateTotal' as dependency

    const deleteItem = useCallback(async (id: string) => {
        setIsItemsUpdating(true);

        removeFromCart(storeId, id); // 'removeFromCart' and 'storeId' are used here

        setIsItemsUpdating(false);
    }, [removeFromCart, storeId]); // Added 'removeFromCart' and 'storeId' as dependencies

    const updateItem = useCallback((id: string, amount: number) => {
        setIsItemsUpdating(true);

        const product = productItems.find((item) => item.uniqueId === id);

        if (product) {
            updateProductCart(product, amount); // 'updateProductCart' is used here
        }

        setIsItemsUpdating(false);
    }, [productItems, updateProductCart]); // Added 'updateProductCart' as dependency

    if (!productItems || productItems.length === 0) {
        return null;
    }

    return (
        <AccordionItem value={value}>
            <AccordionTrigger>
                <div className="-my-2 flex flex-row items-center space-x-3 justify-start">
                    <div className="ml-2 relative w-14 h-14">
                        <Avatar
                            showFallback
                            src={avatar_url}
                            icon={<AvatarIcon />}
                            className={"w-14 h-14 items-center"}
                            classNames={{
                                base: "bg-gradient-to-br from-primary to-secondary",
                                icon: "text-black/80",
                            }}
                        />
                    </div>
                    <div className="grid grid-col gap-0">
                        <p className="flex text-lg font-medium underline-on-hover">
                            {shopName.charAt(0).toUpperCase() + shopName.slice(1)}
                        </p>
                        <p className="flex text-sm text-grayText">
                            {productItems.length} {productItems.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="grid gap-y-4 w-full">
                <ScrollShadow hideScrollBar className="max-h-72">
                    <ul className="grid">
                        {productItems.map((item) => (
                            <ShopItem
                                key={item.uniqueId}
                                {...item}
                                onDelete={deleteItem}
                                onUpdate={updateItem}
                                isUpdating={setIsItemsUpdating}
                                onHoverChange={setIsHoveringStepper}
                                isHoveringStepper={isHoveringStepper}
                            />
                        ))}
                    </ul>
                </ScrollShadow>
                <div className="grid gap-y-2 px-2">
                    <Button
                        className="w-full py-0 px-4"
                        variant={"default"}
                        disabled={isItemsUpdating}
                        onClick={() => {
                            const query = new URLSearchParams(window.location.search);
                            router.push(`/${shopName}/checkout?${query.toString()}`);
                            router.refresh();
                            setIsLoaded(true);
                            onClose();
                        }}
                        isLoading={isLoaded}
                    >
                        <div className="flex flex-row w-full justify-between items-center">
                            <p className="text-xl">Checkout</p>
                            <p className="text-lg">{formatCurrency(total)}</p>
                        </div>
                    </Button>
                    <Button
                        className="w-full py-0 px-4"
                        onClick={() => {
                            const query = new URLSearchParams(window.location.search);
                            router.push(`/${shopName}?${query.toString()}`);
                            router.refresh();
                            onClose();
                        }}
                        isLoading={isLoaded}
                        variant="secondary"
                    >
                        <div className="flex flex-row w-full justify-between items-center">
                            <p className="text-lg">Back to store</p>
                        </div>
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default Shop;