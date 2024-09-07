import React from 'react';
import Stepper from '@/components/cart/stepper';
import Image from 'next/image';

interface ShopItemProps {
    product_id: number;
    name: string;
    price: number;
    image_url: string;
    amount: number;
    description?: string;
    rating?: string;
    onDelete: (id: number) => void;
    onHoverChange: (isHovering: boolean) => void;
    isHoveringStepper: boolean;
}

const ShopItem: React.FC<ShopItemProps> = ({ product_id, name, price, image_url, onDelete, onHoverChange, isHoveringStepper }) => (
    <>
        <li className={`flex flex-row rounded transition duration-500 ${!isHoveringStepper ? 'hover:bg-grayBg' : ''} cursor-pointer my-1`}>
            <div className="p-2">
                <div className="h-16 w-16">
                    <Image src={image_url} width={1920} height={1080} alt="Product" className="rounded-xl" />
                </div>
            </div>
            <div className="flex flex-col gap-0.5 justify-between p-1 w-full">
                <span className="text-base">{name}</span>
                <div className="flex flex-row justify-between items-end">
                    <p className="text-grayText text-base">{price}</p>
                    <Stepper onDelete={() => onDelete(product_id)} onHoverChange={onHoverChange} />
                </div>
            </div>
        </li>
        <hr className="scale-y-300 border-grayBg" />
    </>
);

export default ShopItem;
