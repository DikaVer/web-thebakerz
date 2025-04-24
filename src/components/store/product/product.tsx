'use client';

import React from "react";
import {Card, Image, CardFooter} from "@heroui/react";
import {ProductData} from "@/lib/actions/product";
import {useProductDialog} from "@/components/providers/product-provider";
import {formatCurrency} from "@/lib/utils";
import {useMediaQuery} from "usehooks-ts";
import {useTranslations} from "next-intl";
import {useStore} from "@/components/providers/store-provider";
import {useSession} from "@/components/providers/session-provider";

interface ProductBaseProps {
    productData: ProductData;
}

export const ProductBase: React.FC<ProductBaseProps> = ({
                                                            productData,
                                                        }) => {

    const { handleOpen } = useProductDialog();
    const isSmall = useMediaQuery("(max-width: 658px)");
    const t = useTranslations("app/(store)/components/product");
    const { store } = useStore();
    const { session } = useSession();

    return (
        <div
            id={productData.id}
            className={`cursor-pointer max-w-sm border-1 rounded-2xl overflow-hidden`}
            onClick={() => handleOpen(productData.id, store?.user_id === session?.user?.id)}
        >
            <Card
                isFooterBlurred
                radius="lg"
                className={`border-none shadow-none items-end`}
            >
                <div className={`w-full aspect-square`}>
                    <Image
                        removeWrapper
                        alt={productData.name}
                        className="object-cover w-full"
                        src={productData.picture}
                    />
                </div>
                <CardFooter
                    className={`text-black justify-end ${isSmall ? "w-fit py-0" : "w-[98%] py-0.5"} items-end bg-white/40 border-white/20 border-1  overflow-hidden absolute before:rounded-xl mx-1 bottom-1 rounded-large shadow-small z-10`}>
                    <div className={`flex justify-between items-center ${isSmall ? "w-fit" : "w-full"} `}>
                        <p className={`w-full text-xl cm:text-2xl ${isSmall && "hidden"} truncate mr-6 font-medium`}>{productData.name}</p>
                        <p className={`text-lg cm:text-xl font-light`}>{formatCurrency(productData.price)}</p>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};