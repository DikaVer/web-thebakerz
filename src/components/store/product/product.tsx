'use client';

import React, {ReactElement, useEffect, useState} from "react";
import {Card, Image} from "@nextui-org/react";
import { formatCurrency } from "@/lib/utils";
import {ProductDataField, StoreData} from "@/lib/definitions";
import {HeartIcon, IconEdit, IconPlus, IconStar} from "@/components/ui/icons";
import { useProductDialog } from "@/components/providers/product-provider";
import {Chip} from "@nextui-org/chip";
import {CardFooter, CardHeader} from "@nextui-org/card";
import {Button} from "@/components/ui/button";
import { motion } from "framer-motion";
import useIsSmallScreen from "@/lib/hooks/use-is-small-screen";
import {pacifico} from "@/components/fonts";

interface ProductBaseProps {
    productData: ProductDataField;
    onClick: () => void;
    overlayIcon: ReactElement;
    isShared: boolean;
}

export const ProductBase: React.FC<ProductBaseProps> = ({
                                                            productData,
                                                            onClick,
                                                            overlayIcon,
                                                            isShared
                                                        }) => {
    const [isFilled, setIsFilled] = useState(false);
    const isSmall = useIsSmallScreen(768);
    useEffect(() => {
        isShared && onClick();
    }, []);
    return (
        <li
            id={productData.id}
            className={`cursor-pointer ${isShared && "border-5 border-secondary rounded-2xl shadow-lg shadow-secondary/50"}`}
            onClick={onClick}>
                {/*<Card*/}
                {/*    className={"shadow"}>*/}
                {/*    <div*/}
                {/*    className={`rounded-lg flex flex-row w-full transition duration-500 hover:bg-grayBg `}*/}
                {/*>*/}
                {/*    <div className="flex flex-col justify-between p-1 w-full">*/}
                {/*        <div className="flex flex-col h-26 cm:h-27">*/}
                {/*<span className="text-lg font-medium clamp-title">*/}
                {/*  {productData.name}*/}
                {/*</span>*/}
                {/*            <span className="text-sm pb-3 text-grayText line-clamp-4">*/}
                {/*  {productData.description}*/}
                {/*</span>*/}
                {/*        </div>*/}
                {/*<div className="flex flex-row justify-between pr-2 items-end">*/}
                {/*        <span className="text-grayText font-medium">*/}
                {/*          {formatCurrency(productData.price)}*/}
                {/*        </span>*/}
                {/*        <Chip*/}
                {/*            startContent={<IconEdit className={" w-5 h-5 text-grayText"}/>}*/}
                {/*            variant="faded"*/}
                {/*            color="default"*/}
                {/*        >*/}
                {/*            Customize*/}
                {/*        </Chip>*/}
                {/*            /!* Uncomment if rating is needed *!/*/}
                {/*/!*            /!* <div className="flex items-center space-x-0.5">*!/*/}
                {/*  <IconStar className="w-5 h-5 cm:w-5 cm:h-5" color="primary" />*/}
                {/*  <p className="text-base cm:text-lg">*/}
                {/*    {productData.rating}*/}
                {/*  </p>*/}
                {/*</div> *!/*/}
                {/*</div>*/}
                {/*    </div>*/}
                {/*    <Badge isOneChar className={"bg-grayBg w-10 h-10 m-6"} content={overlayIcon}  variant={"shadow"} placement="bottom-right">*/}
                {/*        <Badge className={"text-lg m-6 mx-7"} content="new" color="secondary" variant={"shadow"}>*/}
                {/*            <div className="p-2">*/}
                {/*                <div className="h-28 w-28 cm:h-32 cm:w-32">*/}
                {/*                    <Image*/}
                {/*                        isBlurred*/}
                {/*                        src={productData.image_url}*/}
                {/*                        alt={productData.name}*/}
                {/*                        className={`rounded-xl object-cover`}*/}
                {/*                        width={128}*/}
                {/*                        height={128}*/}
                {/*                    />*/}
                {/*                    /!*<div className="absolute rounded-full bg-grayBg h-9 w-9 right-1 bottom-1 scale-on-hover-115">*!/*/}
                {/*                    /!*    <div className="flex justify-center items-center h-full">*!/*/}
                {/*                    /!*        {overlayIcon}*!/*/}
                {/*                    /!*    </div>*!/*/}
                {/*                    /!*</div>*!/*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </Badge>*/}
                {/*    </Badge>*/}
                {/*</div>*/}
                {/*</Card>*/}
            <Card
                isFooterBlurred
                radius="lg"
                className={`border-none`}
            >
                <CardHeader className={"absolute z-10 top-1 flex-row !items-start justify-between"}>
                    {Math.random() < 0.4 ? (
                        <Chip className={`bg-secondary font-bold text-md text-black desktop:text-lg`}>New</Chip>
                    ) : (
                            <div className={"w-1"}></div>
                        )}
                    <Button isIconOnly
                            className={"rounded-full bg-background/40"}
                            variant={"ghost"}
                            onClick={() => setIsFilled(!isFilled)}
                            size={isSmall ? "sm" : "md"}
                    >
                        <motion.button

                            whileTap={{scale: 0.9}}
                            whileHover={{scale: 1.1}}
                            className={"rounded-full"}
                            onClick={() => setIsFilled(!isFilled)}
                        >
                            <HeartIcon
                                className={"text-danger"}
                                size={24}
                                filled={isFilled}/>
                        </motion.button>
                    </Button>

                </CardHeader>
                <div className="z-0 w-full max-w-[600px] aspect-[3/2]">
                    <Image
                        isZoomed
                        removeWrapper
                        alt={productData.name}
                        className="object-cover"
                        src={productData.image_url}
                        sizes="(max-width: 768px) 100vw, 600px"
                    />
                </div>
                <CardFooter
                    className="justify-between bg-background/40 border-white/20 border-1 aspect-[6/1] store-image:aspect-[6/1] 2xl:aspect-[8/1] overflow-hidden py-1 absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
                    <div className={`flex w-full items-end`}>
                        <Chip
                            startContent={<IconStar className="w-5 cm:w-6 text-warning"/>}
                            variant="light"
                            className={`text-lg cm:text-xl`}
                        >
                            {(Math.random() * 0.5 + 4.5).toFixed(1)}
                        </Chip>
                    </div>
                    <p className={` text-xl cm:text-2xl ${pacifico.className}`}>{formatCurrency(productData.price)}</p>
                </CardFooter>
            </Card>
        </li>
    );
};

interface ProductBakerzProps {
    productData: ProductDataField;
    isPending: boolean;
    setPending: (isPending: boolean) => void;
    setStoreData: (data: StoreData) => void;
    isShared: boolean;
}

export const ProductBakerz: React.FC<ProductBakerzProps> = ({
                                                                productData,
                                                                isPending,
                                                                setPending,
                                                                setStoreData,
                                                                isShared
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
                isShared={false}
            />
        </>
    );
};

interface ProductUserProps {
    productData: ProductDataField;
    isShared: boolean;
}

export const ProductUser: React.FC<ProductUserProps> = ({ productData, isShared}) => {
    const { openProductDialogStore } = useProductDialog();

    const handleClick = () => {
        openProductDialogStore(productData);
    };

    return (
        <ProductBase
            productData={productData}
            onClick={handleClick}
            overlayIcon={<IconPlus className="w-6 h-6 text-text" />}
            isShared={isShared}
        />
    );
};