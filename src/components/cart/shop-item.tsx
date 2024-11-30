import React, {useState} from 'react';
import Stepper from '@/components/cart/stepper';
import {CartItem} from "@/lib/definitions";
import {formatCurrency} from "@/lib/utils";
import {useProductDialog} from "@/components/providers/product-provider";
import Skeleton from "react-loading-skeleton";
import {Card, CardBody, Image, Modal, ModalBody, ModalContent} from "@nextui-org/react";
import {Button} from "@/components/ui/button";

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
                className={`flex flex-row rounded w-full  p-4 transition duration-500 ${!isHoveringStepper ? 'hover:bg-grayBg' : ''} cursor-pointer my-1`}
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
                <div className="mb-4">
                    <div className="h-20 w-20">
                        <Image
                            isBlurred
                            src={image_url}
                            alt={`Image of ${name}`}
                            className={"rounded-xl object-center"}
                            width={96}
                            height={80}
                        />
                    </div>
                </div>
                <div className="flex flex-row justify-between w-full ml-2">
                    <div>
                        <span className="text-base font-medium">{name}</span>
                        <p className="text-grayText font-medium text-base">{displayPrice}</p>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                        <Button
                            variant={"outline"}
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
                            change
                        </Button>
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
            <hr className="border-grayBg mx-2"/>
        </>
    );
};

export default ShopItem;
