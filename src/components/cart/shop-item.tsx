import React, {useState} from 'react';
import Stepper from '@/components/cart/stepper';
import Image from 'next/image';
import {CartItem} from "@/lib/definitions";
import {formatCurrency} from "@/lib/utils";
import {useProductDialog} from "@/components/providers/product-provider";
import Skeleton from "react-loading-skeleton";

interface ShopItemProps extends CartItem {
    onDelete: (id: string) => void;
    onUpdate: (id: string, amount: number) => void;
    isUpdating: (isUpdating: boolean) => void;
    onHoverChange: (isHovering: boolean) => void;
    isHoveringStepper: boolean;
}

const ShopItem: React.FC<ShopItemProps> = ({
    uniqueId,
    id,
    description,
    price,
    name,
    category,
    store_id,
    quantity,
    image_url,
    onDelete,
    onUpdate,
    isUpdating,
    onHoverChange,
    isHoveringStepper,
}) => {
    // Divide the price by 100
    const displayPrice = formatCurrency((price * quantity));

    const { openProductDialogCart } = useProductDialog();
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <>
            <li
                className={`flex flex-row rounded transition duration-500 ${!isHoveringStepper ? 'hover:bg-grayBg' : ''} cursor-pointer my-1`}
                onClick={!isHoveringStepper ? () => openProductDialogCart(
                    {
                        id: id,
                        store_id: store_id,
                        category: category,
                        name: name,
                        description: description,
                        price: price,
                        image_url: image_url,
                        quantity: quantity,
                        uniqueId: uniqueId,
                    },
                ) : undefined}
            >
                <div className="p-2">
                    <div className="relative h-16 w-16">
                        {!isLoaded && <Skeleton height={"100%"}/>}
                        <Image
                            src={image_url}
                            alt={`Image of ${name}` }
                            fill
                            sizes="25vw"
                            style={{objectFit: 'cover'}}
                            className={`rounded-xl transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setIsLoaded(true)}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-0.5 justify-between p-1 w-full">
                    <span className="text-base font-medium">{name}</span>
                    <div className="flex flex-row justify-between items-end">
                        <p className="text-grayText font-medium text-base">{displayPrice}</p>
                        <Stepper
                            product_id={uniqueId}
                            onDelete={() => onDelete(uniqueId)}
                            onUpdate={onUpdate}
                            isUpdating={isUpdating}
                            onHoverChange={onHoverChange}
                            amount={quantity}
                        />
                    </div>
                </div>
            </li>
            <hr className="border-grayBg mx-2" />
        </>
    );
};

export default ShopItem;
