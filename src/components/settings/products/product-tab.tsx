/**
 * @fileoverview Reorderable product list for one category in product settings.
 *
 * Exports the ProductTable client component, which renders the products of a
 * category as a framer-motion Reorder group of draggable rows showing image,
 * name, and price. Reordering updates local state and reports the new order
 * through the updateOrder callback, and clicking a row opens the product
 * dialog in owner mode when the store belongs to the current user.
 */
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
import {useStore} from "@/components/providers/store-provider";
import {useSession} from "@/components/providers/session-provider";


export interface ProductTabsProps {
    category: string;
    productsData: ProductDataFull;
    updateOrder: (category: string, order: string[]) => void;
}
export const ProductTable: React.FC<ProductTabsProps> = ({ category, productsData, updateOrder}) => {
    const { handleOpen } = useProductDialog();
    const { store } = useStore();
    const { session } = useSession();

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
                            onClick={()=>{handleOpen(product.id, store?.user_id === session?.user?.id)}}
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