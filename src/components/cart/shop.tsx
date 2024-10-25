import React, { useState, useEffect, useCallback } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import ShopItem from "@/components/cart/shop-item";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {CartItem} from "@/lib/definitions";
import {useCart} from "@/components/providers/cart-provider";
import {formatCurrency} from "@/lib/utils";
import {useRouter} from "next/navigation";

interface ShopProps {
    avatar_url: string;
    shopName: string;
    storeId: string;
    value: string;
    productItems: CartItem[];
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({storeId, avatar_url, shopName, value, productItems, onClose }) => {
    const [total, setTotal] = useState(0);
    const [isHoveringStepper, setIsHoveringStepper] = useState(false);
    const [isItemsUpdating, setIsItemsUpdating] = useState(true);

    const router = useRouter();

    const { removeFromCart, updateProductCart } = useCart();

    // Function to calculate the total sum
    const calculateTotal = (items: CartItem[] = productItems) => {
        return items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    };

    useEffect(() => {
        setIsItemsUpdating(true);
        setTotal(calculateTotal(productItems));
        setIsItemsUpdating(false);
    }, [productItems]);

    const deleteItem = useCallback(async (id: string) => {
        setIsItemsUpdating(true);

        removeFromCart(storeId, id);

        setIsItemsUpdating(false);
    }, [productItems]);


    const updateItem = useCallback(async (id: string, amount: number) => {
        setIsItemsUpdating(true);

        const product = productItems.find((item) => item.uniqueId === id);

        if (product) {
            updateProductCart(product, amount);
        }

        setIsItemsUpdating(false);
    }, [productItems]);


    if (!productItems || productItems.length === 0) {
        return null;
    }

    return (
        <AccordionItem value={value}>
            <AccordionTrigger>
                <div className="-my-2 flex flex-row items-center space-x-3 justify-start">
                    <Image
                        src={avatar_url}
                        alt="Avatar"
                        width={128}
                        height={128}
                        className="rounded-full relative h-14 w-14"
                    />
                    <div className="grid grid-col gap-0">
                        <p className="flex text-lg font-medium underline-on-hover">{shopName.charAt(0).toUpperCase() + shopName.slice(1)}</p>
                        <p className="flex text-sm text-grayText">{Object.values(productItems).length} items</p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="grid gap-y-4 w-full">
                <ScrollArea className="max-h-72">
                    <ul className="grid">
                        {Object.values(productItems).map((item, index) => (
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
                </ScrollArea>
                <div className="grid gap-y-2 px-2">
                    <Button className="w-full py-0 px-4" disabled={isItemsUpdating}>
                        <div className="flex flex-row w-full justify-between items-center">
                            <p className="text-xl">Checkout</p>
                            <p className="text-lg">{formatCurrency(total)}</p>
                        </div>
                    </Button>
                    <Button className="w-full py-0 px-4"
                            onClick={() => {
                                const query = new URLSearchParams(window.location.search);
                                router.push(`/${shopName}?${query.toString()}`);
                                router.refresh();
                                onClose();
                            }}
                            variant="secondary">
                        <div className="flex flex-row w-full justify-between items-center">
                            <p className="text-black text-lg">Add items</p>
                        </div>
                    </Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
};

export default Shop;
