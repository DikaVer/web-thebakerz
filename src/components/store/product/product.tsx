'use client';

import React, {ReactElement, useEffect, useState} from "react";
import {Card, Image} from "@heroui/react";
import { formatCurrency } from "@/lib/utils";
import {ProductDataField, StoreData} from "@/lib/definitions";
import {HeartIcon, IconEdit, IconPlus, IconStar} from "@/components/ui/icons";
import { useProductDialog } from "@/components/providers/product-provider";
import {Chip} from "@heroui/chip";
import {CardFooter, CardHeader} from "@heroui/card";
import {Button} from "@/components/ui/button";
import { motion } from "framer-motion";
import useIsSmallScreen from "@/lib/hooks/use-is-small-screen";
import {pacifico} from "@/components/fonts";

interface ProductBaseProps {
    productData: ProductDataField;
    onClick: () => void;
    overlayIcon: ReactElement<any>;
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
                    <p className={`text-xl cm:text-2xl ${pacifico.className}`}>{formatCurrency(productData.price)}</p>
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