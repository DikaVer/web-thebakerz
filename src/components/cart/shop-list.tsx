import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import Shop from '@/components/cart/shop';
import {CartData} from "@/lib/definitions";

interface ShopListProps {
    cart: CartData;
    onClose: () => void;
}

const ShopList: React.FC<ShopListProps> = ({ cart, onClose }) => {
    return (
        <Accordion type="single" collapsible className="w-full pr-3">
            {Object.keys(cart).map((shopName, index) => (
                cart[shopName] && (
                    <Shop
                        key={index}
                        storeId={cart[shopName].storeId}
                        avatar_url={cart[shopName].image}
                        shopName={cart[shopName].nickname}
                        value={`shop-${index}`}
                        productItems={cart[shopName].products}
                        onClose={onClose}
                    />
                )
            ))}
        </Accordion>
    );
};

export default ShopList;
