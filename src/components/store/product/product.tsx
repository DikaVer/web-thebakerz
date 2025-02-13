'use client';

import React from "react";
import {Card, Image} from "@heroui/react";
import { formatCurrency } from "@/lib/utils";
import {CardFooter, CardHeader} from "@heroui/card";
import {ProductData} from "@/lib/actions/product";
import {useMediaQuery} from "usehooks-ts";


interface ProductBaseProps {
    productData: ProductData;
}

export const ProductBase: React.FC<ProductBaseProps> = ({
                                                            productData,
                                                        }) => {

    const isMobile = useMediaQuery("(max-width: 560px)");

    return (
        <div
            id={productData.id}
            className={`cursor-pointer max-w-sm border-1 rounded-2xl`}

            // onClick={onClick}
        >
            <Card
                isFooterBlurred
                radius="lg"
                className={`border-none shadow-none `}
            >
                    <Image
                        removeWrapper
                        alt={productData.name}
                        className="object-cover"
                        src={productData.picture}
                    />
                <CardFooter
                    className={`justify-between items-end bg-background/40 border-white/20 border-1  overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10`}>
                    <p className={`w-full text-xl cm:text-2xl truncate mr-6 font-medium`}>{productData.name}</p>
                    <p className={`text-lg cm:text-xl font-light`}>{formatCurrency(productData.price)}</p>
                </CardFooter>
            </Card>
        </div>
    );
};
