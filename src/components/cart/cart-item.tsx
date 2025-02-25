import {ItemCart} from "@/lib/actions/cart";
import {ProductData} from "@/lib/actions/product";
import React from "react";
import {Divider, Image, Spacer} from "@heroui/react";
import {formatCurrency} from "@/lib/utils";
import {InputStepper} from "@/components/store/product/dialog/button-stepper";
import CustomAlert from "@/components/ui/custom-alerts";

type CartItemRowProps = {
    item: ItemCart;
    productData: ProductData;
    updateItem: (item: ItemCart) => Promise<boolean>;
    removeItem: (item: ItemCart) => Promise<boolean>;
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
        let updatedValue;
        if (value === 0) {
            updatedValue = await removeItem(item);
        } else {
            updatedValue = await updateItem({ ...item, quantity: value });
        }
        return updatedValue;
    };

    if (item.quantity === 0) return null;

    return (
        <>
            <div
                className="flex flex-col gap-2 p-4  rounded-xl hover:bg-default-100 cursor-pointer border-gray-200"
                key={item.id}

                onClick={() => handleOpen(productData.id, item)}
            >
                <div className={'flex'}>
                    <div className="w-20 h-20 aspect-square">
                        <Image
                            removeWrapper
                            alt={productData.name}
                            src={productData.picture}
                            className="object-cover w-full h-full"
                        />
                    </div>
                    <Spacer x={4}/>
                    <div className="flex justify-between w-[70%]">
                        <div className="flex flex-col w-full">
                            <p className="font-medium truncate">{productData.name}</p>
                            {item.note && (<>
                                <p className="text-xs text-default-400 font-medium break-words">Note: {item.note}</p>
                                <Spacer x={4}/>
                            </>)}
                            {productData.allergies && productData.allergies.length > 0 && (
                                <CustomAlert
                                    color="warning"
                                    hideIcon={true}
                                    classNames={{
                                        base: 'p-0',
                                        mainWrapper: 'p-0 py-1 min-h-0',
                                    }}
                                >
                                    <p className={'text-xs'}>{productData.allergies.join(", ")}</p>
                                </CustomAlert>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-end justify-between" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm text-gray-600">
                        {formatCurrency(productData.price * item.quantity)}
                    </p>
                    <div>
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