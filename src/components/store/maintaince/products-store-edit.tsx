import * as React from "react";
import { useState} from "react";

import {ClipLoader} from "react-spinners";
import {Button} from "@/components/ui/button";
import ProductsAdd from "@/components/store/product/products-add";
import {ProductComponentBakerz} from "@/components/store/product/product-comp";
import {ProductData, StoreData} from "@/lib/definitions";

interface ProductsEditProps {
    storeId: string;
    productData: ProductData;
    setStoreData: (data: StoreData) => void;
}

export default function ProductsStoreEdit({ storeId, productData, setStoreData }: ProductsEditProps) {

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
                                    storeId={storeId}
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

                    <ProductComponentBakerz
                        storeId={storeId}
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