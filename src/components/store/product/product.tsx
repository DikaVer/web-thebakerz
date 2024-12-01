'use client';

import React, {ReactElement, useState} from "react";
import {Card, CardBody, Image} from "@nextui-org/react";
import { formatCurrency } from "@/lib/utils";
import {ProductDataField, StoreData} from "@/lib/definitions";

import {IconEdit, IconPlus} from "@/components/ui/icons";
import { useProductDialog } from "@/components/providers/product-provider";

import {Badge} from "@nextui-org/badge";
import {Chip} from "@nextui-org/chip";

interface ProductBaseProps {
    productData: ProductDataField;
    onClick: () => void;
    overlayIcon: ReactElement;
}

export const ProductBase: React.FC<ProductBaseProps> = ({
                                                            productData,
                                                            onClick,
                                                            overlayIcon,
                                                        }) => {

    return (
        <li
            className={`cursor-pointer`}
            onClick={onClick}>
                <Card
                    className={"shadow"}>
                    <div
                    className={`rounded-lg flex flex-row w-full transition duration-500 hover:bg-grayBg `}
                >
                    <div className="flex flex-col justify-between p-1 w-full">
                        <div className="flex flex-col h-26 cm:h-27">
                <span className="text-lg font-medium clamp-title">
                  {productData.name}
                </span>
                            <span className="text-sm pb-3 text-grayText line-clamp-4">
                  {productData.description}
                </span>
                        </div>
                <div className="flex flex-row justify-between pr-2 items-end">
                        <span className="text-grayText font-medium">
                          {formatCurrency(productData.price)}
                        </span>
                        <Chip
                            startContent={<IconEdit className={" w-5 h-5 text-grayText"}/>}
                            variant="faded"
                            color="default"
                        >
                            Customize
                        </Chip>
                            {/* Uncomment if rating is needed */}
                            {/* <div className="flex items-center space-x-0.5">
                  <IconStar className="w-5 h-5 cm:w-5 cm:h-5" color="primary" />
                  <p className="text-base cm:text-lg">
                    {productData.rating}
                  </p>
                </div> */}
                </div>
                    </div>
                    <Badge isOneChar className={"bg-grayBg w-10 h-10 m-6"} content={overlayIcon}  variant={"shadow"} placement="bottom-right">
                        <Badge className={"text-lg m-6 mx-7"} content="new" color="secondary" variant={"shadow"}>
                            <div className="p-2">
                                <div className="h-28 w-28 cm:h-32 cm:w-32">
                                    <Image
                                        isBlurred
                                        src={productData.image_url}
                                        alt={productData.name}
                                        className={`rounded-xl object-cover`}
                                        width={128}
                                        height={128}
                                    />
                                    {/*<div className="absolute rounded-full bg-grayBg h-9 w-9 right-1 bottom-1 scale-on-hover-115">*/}
                                    {/*    <div className="flex justify-center items-center h-full">*/}
                                    {/*        {overlayIcon}*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                        </Badge>
                    </Badge>
                </div>
                </Card>
        </li>
    );
};

interface ProductBakerzProps {
    productData: ProductDataField;
    isPending: boolean;
    setPending: (isPending: boolean) => void;
    setStoreData: (data: StoreData) => void;
}

export const ProductBakerz: React.FC<ProductBakerzProps> = ({
                                                                productData,
                                                                isPending,
                                                                setPending,
                                                                setStoreData,
                                                            }) => {
    const { openProductDialogBakerz } = useProductDialog();

    const handleClick = () => {
        openProductDialogBakerz(productData, isPending, setPending, setStoreData);
    };

    return (
        <>
            <ProductBase
                productData={productData}
                onClick={handleClick}
                overlayIcon={<IconEdit className="w-6 h-6 text-text" />}
            />
        </>
    );
};

interface ProductUserProps {
    productData: ProductDataField;
}

export const ProductUser: React.FC<ProductUserProps> = ({ productData }) => {
    const { openProductDialogStore } = useProductDialog();

    const handleClick = () => {
        openProductDialogStore(productData);
    };

    return (
        <ProductBase
            productData={productData}
            onClick={handleClick}
            overlayIcon={<IconPlus className="w-6 h-6 text-text" />}
        />
    );
};