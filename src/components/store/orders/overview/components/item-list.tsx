"use client";
import React, {useMemo, useState} from "react";
import {OrderProduct, OrderProducts} from "@/lib/actions/order";
import {ItemProduct} from "@/components/ui/drag-item";
import {Alert, Image, Spacer} from "@heroui/react";
import {formatCurrency} from "@/lib/utils";
import {Reorder} from "framer-motion";
import CustomAlert from "@/components/ui/custom-alerts";
import {AllergenIcon} from "@/components/store/product/components/allergy-icons";
import {v4 as uuidv4} from "uuid";
import {useMediaQuery} from "usehooks-ts";



interface ItemRowProps {
    orderProducts: OrderProducts;
}

export const ItemList: React.FC<ItemRowProps> = ({orderProducts}) => {

    if (!orderProducts) {
        return <p>Something went wrong, please contact support!</p>
    }

    // Create a dictionary (object) with uniqueId as the key and order data as the value
    const orderDictionary = useMemo<{ [key: string]: OrderProduct }>(() => {
        return orderProducts.reduce((dict, item) => {
            const uniqueId = uuidv4();
            dict[uniqueId] = item;
            return dict;
        }, {} as { [key: string]: OrderProduct });
    }, [orderProducts]);


    const [products, setProducts] = useState<string[]>(Object.keys(orderDictionary));
    const isSmall = useMediaQuery("(max-width: 640px)");

    return (
        <Reorder.Group
            axis="y"
            values={products}
            onReorder={(reordered) => {
                setProducts(reordered);
            }}
            className='w-full'
        >
            {products.map((uniqueId) => {
                const item = orderDictionary[uniqueId];
                if (!item) {
                    return null;
                }
                return (
                    <ItemProduct
                        key={uniqueId}
                        item={uniqueId}
                        className='border-b border-default-200  grid grid-cols-6 py-4 gap-x-4"'
                    >
                        <div
                            className="grid grid-cols-5 col-span-5 gap-x-4 items-center"
                        >
                            <div className={'flex flex-col justify-between text-start col-span-4'}>
                                <span>
                                    {item.name}
                                </span>
                                {isSmall &&
                                    <span className={'text-small text-default-500 font-medium '}>
                                    {formatCurrency(item.price)} X {item.qty}
                                </span>
                                }
                                <Spacer y={2}/>
                                <div className={"flex flex-col py-2 text-default-400 gap-4"}>
                                    {item.variants[0] && (<>
                                        <CustomAlert
                                            color="blue"
                                            hideIcon={true}
                                            classNames={{
                                                base: 'p-0 pl-2 bg-blue-100 rounded-r-full',
                                                mainWrapper: 'p-0 py-1 min-h-0',
                                            }}
                                        >
                                            <p className="text-small text-blue-600">{item.variants[0]}</p>
                                        </CustomAlert>
                                    </>)}
                                    {/* Ingredients Alert: Default variant */}
                                    {item.ingredients && item.ingredients.length > 0 && (
                                        <CustomAlert
                                            color="default"
                                            title="Ingredients"
                                            hideIcon
                                            classNames={{
                                                title: "text-text font-medium",
                                                base: 'p-0 pl-2'
                                            }}
                                        >
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.ingredients.map((ingredient, index) => {
                                                    return (
                                                        <div
                                                            key={ingredient}
                                                            className={`flex items-center gap-2 px-2 py-1 text-sm rounded-full text-text bg-default-200`}
                                                        >
                                                            <AllergenIcon allergen={ingredient} />
                                                            <span>
                                                                {ingredient}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CustomAlert>
                                    )}
                                    {/* Allergies Alert: Warning variant */}
                                    {item.allergies && item.allergies.length > 0 && (
                                        <CustomAlert
                                            color="warning"
                                            title="Allergies"
                                            hideIcon
                                            classNames={{
                                                title: "text-text font-medium",
                                                base: 'p-0 pl-2'
                                            }}
                                        >
                                            <div className="flex flex-wrap gap-2 mt-4">

                                                {item.allergies.map((allergies, index) => {
                                                    return (
                                                        <div
                                                            key={allergies}
                                                            className={`flex items-center gap-1 px-2 py-1 text-sm rounded-full text-warning-800 bg-warning-200`}
                                                        >
                                                            <AllergenIcon allergen={allergies} />
                                                            <span>
                                                                {allergies}
                                                            </span>

                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CustomAlert>
                                    )}
                                </div>
                            </div>
                            {!isSmall &&
                                <span className={'text-small text-default-500 font-medium '}>
                                    {formatCurrency(item.price)} X {item.qty}
                                </span>
                            }
                        </div>
                    </ItemProduct>
                );

            })}
        </Reorder.Group>
    );
};
