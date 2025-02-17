import {ItemCart} from "@/lib/actions/cart";
import {ProductData} from "@/lib/actions/product";
import React from "react";
import {Divider, Image, Spacer} from "@heroui/react";
import {formatCurrency} from "@/lib/utils";
import {InputStepper} from "@/components/store/product/dialog/button-stepper";

type CartItemRowProps = {
    item: ItemCart;
    productData: ProductData;
    updateItem: (item: ItemCart) => Promise<void>;
    removeItem: (item: ItemCart) => Promise<void>;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void
    handleOpen: (productId?: string, itemCart?: ItemCart) => void;
};

export const CartItemRow: React.FC<CartItemRowProps> = ({
                                                     item,
                                                     productData,
                                                     updateItem,
                                                     removeItem,
                                                     isLoading,
                                                     setIsLoading,
                                                     handleOpen
                                                 }) => {

    const handleQuantityChange = async (value: number) => {
        if (value === 0) {
            await removeItem(item);
        } else {
            await updateItem({ ...item, quantity: value });
        }
    };

    if (item.quantity === 0) return null;

    return (
        <>
            <div
                className="flex gap-4 p-4  rounded-xl hover:bg-default-100 cursor-pointer border-gray-200"
                key={item.id}

                onClick={() => handleOpen(productData.id, item)}
            >
                <div className="w-20 h-20 aspect-square">
                    <Image
                        removeWrapper
                        alt={productData.name}
                        src={productData.picture}
                        className="object-cover w-full h-full"
                    />
                </div>
                <div className="flex w-full justify-between">
                    <div className="flex flex-col">
                        <p className="font-medium truncate max-w-[90px]">{productData.name}</p>
                        {item.note ? (<>
                            <p className="text-sm text-gray-600">{item.note && "Note*"}</p>
                            <Spacer y={4}/>
                        </>) : (
                            <Spacer y={8}/>
                        )}
                        <p className="text-sm text-gray-600">
                            {formatCurrency(productData.price * item.quantity)}
                        </p>
                    </div>
                    <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                        <InputStepper
                            isCart
                            min={0}
                            max={999}
                            value={item.quantity}
                            onChange={handleQuantityChange}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                        />
                    </div>
                </div>
            </div>
            <Divider/>
        </>
    );
};