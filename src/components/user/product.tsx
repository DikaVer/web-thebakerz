'use client';
import React, {useState} from "react";
import {IconPlus, IconStar} from "@/components/ui/icons";
import Image from "next/image";
import {formatCurrency} from "@/lib/utils";
import {ProductDescription} from "@/components/user/product-description";
import {ProductDataField} from "@/lib/definitions";
import {useProductDialog} from "@/components/providers/product-provider";

interface ItemProps {
    productData: ProductDataField
}

export function Product({ productData }: ItemProps) {


    const { openProductDialogStore} = useProductDialog();

    return (
        <li
        >
            <div
                className={`rounded-lg border-2 border-grayBg flex flex-row w-full transition duration-500 hover:bg-grayBg trigger-hover cursor-pointer`}
                onClick={() => openProductDialogStore(productData)}
            >
                <div className={"flex flex-col justify-between p-1 w-full"}>
                    <div className="flex flex-col h-26 cm:h-27">
                    <span className="text-lg font-medium clamp-title">
                        {productData.name}
                    </span>
                        <span className="text-sm pb-3 font-normal text-grayText clamp-description">
                        {productData.description}
                    </span>
                    </div>
                    <div className={"flex flex-row justify-between pr-2 items-end"}>
                    <span className={"text-grayText font-medium"}>
                        {formatCurrency(productData.price)}
                    </span>
                        {/*<div className={"flex items-center space-x-0.5"}>*/}
                        {/*    <IconStar className={"w-5 h-5 cm:w-5 cm:h-5"} color={"primary"}/>*/}
                        {/*    <p className="text-base cm:text-lg text-black ">*/}
                        {/*        {productData.rating}*/}
                        {/*    </p>*/}
                        {/*</div>*/}
                    </div>
                </div>
                <div className={"p-2"}>
                    <div className="relative h-28 w-28 cm:h-32 cm:w-32">
                        <Image
                            src={productData.image_url}
                            width={128}
                            height={128}
                            alt="Avatar"
                            className="rounded-xl h-28 w-28 cm:h-32 cm:w-32"
                        />
                        <div
                            className={"absolute rounded-full bg-grayBg h-9 w-9 right-1 bottom-1 scale-on-hover-115"}>
                            <div className={"flex justify-center items-center h-full"}>
                                <IconPlus className={"w-6 h-6"}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}