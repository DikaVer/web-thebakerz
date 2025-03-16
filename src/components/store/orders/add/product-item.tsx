"use client";

import {Button, Image, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react";
import {formatCurrency} from "@/lib/utils";
import React, { useState } from "react";
import {ProductData, ProductDataFull} from "@/lib/actions/product";
import {useProductDialog} from "@/components/providers/product-provider";
import { Reorder } from "framer-motion";
import {motion} from "motion/react";
import {ItemCategory, ItemProduct, Item} from "@/components/ui/drag-item";
import { Icon } from "@iconify/react/dist/iconify.js";
import {useTranslations} from "next-intl";

export interface ProductItemsProps {
    category: string;
    productsData: ProductDataFull;
}

export const ProductItems: React.FC<ProductItemsProps> = ({ category, productsData}) => {
    const { handleOpenWithProduct } = useProductDialog();
    const t = useTranslations("TheBakerz");

    return (
        Object.keys(productsData).map((consId) => {
            const product = productsData[consId];
            if (!product) return null;

            return (
                <button
                    key={consId}
                    className={'border-b border-default-200 hover:bg-default-100 grid grid-cols-6 p-2 py-4 gap-x-4 w-full'}
                    onClick={() => {
                        handleOpenWithProduct(product, undefined, true);
                    }}
                    aria-label={t("Add Product", {product: product.name})}
                >
                    <div
                        className="grid grid-cols-5 col-span-5 cursor-pointer gap-x-4"
                    >
                        <div className={'col-span-1'}>
                            <Image
                                src={product.picture}
                                alt={product.name}
                                width={80}
                                radius={'md'}
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
                    </div>
                    <div className={'flex justify-center items-center'}>
                        <Icon icon={'solar:add-circle-linear'} width={24} aria-hidden="true" />
                    </div>
                </button>
            );
        })
    );
}