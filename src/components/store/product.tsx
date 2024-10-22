'use client';
import React, {useState} from "react";
import {IconEdit, IconPlus, IconStar, IconSuccess} from "@/components/ui/icons";
import Image from "next/image";
import {getAllProducts, updateProductCart} from "@/lib/actions/session-store";
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import {Button} from "@/components/ui/button";
import {formatCurrency, formatPrice} from "@/lib/utils";
import ProductsAdd from "@/components/dashboard/store/products-add";
import {ProductDataField, StoreData} from "@/lib/definitions";

interface ItemProps {
    productData: ProductDataField,
    isPending: boolean,
    setPending: (isPending: boolean) => void,
    setStoreData: (data: StoreData) => void
}

export function Product({ productData, setPending, isPending, setStoreData}: ItemProps) {
    // const handleClick = async () => {
    //     await updateProductCart(productId, 1); // Assuming amount is 1 for adding the product
    //     toast.success(
    //         <div className={"flex flex-row gap-x-7 justify-between items-center"}>
    //             <IconSuccess  color={"primary"} className={"w-10 h-10"}/>
    //             <p className={"text-base font-semibold"}>
    //                 <span className={"font-bold"}>{name}</span> was added to the cart
    //             </p>
    //         </div>
    //     );
    // };

    const [isProductDialogOpen, setProductDialogOpen] = useState(false);

    return (
        <li
        >
            {
                isProductDialogOpen && (
                    <div>
                        <ProductsAdd
                            storeId={productData.store_id}
                            isPending={isPending}
                            setStoreData={setStoreData}
                            setPending={setPending}
                            isDialogOpen={isProductDialogOpen}
                            setDialogOpen={setProductDialogOpen}
                            productData={
                                {
                                    store_id: productData.store_id,
                                    id: productData.id,
                                    category: productData.category,
                                    name: productData.name,
                                    description: productData.description,
                                    price: formatPrice(productData.price),
                                    image_url: productData.image_url
                                }
                            }
                            action={"update"}
                        />
                    </div>
                )
            }
            <div
                className={`rounded-lg border-2 border-grayBg flex flex-row w-full transition duration-500 hover:bg-grayBg trigger-hover cursor-pointer`}
                onClick={() => setProductDialogOpen(true)}
            >
                <div className={"flex flex-col justify-between p-1 w-full"}>
                    <div className="flex flex-col h-26 cm:h-27">
                    <span className="text-lg font-medium clamp-title">
                        {productData.name}
                    </span>
                        <span className="text-sm pb-3 text-grayText clamp-description">
                        {productData.description}
                    </span>
                    </div>
                    <div className={"flex flex-row justify-between pr-2 items-end"}>
                    <span className={"text-grayText font-medium"}>
                        {formatCurrency(productData.price)}
                    </span>
                        <div className={"flex items-center space-x-0.5"}>
                            <IconStar className={"w-5 h-5 cm:w-5 cm:h-5"} color={"primary"}/>
                            <p className="text-base cm:text-lg text-black ">
                                {productData.rating}
                            </p>
                        </div>
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
                                <IconEdit className={"w-6 h-6"}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}