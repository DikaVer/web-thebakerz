'use client';

import 'react-image-crop/dist/ReactCrop.css';
import React, {useEffect,  useState} from "react";
import {Button} from "@/components/ui/button";
import {
    IconCross, IconHeart, IconHeartFavourites,
    IconShare,
} from "@/components/ui/icons";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ProductDataField} from "@/lib/definitions";
import Image from "next/image";
import {formatCurrency, formatPrice} from "@/lib/utils";


interface ProductDescriptionProps {
    isDialogOpen: boolean;
    setDialogOpen: (open: boolean) => void;
    productData: ProductDataField;
}

export function ProductDescription({isDialogOpen, setDialogOpen, productData } : ProductDescriptionProps) {

    const [isOpen, setIsOpen] = useState<boolean>(isDialogOpen);
    const [isHeartFilled, setIsHeartFilled] = useState<boolean>(false);

    useEffect(() => {
        if (isDialogOpen) {
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
    }, [isDialogOpen]);


    const toggleClose = () => {
        setIsOpen(false);
        //Artificial delay to allow the animation to finish
        setTimeout(() => {
            setDialogOpen(false);
        }, 400);
    }

    const [quantity, setQuantity] = useState<number>(1);
    const totalPrice = (formatPrice(productData.price) * quantity).toFixed(2);


    return (
        <>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className="fixed inset-0 z-30 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                onClick={(e) => {
                    toggleClose();
                }}/>
            <div
                data-state={isOpen ? 'open' : 'closed'}
                className={"fixed left-[50%] top-[50%] z-40 grid w-full max-w-[345px] cm:max-w-[445px] translate-x-[-50%] translate-y-[-50%] gap-4 bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg"}
            >
                <ScrollArea className={"max-h-[75vh]"}>
                    <div className={"grid gap-4  slide-in-from-top-[5%] p-6"}>
                        <div className={`flex flex-row justify-between items-center`}>
                            <Button
                                className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                                onClick={() => toggleClose()}
                            >
                                <IconCross className={"w-8 h-8 cursor-pointer"}/>
                            </Button>
                            <p className={"text-xl font-medium"}>Product detail</p>
                            <div className="w-8 h-8 flex ">
                                <Button
                                    className="flex p-1 items-center bg-white rounded-full transition duration-500 hover:bg-gray-200"
                                    onClick={() => toggleClose()}
                                >
                                    <IconShare className={"w-8 h-8 cursor-pointer"}/>
                                </Button>
                            </div>
                        </div>
                        <hr className={"my-1"}/>
                        {/* Product Image */}
                        <div className="grid grid-cols-1 gap-2">
                            {/* Product Image */}
                            <div className="relative h-[300px] w-[300px] cm:h-[400px] cm:w-[400px]">
                                <Image
                                    src={productData.image_url}
                                    alt={productData.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-xl"
                                />
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-row items-end justify-between">
                                    <div className={"flex flex-row items-center space-x-2"}>
                                        <p className="text-xl font-bold">{productData.name}</p>
                                        <IconHeartFavourites
                                            className={`w-5 h-5 cursor-pointer transition-transform duration-300 ${isHeartFilled ? 'scale-110' : ''}`}
                                            color="primary"
                                            state={isHeartFilled ? "full" : "empty"}
                                            onClick={() => setIsHeartFilled(!isHeartFilled)}
                                            onMouseEnter={(e) => e.currentTarget.classList.add('scale-110')}
                                            onMouseLeave={(e) => e.currentTarget.classList.remove('scale-110')}
                                        />
                                    </div>
                                    <span
                                        className="text-lg font-bold text-grayText">{formatCurrency(productData.price)}</span>
                                </div>
                                {/*<div className="flex items-center justify-center gap-2">*/}
                                {/*    <span className="text-xl font-extrabold">{formatCurrency(productData.price)}</span>*/}
                                {/*    /!*<div className="flex items-center">*!/*/}
                                {/*    /!*    <span>{productData.rating}</span>*!/*/}
                                {/*    /!*    <span className="ml-1 text-gray-500">({productData.rating} reviews)</span>*!/*/}
                                {/*    /!*</div>*!/*/}
                                {/*</div>*/}
                                <p className="font-medium text-grayText clamp-product-description">{productData.description}</p>
                            </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex justify-between items-end space-x-4">
                            <select
                                className="border rounded-md p-2"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            >
                                {[...Array(99).keys()].map(i => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Add to Order Button */}
                        <div className="text-center">
                            <Button className="w-full text-white py-3 rounded-md">
                                Add {quantity} to order - ${totalPrice}
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </>
    );
}

