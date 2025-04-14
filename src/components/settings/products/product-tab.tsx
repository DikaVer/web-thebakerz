"use client";

import {Image, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react";
import {formatCurrency} from "@/lib/utils";
import React, { useState } from "react";
import { useTranslations } from "next-intl";

import {ProductData, ProductDataFull} from "@/lib/actions/product";
import {useProductDialog} from "@/components/providers/product-provider";
import { Reorder } from "framer-motion";
import {motion} from "motion/react";
import {ItemCategory, ItemProduct, Item} from "@/components/ui/drag-item";


export interface ProductTabsProps {
    category: string;
    productsData: ProductDataFull;
    updateOrder: (category: string, order: string[]) => void;
}
export const ProductTable: React.FC<ProductTabsProps> = ({ category, productsData, updateOrder}) => {
    const { handleOpen } = useProductDialog();

    const [products, setProducts] = useState<string[]>(Object.keys(productsData));

    return (
        <Reorder.Group
            axis="y"
            values={products}
            onReorder={(reordered) => {
                setProducts(reordered);
                updateOrder(category, reordered);
            }}
            className='w-full'
        >
            {products.map((consId) => {
                const product = productsData[consId];
                if (!product) return null;

                return (
                    <ItemProduct
                        key={consId}
                        item={consId}
                        className='border-b border-default-200 hover:bg-default-100 grid grid-cols-6 p-2 py-4 gap-x-4"'
                    >
                        <button
                            onClick={()=>{handleOpen(product.id)}}
                            className="grid grid-cols-5 col-span-5 cursor-pointer gap-x-4 "
                        >
                            <div className={'col-span-1'}>
                                <Image
                                    src={product.picture}
                                    alt={product.name}
                                    width={80}
                                />
                            </div>
                            <div className={'flex flex-col justify-between text-start col-span-4'}>
                                <span>
                                    {product.name}
                                </span>
                                <span className={'text-small text-default-500 font-medium'}>
                                    {formatCurrency(product.price)}
                                </span>
                            </div>
                        </button>
                    </ItemProduct>
                );
            })}
        </Reorder.Group>
    );
}