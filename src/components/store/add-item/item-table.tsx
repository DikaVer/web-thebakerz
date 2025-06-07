"use client";

import {Image, Divider, Spinner} from "@heroui/react";
import {formatCurrency} from "@/lib/utils";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import {ProductDataFull} from "@/lib/actions/product";
import {useStore} from "@/components/providers/store-provider";
import { useRouter } from "next/navigation";

export interface ItemTableProps {
    category: string;
    productsData: ProductDataFull;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}   
export const ItemTable: React.FC<ItemTableProps> = ({ category, productsData, isLoading, setIsLoading}) => {
    const { store } = useStore();
    const router = useRouter();

    const [products, setProducts] = useState<string[]>(Object.keys(productsData));

    return (
        <>
            {products.map((consId, index) => {
                const product = productsData[consId];
                if (!product) return null;

                return (
                    <React.Fragment key={consId}>
                        <button
                            onClick={()=>{
                                if (!isLoading) {
                                    setIsLoading(true);
                                    router.push(`/${store?.storeName || store?.id}/item/add-item/${product.id}`);
                                }
                            }}
                            className="grid grid-cols-7 col-span-7 cursor-pointer gap-x-4 hover:bg-default-100 p-2 rounded-lg group"
                        >
                            <div className={'col-span-1'}>
                                <Image
                                    src={product.picture}
                                    alt={product.name}
                                    width={80}
                                />
                            </div>
                            <div className={'flex flex-col justify-between text-start col-span-5'}>
                                <div className="flex items-center gap-2">
                                    <span>{product.name}</span>
                                </div>
                                <span className={'text-small text-default-500 font-medium'}>
                                    {formatCurrency(product.price)}
                                </span>
                            </div>
                            <div className={'col-span-1 flex justify-center items-center'}>
                                {isLoading ? (
                                    <Spinner size="sm" />
                                ) : (
                                    <Icon 
                                        icon="solar:arrow-right-up-linear" 
                                        className="text-text opacity-80 group-hover:opacity-100 transition-opacity" 
                                        width={20} 
                                    />
                                )}
                            </div>
                        </button>
                        {index < products.length - 1 && (
                            <Divider className="my-2" />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
}