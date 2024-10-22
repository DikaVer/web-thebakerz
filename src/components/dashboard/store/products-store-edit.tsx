import * as React from "react";
import { useState} from "react";

import {ClipLoader} from "react-spinners";
import {Button} from "@/components/ui/button";
import ProductsAdd from "@/components/dashboard/store/products-add";
import {ProductComponent} from "@/components/store/product-comp";
import {ProductData, StoreData} from "@/lib/definitions";

interface ProductsEditProps {
    id: string;
    productData: ProductData;
    setStoreData: (data: StoreData) => void;
}

export default function ProductsStoreEdit({ id, productData, setStoreData }: ProductsEditProps) {

    const [isPending, setPending] = useState(false);

    const [isProductDialogOpen, setProductDialogOpen] = useState(false);

    return (
        <div className={"mt-4"}>
            {isPending ? (
                <div className={"flex flex-col justify-center items-center"}>
                    <ClipLoader
                        color={"#730C6F"}
                        loading={isPending}
                        size={150}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                        speedMultiplier={0.3}
                    />
                    <p className={"text-2xl"}>Your products details are updating...</p>
                </div>
            ) : (
                <>
                    {
                        isProductDialogOpen && (
                            <div>
                                <ProductsAdd
                                    id={id}
                                    isPending={isPending}
                                    setStoreData={setStoreData}
                                    setPending={setPending}
                                    isDialogOpen={isProductDialogOpen}
                                    setDialogOpen={setProductDialogOpen}
                                    action={"add"}
                                />
                            </div>
                        )
                    }
                    <Button
                        className={"w-full"}
                        variant={"secondary"}
                        onClick={() => setProductDialogOpen(true)}
                    >
                        Add Product
                    </Button>

                    <ProductComponent
                        id={id}
                        productData={productData}
                        isPending={isPending}
                        setStoreData={setStoreData}
                        setPending={setPending}
                    />
                </>
            )}
        </div>
    );
}