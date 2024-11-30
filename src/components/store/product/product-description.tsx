'use client';

import 'react-image-crop/dist/ReactCrop.css';
import React, { useEffect, useState, ReactNode } from "react";
import {Button} from '@/components/ui/button';
import {
    IconCross, IconError,
    IconHeartFavourites,
    IconShare, IconSuccess,
} from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";
import {ProductDataField, StoreData} from "@/lib/definitions";
import {useCart} from "@/components/providers/cart-provider";
import {useProductDialog} from "@/components/providers/product-provider";
import Skeleton from "react-loading-skeleton";

// @ts-ignore
import confetti from 'canvas-confetti';

import {toast} from "sonner";
import {ScrollShadow} from "@nextui-org/scroll-shadow";
import {Card, Image, Modal, ModalBody, ModalContent} from "@nextui-org/react";
import useIsSmallScreen from "@/lib/hooks/use-is-small-screen";
import {backdropEffect} from "@/lib/local-variables";
import {useTheme} from "next-themes";

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
            <Modal backdrop={backdropEffect} isOpen={isOpen} onClose={onClose} size={'xl'} shadow={"lg"}>
                <ModalContent>
                    {(onClose) => (
                        <ModalBody >
                            <ScrollShadow size={50} hideScrollBar className="max-h-[75vh]">
                                <div className="grid gap-4 p-4">
                                    <ModalHeader />
                                    <hr className="my-1" />
                                    <ProductImage productData={productData} />
                                    <ProductDetails
                                        productData={productData}
                                        isHeartFilled={isHeartFilled}
                                        onToggleHeart={onToggleHeart}
                                    />
                                    {children}
                                </div>
                            </ScrollShadow>
                        </ModalBody>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}



function ModalHeader() {
    return (
        <div className="flex justify-between items-center">
            <Button
                isIconOnly
                className="flex items-center rounded-full"
                variant={"ghost"}
                onClick={() => { /* TODO: Implement share functionality */ }}
            >
                <IconShare className="w-8 h-8 cursor-pointer text-text" />
            </Button>
            <p className="text-xl font-medium">Product Detail</p>
            <div className={"w-8 h-8"}>
            </div>
        </div>
    );
}

interface ProductImageProps {
    productData: ProductDataField;
}

function ProductImage({ productData }: ProductImageProps) {
    const isSmallScreen = useIsSmallScreen(540);

    return (
        <div className="flex justify-center w-full">
            <Image
                isZoomed
                isBlurred
                src={productData.image_url}
                alt={productData.name}
                className={"rounded-xl object-center"}
                width={isSmallScreen ? 300 : 400}
                height={isSmallScreen ? 300 : 400}
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
            <Card
                className={"flex flex-row justify-between items-center p-2"}
            >
                <div>
                    <p className="text-xl font-bold">{productData.name}</p>
                    <span className="text-lg font-bold text-grayText">{formatCurrency(productData.price)}</span>
                </div>
                <Button
                    isIconOnly
                    className={`w-12 h-12 flex items-center rounded-full`}
                    variant={"ghost"}
                    endContent={<IconHeartFavourites
                        className="w-10 h-10 text-primary"
                        state={isHeartFilled ? "full" : "empty"}
                        onClick={onToggleHeart}
                    />}
                    onClick={() => { /* TODO: Implement share functionality */
                    }}
                >

                </Button>
            </Card>
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

    // const confetti = require('canvas-confetti').default;

    const handleConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 300,
            origin: { y: 0.6 }
        });
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
                    variant={"default"}
                    onClick={handleAddOrder}
                    disabled={isLoading}
                    onPress={handleConfetti}
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

    const onSubmit = async () => {
        setPending(true);
        setIsLoading(true);


        const response = await fetch(`/api/store/actions/product/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                storeId: productData.store_id,
                productId: productData.id
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            toast.error((
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconError color={"primary"} className={"w-10 h-10"}/>
                        <p className={"text-base font-bold"}>
                            {result.message}
                        </p>
                    </div>
                ),
                {
                    duration: 10000
                }
            );
            setIsLoading(false);
            setPending(false);
            return;
        } else {
            toast.success((
                    <div className={"flex flex-row gap-x-1 justify-between items-center"}>
                        <IconSuccess color={"primary"} className={"w-10 h-10"}/>
                        <p className={"text-base font-bold"}>
                            {result.message}
                        </p>
                    </div>
                ),
                {
                    duration: 10000
                }
            );

            // @ts-ignore
            setStoreData(prevState => ({
                ...prevState,
                // @ts-ignore
                products: prevState.products.filter((product) => product.id !== productData?.id)
            }));
        }

        setIsLoading(false);
        setDialogOpen(false);
        setPending(false);
    }



    return (
        <ProductDescriptionBase
            isOpen={isDialogOpen}
            onClose={() => setDialogOpen(false)}
            productData={productData}
            isHeartFilled={isHeartFilled}
            onToggleHeart={() => setIsHeartFilled(!isHeartFilled)}
        >
            {/* Update Product Button */}
            <div className="flex flex-row text-center gap-x-10">
                <Button
                    className="w-full py-3 rounded-md"
                    onClick={() => onSubmit()}
                    disabled={isLoading}
                    color={"warning"}
                >
                    Delete
                </Button>
                <Button
                    className="w-full text-white py-3 rounded-md"
                    onClick={handleEditProduct}
                    disabled={isLoading}
                >
                    Update
                </Button>
            </div>
        </ProductDescriptionBase>
    );
}
