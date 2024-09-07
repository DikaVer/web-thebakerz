'use client';
import React from "react";
import {IconPlus, IconStar, IconSuccess} from "@/components/ui/icons";
import Image from "next/image";
import {getAll, updateProductCart} from "@/lib/actions/session-store";
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import {Button} from "@/components/ui/button";

interface ItemProps {
    name: string;
    description: string;
    rating: string;
    price: string;
    image: string;
    productId: string;
}

export function Product({ name, description, price, image, rating, productId }: ItemProps) {
    const handleClick = async () => {
        await updateProductCart(productId, 1); // Assuming amount is 1 for adding the product
        toast.success(
            <div className={"flex flex-row gap-x-7 justify-between items-center"}>
                <IconSuccess  color={"primary"} className={"w-10 h-10"}/>
                <p className={"text-base font-semibold"}>
                    <span className={"font-bold"}>{name}</span> was added to the cart
                </p>
            </div>
        );
    };

    return (
        <li
            className={`rounded-lg border-2 border-grayBg flex flex-row w-full transition duration-500 hover:bg-grayBg trigger-hover cursor-pointer`}
            onClick={handleClick}
        >
            <div className={"flex flex-col justify-between p-1 w-full"}>
                <div className="flex flex-col h-26 cm:h-27">
                    <span className="text-lg clamp-title">
                        {name}
                    </span>
                    <span className="text-sm pb-3 text-grayText clamp-description">
                        {description}
                    </span>
                </div>
                <div className={"flex flex-row justify-between pr-2 items-end"}>
                    <span className={"text-grayText font-medium"}>
                        {price}
                    </span>
                    <div className={"flex items-center space-x-0.5"}>
                        <IconStar className={"w-5 h-5 cm:w-5 cm:h-5"} color={"primary"} />
                        <p className="text-base cm:text-lg text-black ">
                            {rating}
                        </p>
                    </div>
                </div>
            </div>
            <div className={"p-2"}>
                <div className="relative h-28 w-28 cm:h-32 cm:w-32">
                    <Image
                        src={image}
                        width={1920}
                        height={1080}
                        alt="Avatar"
                        className="rounded-xl h-28 w-28 cm:h-32 cm:w-32"
                    />
                    <div
                        className={"absolute rounded-full bg-grayBg h-9 w-9 right-1 bottom-1 scale-on-hover-115"}>
                        <div className={"flex justify-center items-center h-full"}>
                            <IconPlus className={"w-6 h-6"} />
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}