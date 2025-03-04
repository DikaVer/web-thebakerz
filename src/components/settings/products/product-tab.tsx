"use client";

import {Image, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react";
import {formatCurrency} from "@/lib/utils";
import React, { useState } from "react";


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

    const { handleOpenWithProduct } = useProductDialog();


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
                            onPointerDown={()=>{handleOpenWithProduct(product)}}
                            className="grid grid-cols-5 col-span-5 cursor-pointer"
                        >
                            <div className={'col-span-1'}>
                                <Image
                                    src={product.picture}
                                    alt={product.name}
                                    width={80}
                                />
                            </div>
                            <span className={'text-start col-span-3'}>
                                {product.name}
                            </span>
                            <div className={'col-span-1 flex justify-start'}>
                                {formatCurrency(product.price)}
                            </div>
                        </button>
                </ItemProduct>
                );

            })}
        </Reorder.Group>
    );
}