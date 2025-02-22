'use client';

import React from "react";
import {Card, Image} from "@heroui/react";
import {CardFooter} from "@heroui/card";
import {ProductData} from "@/lib/actions/product";
import {useProductDialog} from "@/components/providers/product-provider";
import {formatCurrency} from "@/lib/utils";


interface ProductBaseProps {
    productData: ProductData;
}

export const ProductBase: React.FC<ProductBaseProps> = ({
                                                            productData,
                                                        }) => {


    const { handleOpen } = useProductDialog();


    return (
        <div
            id={productData.id}
            className={`cursor-pointer max-w-sm border-1 rounded-2xl`}

            onClick={() => handleOpen(productData.id, undefined)}
        >
            <Card
                isFooterBlurred
                radius="lg"
                className={`border-none shadow-none `}
            >
                <div className={`w-full  aspect-square`}>
                    <Image
                        removeWrapper
                        alt={productData.name}
                        className="object-cover w-full"
                        src={productData.picture}
                    />
                </div>
                <CardFooter
                    className={`justify-between items-end bg-background/40 border-white/20 border-1  overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10`}>
                    <p className={`w-full text-xl cm:text-2xl truncate mr-6 font-medium`}>{productData.name}</p>
                    <p className={`text-lg cm:text-xl font-light`}>{formatCurrency(productData.price)}</p>
                </CardFooter>
            </Card>
        </div>
    );
};
