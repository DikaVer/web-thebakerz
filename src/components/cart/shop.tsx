import React, { useState, useEffect, useCallback } from 'react';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import ShopItem from "@/components/cart/shop-item";
import {ShopItemField} from "@/lib/definitions";
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ShopProps {
    avatar_url: string;
    shopName: string;
    value: string;
    initialItems: ShopItemField[];
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ avatar_url, shopName, value, initialItems, onClose }) => {
    const [itemsList, setItemsList] = useState(initialItems);
    const [isHoveringStepper, setIsHoveringStepper] = useState(false);

    useEffect(() => {
        setItemsList(initialItems);
    }, [initialItems]);

    const deleteItem = useCallback((id: number) => {
        setItemsList(itemsList.filter(item => item.product_id !== id));
    }, [itemsList]);

    if (itemsList.length === 0) {
        return null;
    }

    return (
        <AccordionItem value={value}>
            <AccordionTrigger>
                <div className="-my-2 flex flex-row items-center space-x-3 justify-start">
                    <Image src={avatar_url} alt="Avatar" width={1920} height={1080} className="rounded-full relative h-14 w-14" />
                    <div className="grid grid-col gap-0">
                        <p className="flex text-base underline-on-hover">{shopName}</p>
                        <p className="flex text-sm text-grayText">{itemsList.length} items</p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="grid gap-y-4 w-full">
                <ScrollArea className="max-h-72">
                    <ul className="grid">
                        {Object.values(itemsList).map((item) => (
                            <ShopItem
                                key={item.product_id}
                                {...item}
                                onDelete={deleteItem}
                                onHoverChange={setIsHoveringStepper}
                                isHoveringStepper={isHoveringStepper}
                            />
                        ))}
                    </ul>
                </ScrollArea>
                <div className="grid gap-y-2 px-2">
                    <Button className="w-full py-0 px-4">
                        <div className="flex flex-row w-full justify-between items-center">
                            <p className="text-xl">Checkout</p>
                            <p className="text-lg">$12.48</p>
                        </div>
                    </Button>
                    <Button className="w-full py-0 px-4" onClick={onClose} variant="secondary">
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
