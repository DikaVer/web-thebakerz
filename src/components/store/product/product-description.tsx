'use client';

import 'react-image-crop/dist/ReactCrop.css';
import React, { useEffect, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    IconCross,
    IconHeartFavourites,
    IconShare,
} from "@/components/ui/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import {ProductDataField, StoreData} from "@/lib/definitions";
import {useCart} from "@/components/providers/cart-provider";
import {useProductDialog} from "@/components/providers/product-provider";
import Skeleton from "react-loading-skeleton";

interface ProductDescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    productData: ProductDataField;
    children: ReactNode;
    isHeartFilled: boolean;
    onToggleHeart: () => void;
}

export function ProductDescriptionBase({
                                            isOpen,
                                            onClose,
                                            productData,
                                            children,
                                            isHeartFilled,
                                            onToggleHeart,
                                        }: ProductDescriptionModalProps) {
    useEffect(() => {
        if (isOpen) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.paddingRight = `${scrollBarWidth}px`;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className="fixed inset-0 z-30 bg-black/80 animate-fade"
                onClick={onClose}
            />
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className="fixed left-1/2 top-1/2 z-40 grid w-full max-w-[345px] cm:max-w-[445px]
                           translate-x-[-50%] translate-y-[-50%] gap-4 bg-background
                           shadow-lg animate-scale rounded-lg"
            >
                <ScrollArea className="max-h-[75vh]">
                    <div className="grid gap-4 p-6">
                        <ModalHeader onClose={onClose} />
                        <hr className="my-1" />
                        <ProductImage productData={productData} />
                        <ProductDetails
                            productData={productData}
                            isHeartFilled={isHeartFilled}
                            onToggleHeart={onToggleHeart}
                        />
                        {children}
                    </div>
                </ScrollArea>
            </div>
        </>
    );
}

interface ModalHeaderProps {
    onClose: () => void;
}

function ModalHeader({ onClose }: ModalHeaderProps) {
    return (
        <div className="flex justify-between items-center">
            <Button
                className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                onClick={onClose}
            >
                <IconCross className="w-8 h-8 cursor-pointer" />
            </Button>
            <p className="text-xl font-medium">Product Detail</p>
            <Button
                className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                onClick={() => { /* TODO: Implement share functionality */ }}
            >
                <IconShare className="w-8 h-8 cursor-pointer" />
            </Button>
        </div>
    );
}

interface ProductImageProps {
    productData: ProductDataField;
}

function ProductImage({ productData }: ProductImageProps) {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    return (
        <div className="relative h-[300px] w-[300px] cm:h-[400px] cm:w-[400px]">
            {!isLoaded && <Skeleton height={"100%"} />}
            <Image
                src={productData.image_url}
                alt={productData.name}
                fill
                style={{ objectFit: 'cover' }}
                onLoad={() => setIsLoaded(true)}
                className={`rounded-xl transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 540px) 300px, 400px"
            />
        </div>
    );
}

interface ProductDetailsProps {
    productData: ProductDataField;
    isHeartFilled: boolean;
    onToggleHeart: () => void;
}

function ProductDetails({ productData, isHeartFilled, onToggleHeart }: ProductDetailsProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
                <div className="flex items-center space-x-2">
                    <p className="text-xl font-bold">{productData.name}</p>
                    <IconHeartFavourites
                        className="w-5 h-5 cursor-pointer transition-transform duration-300 hover:scale-110"
                        color="primary"
                        state={isHeartFilled ? "full" : "empty"}
                        onClick={onToggleHeart}
                    />
                </div>
                <span className="text-lg font-bold text-grayText">{formatCurrency(productData.price)}</span>
            </div>
            <p className="font-medium text-grayText clamp-product-description">{productData.description}</p>
        </div>
    );
}

interface ProductDescriptionUserProps {
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    productData: ProductDataField;
    editCartData?: {
        quantity: number;
        uniqueId: string;
    };
}

export function ProductDescriptionUser({
                                           isDialogOpen,
                                           setDialogOpen,
                                           productData,
                                           editCartData,
                                       }: ProductDescriptionUserProps) {
    const [isHeartFilled, setIsHeartFilled] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(editCartData ? editCartData.quantity : 1);
    const totalPrice = formatCurrency(productData.price * quantity);
    const { addToCart, updateProductCart } = useCart();

    const handleAddOrder = () => {
        setIsLoading(true);

        if (editCartData) {
            updateProductCart(
                {
                    ...productData,
                    quantity: editCartData.quantity,
                    uniqueId: editCartData.uniqueId,
                },
                quantity
            );
        } else {
            addToCart(productData, quantity);
        }

        setDialogOpen(false);
        setIsLoading(false);
    };

    return (
        <ProductDescriptionBase
            isOpen={isDialogOpen}
            onClose={() => setDialogOpen(false)}
            productData={productData}
            isHeartFilled={isHeartFilled}
            onToggleHeart={() => setIsHeartFilled(!isHeartFilled)}
        >
            {/* Quantity Selector */}
            <div className="flex justify-between items-end space-x-4">
                <select
                    id="quantity"
                    className="border rounded-md p-2"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                >
                    {[...Array(99).keys()].map((i) => (
                        <option key={i + 1} value={i + 1}>
                            {i + 1}
                        </option>
                    ))}
                </select>
                <label htmlFor="quantity" className="sr-only">Quantity</label>
            </div>

            {/* Add to Order Button */}
            <div className="text-center">
                <Button
                    className="w-full text-white py-3 rounded-md"
                    onClick={handleAddOrder}
                    disabled={isLoading}
                >
                    Add {quantity} to order • {totalPrice}
                </Button>
            </div>
        </ProductDescriptionBase>
    );
}

interface ProductDescriptionBakerzProps {
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    productData: ProductDataField;
    isPending: boolean;
    setPending: (isPending: boolean) => void;
    setStoreData: (data: StoreData) => void;
}

export function ProductDescriptionBakerz({
                                             isDialogOpen,
                                             setDialogOpen,
                                             productData,
                                             isPending,
                                             setPending,
                                             setStoreData,
                                         }: ProductDescriptionBakerzProps) {
    const [isHeartFilled, setIsHeartFilled] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { editProductDialogBakerz } = useProductDialog();

    const handleEditProduct = () => {
        setIsLoading(true);
        editProductDialogBakerz(productData, isPending, setPending, setStoreData);
        setDialogOpen(false);
        setIsLoading(false);
    };

    return (
        <ProductDescriptionBase
            isOpen={isDialogOpen}
            onClose={() => setDialogOpen(false)}
            productData={productData}
            isHeartFilled={isHeartFilled}
            onToggleHeart={() => setIsHeartFilled(!isHeartFilled)}
        >
            {/* Update Product Button */}
            <div className="text-center">
                <Button
                    className="w-full text-white py-3 rounded-md"
                    onClick={handleEditProduct}
                    disabled={isLoading}
                >
                    Update Product
                </Button>
            </div>
        </ProductDescriptionBase>
    );
}
