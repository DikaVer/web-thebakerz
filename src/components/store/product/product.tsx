'use client';

import React, {ReactElement, useState} from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import {ProductDataField, StoreData} from "@/lib/definitions";
import ProductsAdd from "@/components/store/product/products-add";
import {IconEdit, IconPlus} from "@/components/ui/icons";
import { useProductDialog } from "@/components/providers/product-provider";
import Skeleton from "react-loading-skeleton";

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
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <li>
            <div
                className={`rounded-lg border-2 border-grayBg flex flex-row w-full transition duration-500 hover:bg-grayBg cursor-pointer`}
                onClick={onClick}
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
                        {/* Uncomment if rating is needed */}
                        {/* <div className="flex items-center space-x-0.5">
              <IconStar className="w-5 h-5 cm:w-5 cm:h-5" color="primary" />
              <p className="text-base cm:text-lg text-black">
                {productData.rating}
              </p>
            </div> */}
                    </div>
                </div>
                <div className="p-2">
                    <div className="relative h-28 w-28 cm:h-32 cm:w-32">
                        {!isLoaded && <Skeleton height={"98%"}/>}
                        <Image
                            src={productData.image_url}
                            alt={productData.name}
                            onLoad={() => setIsLoaded(true)}
                            className={`rounded-xl object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                            placeholder="blur"
                            blurDataURL={"/blur_images/blur_product.jpg"} // Ensure this data is provided
                            fill // Use the `fill` prop instead of width and height
                            sizes="(max-width: 540px) 112px, 128px" // Adjust the breakpoint as needed
                        />
                        <div className="absolute rounded-full bg-grayBg h-9 w-9 right-1 bottom-1 scale-on-hover-115">
                            <div className="flex justify-center items-center h-full">
                                {overlayIcon}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                overlayIcon={<IconEdit className="w-6 h-6" />}
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
            overlayIcon={<IconPlus className="w-6 h-6" />}
        />
    );
};