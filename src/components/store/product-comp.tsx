import React from "react";
import {ProductList} from "@/components/store/product-list";
import {ProductData, ProductDataField, StoreData} from "@/lib/definitions";


export function ProductComponent({storeId, productData, setStoreData, isPending, setPending}: {
    storeId: string,
    productData: ProductData,
    isPending: boolean,
    setPending: (isPending: boolean) => void,
    setStoreData: (data: StoreData) => void
}) {

    if (productData.length === 0) {
        return (
            <div className="text-center">
                <p className={"text-2xl my-10"}>You do not have any products yet.</p>
            </div>
        );
    } else {

        const productsByCategory: { [key: string]: ProductDataField[] } = {};

        productData.forEach(product => {
            if (!productsByCategory[product.category]) {
                productsByCategory[product.category] = [];
            }
            productsByCategory[product.category].push(product);
        });

        return <ProductList
            storeId={storeId}
            productsByCategories={productsByCategory}
            isPending={isPending}
            setStoreData={setStoreData}
            setPending={setPending}
        />;
    }
}