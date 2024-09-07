import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import Shop from '@/components/cart/shop';

interface ShopListProps {
    cart: any;
    onClose: () => void;
}

const ShopList: React.FC<ShopListProps> = ({ cart, onClose }) => {
    return (
        <Accordion type="single" collapsible className="w-full">
            {Object.keys(cart).map((shopName, index) => (
                <Shop
                    key={index}
                    avatar_url={cart[shopName]['avatar_url']}
                    shopName={shopName}
                    value={`shop-${index}`}
                    initialItems={cart[shopName]['products']}
                    onClose={onClose}
                />
            ))}
        </Accordion>
    );
};

export default ShopList;
