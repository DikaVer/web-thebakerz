// src/components/shop/item.tsx
import React from "react";
import {IconPlus, IconStar} from "@/components/ui/icons";
import Image from "next/image";

interface ItemProps {
    name: string;
    description: string;
    rating: string;
    price: string;
    image: string;
}

export function Item({ name, description, price, image, rating }: ItemProps) {
    return (
        <li className={"rounded-xl bg-grayBg flex flex-row shadow-md transition duration-300 hover:bg-gray-200 trigger-hover cursor-default"}>
            <div className={"flex flex-col gap-0.5 justify-between p-1 w-full"}>
                <span className={"text-lg"}>
                    {name}
                </span>
                <span className={"text-sm font-thin pb-3 text-grayText"}>
                    {description}
                </span>
                <div className={"flex flex-row justify-between pr-2"}>
                    <span className={"text-grayText"}>
                        {price}
                    </span>
                    <div className={"flex items-center space-x-0.5"}>
                        <IconStar className={"cm:w-5 cm:h-5"}/>
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
                        layout="fill"
                        objectFit="cover"
                        objectPosition="center"
                        alt="Avatar"
                        className="rounded-2xl"
                    />
                    <div
                        className={"absolute rounded-full bg-grayBg h-10 w-10 cm:h-12 cm:w-12 right-1 bottom-1 scale-on-hover"}>
                        <div className={"flex justify-center items-center h-full"}>
                            <IconPlus className={"w-8 h-8 cm:w-9 cm:h-9"}/>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}